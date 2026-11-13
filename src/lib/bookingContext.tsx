import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ServiceId } from '../data/salon';
import { scrollToTarget } from './motion';

interface BookingIntent {
  service: ServiceId | '';
  date: string;
  time: string;
}

interface BookingContextValue {
  intent: BookingIntent;
  setIntent: (next: Partial<BookingIntent>) => void;
  goToBooking: (next?: Partial<BookingIntent>) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [intent, setIntentState] = useState<BookingIntent>({ service: '', date: '', time: '' });

  const setIntent = useCallback((next: Partial<BookingIntent>) => {
    setIntentState((current) => ({ ...current, ...next }));
  }, []);

  const goToBooking = useCallback(
    (next?: Partial<BookingIntent>) => {
      if (next) setIntent(next);
      scrollToTarget('#prenota');
      window.setTimeout(() => document.getElementById('booking-days')?.focus({ preventScroll: true }), 1500);
    },
    [setIntent],
  );

  const value = useMemo(() => ({ intent, setIntent, goToBooking }), [intent, setIntent, goToBooking]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking outside BookingProvider');
  return context;
}
