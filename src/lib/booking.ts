import { salon, type ServiceId } from '../data/salon';
import { addAppointment, bookedTimes } from './demoStore';

export interface OpenDay {
  iso: string;
  weekday: string;
  dayNumber: string;
  month: string;
}

const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayIso = () => toIsoDate(new Date());

const LAST_SLOT_HOUR = Number(salon.slots[salon.slots.length - 1].slice(0, 2));

/** The first day a visitor can still book: today before the last slot, otherwise the next opening day. */
export function firstBookableDate(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() >= LAST_SLOT_HOUR) start.setDate(start.getDate() + 1);
  while (!salon.openingDays.includes(start.getDay())) start.setDate(start.getDate() + 1);
  return start;
}

export const firstBookableIso = () => toIsoDate(firstBookableDate());

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatDayLabel = (day: OpenDay) => capitalize(`${day.weekday} ${day.dayNumber} ${day.month}`);

export function nextOpenDays(count: number, from = new Date()): OpenDay[] {
  const days: OpenDay[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    if (salon.openingDays.includes(cursor.getDay())) {
      days.push({
        iso: toIsoDate(cursor),
        weekday: cursor.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', ''),
        dayNumber: String(cursor.getDate()),
        month: cursor.toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export interface WeekDay extends OpenDay {
  isPast: boolean;
}

export interface BookingWeek {
  label: string;
  days: WeekDay[];
}

export const BOOKING_WEEKS = 8;

const toOpenDay = (date: Date): OpenDay => ({
  iso: toIsoDate(date),
  weekday: date.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', ''),
  dayNumber: String(date.getDate()),
  month: date.toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''),
});

/** The salon's opening days (Tue–Sat) of the week `offset` weeks after the first bookable day. */
export function bookingWeek(offset: number, from = firstBookableDate()): BookingWeek {
  const monday = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  const firstIso = toIsoDate(from);
  const days = [...salon.openingDays]
    .sort((a, b) => a - b)
    .map((weekday) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + ((weekday + 6) % 7));
      const day = toOpenDay(date);
      return { ...day, isPast: day.iso < firstIso };
    });
  const first = days[0];
  const last = days[days.length - 1];
  const firstDate = new Date(`${first.iso}T12:00:00`);
  const lastDate = new Date(`${last.iso}T12:00:00`);
  const sameMonth = firstDate.getMonth() === lastDate.getMonth();
  const monthLong = (date: Date) => date.toLocaleDateString('it-IT', { month: 'long' });
  const label = sameMonth
    ? `${first.dayNumber} – ${last.dayNumber} ${monthLong(lastDate)}`
    : `${first.dayNumber} ${monthLong(firstDate)} – ${last.dayNumber} ${monthLong(lastDate)}`;
  return { label, days };
}

export const dayFromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toOpenDay(new Date(y, m - 1, d));
};

export function weekIndexOf(iso: string, from = firstBookableDate()) {
  for (let offset = 0; offset < BOOKING_WEEKS; offset++) {
    if (bookingWeek(offset, from).days.some((day) => day.iso === iso)) return offset;
  }
  return 0;
}

export function isOpenDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return salon.openingDays.includes(new Date(y, m - 1, d).getDay());
}

export async function fetchFreeSlots(iso: string): Promise<string[]> {
  if (!isOpenDay(iso) || iso < todayIso()) return [];
  const taken = bookedTimes(iso);
  const free = salon.slots.filter((slot) => !taken.includes(slot));
  if (iso !== todayIso()) return free;
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return free.filter((slot) => Number(slot.slice(0, 2)) > currentHour);
}

export interface BookingRequest {
  name: string;
  phone: string;
  service: ServiceId;
  date: string;
  time: string;
}

export async function createBooking(request: BookingRequest) {
  if (!request.name || !request.phone || !request.service || !request.date || !request.time) throw new Error('All fields are required');
  if (request.date < todayIso()) throw new Error('Date in the past');
  if (!isOpenDay(request.date)) throw new Error('Salon closed on this day');
  if (!salon.slots.includes(request.time)) throw new Error('Invalid time');
  return addAppointment(request);
}

export const bookingErrorText: Record<string, string> = {
  'Slot already booked': 'Quell\'ora è appena stata presa. Scegline un\'altra.',
  'Salon closed on this day': 'Quel giorno il salone è chiuso. Scegli un giorno tra martedì e sabato.',
  'Date in the past': 'La data è già passata. Scegline una a partire da oggi.',
  'Invalid time': 'Scegli uno degli orari proposti.',
  'Invalid service': 'Scegli un servizio dall\'elenco.',
  'All fields are required': 'Compila tutti i campi.',
  storage: 'Il browser non permette di salvare la prenotazione (navigazione privata?). Chiamaci allo 06 12345678.',
};
