import { useEffect, useRef, useState, type FormEvent } from 'react';
import { formatPrice, promotions, salon, serviceCategories, type ServiceId } from '../data/salon';
import { fetchFreeSlots, firstBookableDate, formatDayLabel, nextOpenDays } from '../lib/booking';
import { useBooking } from '../lib/bookingContext';
import { ScrollTrigger, useGSAP } from '../lib/motion';

interface ChatReply {
  text: string;
  bookService?: ServiceId | '';
}

interface ChatMessage extends ChatReply {
  id: number;
  from: 'salon' | 'visitor';
}

const suggestions = ['Quanto costa un taglio?', 'Orari liberi domani', 'Promozioni', 'Orari di apertura'];

const findService = (name: string) => serviceCategories.flatMap((category) => category.services).find((service) => service.name === name)!;

async function replyTo(question: string): Promise<ChatReply> {
  const text = question.toLowerCase();

  if (/disponibil|liber|posto|domani|oggi/.test(text)) {
    const asksToday = text.includes('oggi');
    const target = new Date();
    if (!asksToday) target.setDate(target.getDate() + 1);
    const label = asksToday ? 'Oggi' : 'Domani';
    const day = nextOpenDays(1, target)[0];
    const isOpenThatDay = salon.openingDays.includes(target.getDay());
    try {
      const slots = await fetchFreeSlots(day.iso);
      const opening = isOpenThatDay ? label : `${label} siamo chiusi. ${day.weekday} ${day.dayNumber} ${day.month}`;
      if (slots.length === 0) return { text: `${opening} è tutto pieno. Scegli un altro giorno nel modulo.`, bookService: '' };
      return { text: `${opening} sono liberi: ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? ' e altri' : ''}.`, bookService: '' };
    } catch {
      return { text: `Non riesco a leggere l'agenda adesso. Chiamaci allo ${salon.phone}.` };
    }
  }

  if (text.includes('barba')) {
    const beard = findService('Regolazione barba');
    return { text: `${beard.name}: ${beard.description.toLowerCase()} ${formatPrice(beard.priceFrom)}.`, bookService: beard.id };
  }
  if (text.includes('taglio') && text.includes('uomo')) return { text: 'Taglio uomo: classico da 25 €, sfumato da 30 €.', bookService: 'taglio_uomo' };
  if (text.includes('taglio') && text.includes('donna')) return { text: "Taglio donna da 35 €, con consulenza d'immagine.", bookService: 'taglio_donna' };
  if (text.includes('taglio')) return { text: 'Il taglio uomo parte da 25 €, il taglio donna da 35 €. Per chi è?' };
  if (text.includes('piega')) return { text: 'La piega parte da 20 €: lavaggio specifico e styling.', bookService: 'piega_donna' };
  if (/colore|tinta/.test(text)) return { text: 'Il colore parte da 45 €, senza ammoniaca.', bookService: 'colore_donna' };
  if (/balayage|schiarit|meches/.test(text)) return { text: 'Il balayage parte da 80 €, con tonalizzazione.', bookService: 'balayage_donna' };
  if (/sposa|matrimonio/.test(text)) return { text: "Il pacchetto sposa parte da 250 €: prova, trucco e acconciatura, consulenza d'immagine inclusa.", bookService: 'consulenza' };
  if (/promo|scont|offert/.test(text)) {
    return { text: promotions.map((promotion) => `${promotion.name}: ${promotion.price}`).join(' · ') + '. I dettagli sono nella sezione Promozioni.' };
  }
  if (/prezz|costo|quanto/.test(text)) return { text: 'Taglio uomo da 25 €, taglio donna da 35 €, piega da 20 €, colore da 45 €, balayage da 80 €, barba da 15 €.' };
  if (/orari|aperti|apert|chius/.test(text)) return { text: `${salon.hoursLabel}. ${salon.closedLabel}.` };
  if (/dove|indirizzo|via/.test(text)) return { text: `Siamo in ${salon.address.street}, ${salon.address.city}.` };
  if (/prenot|appuntament/.test(text)) return { text: 'Scegli giorno e ora liberi nel modulo di prenotazione: ti porto lì.', bookService: '' };
  if (/ciao|salve|buongiorno|buonasera/.test(text)) return { text: 'Ciao! Chiedimi prezzi, promozioni, orari o posti liberi.' };
  return { text: `Non ho capito. Posso dirti prezzi, promozioni, orari e posti liberi; per il resto chiamaci allo ${salon.phone}.` };
}

