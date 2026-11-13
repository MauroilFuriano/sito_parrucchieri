import { GoogleGenAI } from '@google/genai';
import { bookableServices, formatPrice, promotions, salon, serviceCategories } from '../src/data/salon';

export interface ChatTurn {
  from: 'salon' | 'visitor';
  text: string;
}

export interface ChatRequest {
  messages: ChatTurn[];
  freeSlots: { day: string; slots: string[] }[];
  today: string;
}

export interface ChatAnswer {
  reply: string;
  bookService: string;
  openBooking: boolean;
}

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_TURNS = 12;
const MAX_CHARS = 600;

const serviceIds = bookableServices.map((service) => service.id);

const salonFacts = [
  `Nome: ${salon.name}, salone unisex.`,
  `Indirizzo: ${salon.address.street}, ${salon.address.city}. Telefono: ${salon.phone}.`,
  `Orari: ${salon.hoursLabel}. ${salon.closedLabel}. Appuntamenti all'ora piena dalle ${salon.slots[0]} alle ${salon.slots[salon.slots.length - 1]}.`,
  'Listino (prezzi di partenza):',
  ...serviceCategories.flatMap((category) =>
    category.services.map((service) => `- ${category.name}: ${service.name}, ${formatPrice(service.priceFrom)}. ${service.description}`),
  ),
  'Promozioni:',
  ...promotions.map((promotion) => `- ${promotion.name}: ${promotion.price}. ${promotion.lines.join(' ')}`),
  `Codici servizio prenotabili: ${bookableServices.map((service) => `${service.id} = ${service.group} ${service.label}`).join('; ')}.`,
].join('\n');

const systemInstruction = (request: ChatRequest) => `Sei l'assistente virtuale di ${salon.name}, un salone di parrucchieri unisex a Roma.
Rispondi sempre in italiano, con tono caldo e professionale, in massimo 3 frasi brevi.
Usa SOLO i dati qui sotto: non inventare prezzi, servizi, promozioni, nomi del personale o orari. Se una cosa non è nei dati, dillo e suggerisci di chiamare il ${salon.phone}.
Non puoi prenotare direttamente: quando il cliente vuole prenotare, invitalo a usare il modulo di prenotazione e imposta openBooking a true.
Se la richiesta riguarda un servizio preciso, imposta bookService con il suo codice; altrimenti stringa vuota.

Oggi è ${request.today}.

DATI DEL SALONE
${salonFacts}

ORARI ANCORA LIBERI (prossimi giorni di apertura)
${request.freeSlots.map((entry) => `- ${entry.day}: ${entry.slots.length ? entry.slots.join(', ') : 'tutto pieno'}`).join('\n')}`;

const responseJsonSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'La risposta da mostrare al cliente, in italiano.' },
    bookService: { type: 'string', enum: ['', ...serviceIds], description: 'Codice del servizio da precompilare nel modulo, o stringa vuota.' },
    openBooking: { type: 'boolean', description: 'true se conviene portare il cliente al modulo di prenotazione.' },
  },
  required: ['reply', 'bookService', 'openBooking'],
};

export function parseChatRequest(body: unknown): ChatRequest | null {
  if (!body || typeof body !== 'object') return null;
  const { messages, freeSlots, today } = body as Partial<ChatRequest>;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const cleanMessages = messages
    .slice(-MAX_TURNS)
    .filter((turn): turn is ChatTurn => !!turn && (turn.from === 'salon' || turn.from === 'visitor') && typeof turn.text === 'string')
    .map((turn) => ({ from: turn.from, text: turn.text.slice(0, MAX_CHARS) }));
  if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].from !== 'visitor') return null;
  const cleanSlots = Array.isArray(freeSlots)
    ? freeSlots.slice(0, 7).map((entry) => ({
        day: String(entry?.day ?? '').slice(0, 40),
        slots: Array.isArray(entry?.slots) ? entry.slots.filter((slot) => salon.slots.includes(slot)) : [],
      }))
    : [];
  return { messages: cleanMessages, freeSlots: cleanSlots, today: String(today ?? '').slice(0, 60) };
}

export async function answerChat(request: ChatRequest): Promise<ChatAnswer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('missing-key');

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    contents: request.messages.map((turn) => ({
      role: turn.from === 'visitor' ? 'user' : 'model',
      parts: [{ text: turn.text }],
    })),
    config: {
      systemInstruction: systemInstruction(request),
      responseMimeType: 'application/json',
      responseJsonSchema,
      temperature: 0.4,
      maxOutputTokens: 400,
    },
  });

  const parsed = JSON.parse(response.text ?? '{}') as Partial<ChatAnswer>;
  if (typeof parsed.reply !== 'string' || !parsed.reply.trim()) throw new Error('empty-reply');
  return {
    reply: parsed.reply.trim(),
    bookService: serviceIds.includes(parsed.bookService as (typeof serviceIds)[number]) ? (parsed.bookService as string) : '',
    openBooking: parsed.openBooking === true,
  };
}
