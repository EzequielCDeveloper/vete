import { useMemo } from 'react';
import styles from './WeekCalendar.module.css';

interface WeekCalendarProps {
  onSelectDay: (date: string) => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
}

export function WeekCalendar({ onSelectDay }: WeekCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => getStartOfWeek(today), [today]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = formatDate(date);
      return {
        date: dateStr,
        dayName: DAY_NAMES[date.getDay()],
        dayNum: date.getDate(),
        isToday: isToday(date),
      };
    });
  }, [weekStart]);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <span className={styles.monthLabel}>
          {weekStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      <div className={styles.weekGrid}>
        {days.map((day) => (
          <button
            key={day.date}
            className={`${styles.dayCard} ${day.isToday ? styles.today : ''}`}
            onClick={() => onSelectDay(day.date)}
          >
            <span className={styles.dayName}>{day.dayName}</span>
            <span className={styles.dayNum}>{day.dayNum}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
