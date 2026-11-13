import { memo, useMemo, useState } from 'react';
import { BOOKING_WEEKS, bookingWeek, formatDayLabel, weekIndexOf } from '../lib/booking';

interface WeekPickerProps {
  selectedDate: string;
  onSelect: (iso: string) => void;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}

export const WeekPicker = memo(function WeekPicker({ selectedDate, onSelect }: WeekPickerProps) {
  const [weekOffset, setWeekOffset] = useState(() => weekIndexOf(selectedDate));
  const week = useMemo(() => bookingWeek(weekOffset), [weekOffset]);

  const goToWeek = (offset: number) => {
    const next = Math.min(BOOKING_WEEKS - 1, Math.max(0, offset));
    setWeekOffset(next);
    const firstBookable = bookingWeek(next).days.find((day) => !day.isPast);
    if (firstBookable) onSelect(firstBookable.iso);
  };

  return (
    <div className="week-picker">
      <div className="week-picker__nav">
        <button
          type="button"
          className="week-picker__arrow"
          onClick={() => goToWeek(weekOffset - 1)}
          disabled={weekOffset === 0}
          aria-label="Settimana precedente"
        >
          <ChevronIcon direction="left" />
        </button>
        <p id="booking-week-label" className="week-picker__label" aria-live="polite">
          {week.label}
        </p>
        <button
          type="button"
          className="week-picker__arrow"
          onClick={() => goToWeek(weekOffset + 1)}
          disabled={weekOffset === BOOKING_WEEKS - 1}
          aria-label="Settimana successiva"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div id="booking-days" className="days" role="group" aria-labelledby="booking-week-label" tabIndex={-1}>
        {week.days.map((day) => (
          <button
            key={day.iso}
            type="button"
            className="day"
            aria-pressed={day.iso === selectedDate}
            aria-label={day.isPast ? `${formatDayLabel(day)}, non disponibile` : formatDayLabel(day)}
            disabled={day.isPast}
            onClick={() => onSelect(day.iso)}
          >
            <span className="day__weekday">{day.weekday}</span>
            <span className="day__date">{day.dayNumber}</span>
            <span className="day__weekday">{day.month}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