async function askGemini(history: ChatMessage[]): Promise<ChatReply | null> {
  try {
    const days = nextOpenDays(10, firstBookableDate());
    const freeSlots = await Promise.all(days.map(async (day) => ({ day: formatDayLabel(day), slots: await fetchFreeSlots(day.iso) })));
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history.slice(1).map((turn) => ({ from: turn.from, text: turn.text })),
        freeSlots,
        today: new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      }),
    });
    if (!response.ok) return null;
    const answer = (await response.json()) as { reply?: string; bookService?: ServiceId | ''; openBooking?: boolean };
    if (!answer.reply) return null;
    return { text: answer.reply, bookService: answer.openBooking || answer.bookService ? (answer.bookService ?? '') : undefined };
  } catch {
    return null;
  }
}

export function Chat() {
  const { goToBooking } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, from: 'salon', text: 'Ciao, sono l\'assistente di Aura. Chiedimi prezzi, promozioni o posti liberi.' },
  ]);
  const [draft, setDraft] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const launcher = launcherRef.current;
    if (!launcher) return;
    launcher.classList.add('is-hidden');
    ScrollTrigger.create({
      trigger: '#after-hero',
      start: 'top 85%',
      onEnter: () => launcher.classList.remove('is-hidden'),
      onLeaveBack: () => launcher.classList.add('is-hidden'),
    });
  });

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const ask = async (question: string) => {
    if (!question.trim() || isThinking) return;
    const visitorTurn: ChatMessage = { id: messages.length, from: 'visitor', text: question };
    const history = [...messages, visitorTurn];
    setMessages(history);
    setDraft('');
    setIsThinking(true);
    const reply = (await askGemini(history)) ?? (await replyTo(question));
    setIsThinking(false);
    setMessages((log) => [...log, { id: log.length, from: 'salon', ...reply }]);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft);
  };

  return (
    <>
      {isOpen && (
          <div
            className="chat"
            role="dialog"
            aria-label="Assistente del salone"
            onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}
          >
            <div className="chat__head">
              <p className="chat__title">Assistente Aura</p>
              <button type="button" className="chat__close" onClick={() => setIsOpen(false)}>
                Chiudi
              </button>
            </div>
            <div ref={logRef} className="chat__log" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={message.from === 'visitor' ? 'chat__bubble chat__bubble--me' : 'chat__bubble'}>
                  <p>{message.text}</p>
                  {message.bookService !== undefined && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setIsOpen(false);
                        goToBooking({ service: message.bookService });
                      }}
                    >
                      Vai alla prenotazione
                    </button>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="chat__bubble chat__bubble--typing" aria-label="L'assistente sta scrivendo">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
            <div className="chat__suggestions">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" className="chat__suggestion" onClick={() => void ask(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
            <form className="chat__form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="chat-question">
                La tua domanda
              </label>
              <input
                ref={inputRef}
                id="chat-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Scrivi una domanda"
                autoComplete="off"
              />
              <button type="submit" className="button">
                Invia
              </button>
            </form>
          </div>
        )}
      <div ref={launcherRef} className="chat-launcher">
        <button type="button" className="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
          {isOpen ? (
            'Chiudi la chat'
          ) : (
            <>
              <span className="chat-launcher__long">Domande? Scrivici</span>
              <span className="chat-launcher__short">Chat</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
