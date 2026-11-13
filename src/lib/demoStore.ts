// Demo mode: the site is deployed as static files, so bookings live in the visitor's browser
// under the same key the previous version used.
const STORAGE_KEY = 'appointments';

export interface StoredAppointment {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
}

export function readAppointments(): StoredAppointment[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAppointments(appointments: StoredAppointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch {
    throw new Error('storage');
  }
}

export function bookedTimes(date: string) {
  return readAppointments()
    .filter((appointment) => appointment.date === date)
    .map((appointment) => appointment.time);
}

export function addAppointment(appointment: Omit<StoredAppointment, 'id'>) {
  const appointments = readAppointments();
  if (appointments.some((existing) => existing.date === appointment.date && existing.time === appointment.time)) {
    throw new Error('Slot already booked');
  }
  const stored = { ...appointment, id: Date.now() };
  writeAppointments([...appointments, stored]);
  return stored;
}

export function removeAppointment(id: number) {
  writeAppointments(readAppointments().filter((appointment) => appointment.id !== id));
}

export const DEMO_ADMIN_PASSWORD = 'admin123';
