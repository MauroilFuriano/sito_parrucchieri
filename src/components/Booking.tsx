import { useEffect, useRef, useState, type FormEvent } from 'react';
import { bookableServices, type ServiceId } from '../data/salon';
import { bookingErrorText, createBooking, dayFromIso, fetchFreeSlots, firstBookableIso, formatDayLabel, todayIso } from '../lib/booking';
import { useBooking } from '../lib/bookingContext';
import { gsap, MOTION_OK, revealWords, useGSAP } from '../lib/motion';
import { ArrowIcon } from './ArrowIcon';
import { WeekPicker } from './WeekPicker';

type SlotState = { status: 'loading' } | { status: 'ready'; slots: string[] } | { status: 'error' };
type SubmitState = { status: 'idle' } | { status: 'sending' } | { status: 'done'; summary: string } | { status: 'error'; message: string };

const serviceGroups = Array.from(new Set(bookableServices.map((service) => service.group)));

export function Booking() {
  const { intent, setIntent } = useBooking();
  const selectedDate = intent.date || firstBookableIso();
  const [slotState, setSlotState] = useState<SlotState>({ status: 'loading' });
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [refreshKey, setRefreshKey] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = titleRef.current ? revealWords(titleRef.current) : null;
        gsap.from('.booking__card', {
          y: 60,
          opacity: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.booking__card', start: 'top 85%', once: true },
        });
        return () => split?.revert();
      });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (slotState.status !== 'ready' || !slotsRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(slotsRef.current!.querySelectorAll('.slot'), { y: 12, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.03 });
      });
    },
    { dependencies: [slotState], scope: slotsRef },
  );

  useEffect(() => {
    let cancelled = false;
    setSlotState({ status: 'loading' });
    fetchFreeSlots(selectedDate)
      .then((slots) => !cancelled && setSlotState({ status: 'ready', slots }))
      .catch(() => !cancelled && setSlotState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [selectedDate, refreshKey]);

  const dayLabel = formatDayLabel(dayFromIso(selectedDate));
  const isToday = selectedDate === todayIso();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!intent.time) {
      setSubmitState({ status: 'error', message: 'Scegli prima un orario libero.' });
      return;
    }
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    setSubmitState({ status: 'sending' });
    try {
      await createBooking({
        name: String(formData.get('name')).trim(),
        phone: String(formData.get('phone')).trim(),
        service: String(formData.get('service')) as ServiceId,
        date: selectedDate,
        time: intent.time,
      });
      setSubmitState({ status: 'done', summary: `${dayLabel.toLowerCase()} alle ${intent.time}` });
      form.reset();
      setIntent({ time: '', service: '' });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      setSubmitState({ status: 'error', message: bookingErrorText[code] ?? 'Non siamo riusciti a registrare la prenotazione. Riprova o chiamaci.' });
      if (code === 'Slot already booked') setRefreshKey((key) => key + 1);
    }
  };

  return (
    <section ref={rootRef} id="prenota" className="section wrap" aria-labelledby="prenota-title">
      <div className="booking__grid">
        <div className="booking__intro">
          <h2 id="prenota-title" ref={titleRef} className="section-title">
            Prenota il tuo <em>orario</em>
          </h2>
          <p>Qui vedi gli orari ancora liberi in agenda. Scegli giorno e ora, lascia nome e telefono: la prenotazione arriva subito al salone.</p>
        </div>

        <div className="booking__card">
          <p className="booking__step">Giorno</p>
          <WeekPicker selectedDate={selectedDate} onSelect={(iso) => setIntent({ date: iso, time: '' })} />

          <div ref={slotsRef} className="slots" role="group" aria-label={`Orari liberi ${dayLabel}`} aria-live="polite">
            {slotState.status === 'loading' && <p className="slots__status">Controllo l'agenda…</p>}
            {slotState.status === 'error' && <p className="slots__status">Non riesco a leggere l'agenda adesso. Chiamaci allo 06 12345678.</p>}
            {slotState.status === 'ready' && slotState.slots.length === 0 && (
              <p className="slots__status">
                {isToday ? 'Per oggi gli orari sono finiti. Scegli un altro giorno.' : `${dayLabel}: è tutto pieno. Prova un altro giorno.`}
              </p>
            )}
            {slotState.status === 'ready' &&
              slotState.slots.map((slot) => (
                <button
                  key={`${selectedDate}-${slot}`}
                  type="button"
                  className="slot"
                  aria-pressed={intent.time === slot}
                  onClick={() => setIntent({ time: slot })}
                >
                  {slot}
                </button>
              ))}
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <p className="form__choice" aria-live="polite">
              {intent.time ? `${dayLabel}, ore ${intent.time}` : `${dayLabel}: scegli un orario`}
            </p>
            <label className="field field--wide">
              <span className="sr-only">Servizio</span>
              <select name="service" required value={intent.service} onChange={(event) => setIntent({ service: event.target.value as ServiceId })}>
                <option value="">Scegli il servizio</option>
                {serviceGroups.map((group) => (
                  <optgroup key={group} label={group}>
                    {bookableServices
                      .filter((service) => service.group === group)
                      .map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="field field--wide">
              <span className="sr-only">Nome e cognome</span>
              <input name="name" type="text" autoComplete="name" placeholder="Nome e cognome" required />
            </label>
            <label className="field field--wide">
              <span className="sr-only">Telefono</span>
              <input name="phone" type="tel" autoComplete="tel" placeholder="Telefono" required />
            </label>
            <button type="submit" className="button form__submit" disabled={submitState.status === 'sending'}>
              {submitState.status === 'sending' ? 'Invio in corso…' : 'Conferma la prenotazione'}
              {submitState.status !== 'sending' && <ArrowIcon />}
            </button>
            <p
              className={submitState.status === 'error' ? 'form__message form__message--error' : 'form__message'}
              role="status"
            >
              {submitState.status === 'done' && `Fatto: ti aspettiamo ${submitState.summary}. La prenotazione è già nell'area riservata del salone.`}
              {submitState.status === 'error' && submitState.message}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
