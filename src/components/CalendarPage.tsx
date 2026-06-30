import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Profile } from '../types';
import { localDateKey } from '../hooks/useProfile';
import { calendarStatistics, monthStatistics } from '../data/content';

type Props = {
  profile: Profile;
  onCycleDay: (key: string) => void;
};

const weekdayLabels = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];

type DayCell = { blank: false; key: string; day: number; state: '' | 'sober' | 'drink'; isToday: boolean; isFuture: boolean };

function CalendarDayButton({ cell, onClick }: { cell: DayCell; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-lg text-[11px] font-bold flex items-center justify-center transition relative ${
        cell.state === 'sober'
          ? 'bg-emerald-500 text-white'
          : cell.state === 'drink'
          ? 'bg-red-500/80 text-white'
          : 'bg-white/5 text-gray-400 hover:bg-white/10'
      } ${cell.isToday ? 'ring-2 ring-emerald-300' : ''} ${cell.isFuture ? 'opacity-30 pointer-events-none' : ''}`}
    >
      {cell.day}
    </button>
  );
}

export function CalendarPage({ profile, onCycleDay }: Props) {
  const [cursor, setCursor] = useState(new Date());

  const { sober, drink, success } = monthStatistics(profile, cursor);
  const stats = calendarStatistics(profile);

  const cells = useMemo<
    Array<
      | { blank: true; key: string }
      | { blank: false; key: string; day: number; state: '' | 'sober' | 'drink'; isToday: boolean; isFuture: boolean }
    >
  >(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = localDateKey();
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    const blanks: Array<{ blank: true; key: string }> = Array.from({ length: firstWeekday }, (_, i) => ({ blank: true as const, key: `b${i}` }));
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const key = localDateKey(date);
      return {
        blank: false as const,
        key,
        day,
        state: (profile.sobrietyDays[key] || '') as '' | 'sober' | 'drink',
        isToday: key === todayKey,
        isFuture: date > endOfToday,
      };
    });
    return [...blanks, ...days];
  }, [cursor, profile.sobrietyDays]);

  const monthLabel = new Intl.DateTimeFormat('bg-BG', { month: 'long', year: 'numeric' }).format(cursor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">КАЛЕНДАР НА ТРЕЗВЕНОСТТА</p>
          <h1 className="text-xl font-extrabold font-display text-white leading-tight">
            Виж своята <span className="text-emerald-400">посока.</span>
          </h1>
        </div>
        <span className="text-2xl text-gray-600">▦</span>
      </div>

      <div className="glass rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-white font-display capitalize">{monthLabel}</h2>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-500 font-bold">
          {weekdayLabels.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            if (cell.blank) return <span key={cell.key} />;
            return <CalendarDayButton key={cell.key} cell={cell as DayCell} onClick={() => onCycleDay(cell.key)} />;
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
          <span className="flex items-center gap-1.5">
            <i className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Трезвен ден
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-2 h-2 rounded-full bg-red-500/80 inline-block" /> Ден с алкохол
          </span>
          <span>Докосни ден за промяна</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass rounded-2xl p-3.5 text-center">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ТРЕЗВИ ДНИ</small>
          <strong className="block text-xl text-emerald-400 font-display mt-1">{sober}</strong>
        </div>
        <div className="glass rounded-2xl p-3.5 text-center">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ДНИ С АЛКОХОЛ</small>
          <strong className="block text-xl text-red-400 font-display mt-1">{drink}</strong>
        </div>
        <div className="glass rounded-2xl p-3.5 text-center">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">УСПЕВАЕМОСТ</small>
          <strong className="block text-xl text-white font-display mt-1">{success}%</strong>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 space-y-4">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ОБЩА СТАТИСТИКА</p>
          <h2 className="text-sm font-bold text-white font-display">Твоята последователност</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/5 rounded-2xl p-3.5 text-center border border-white/5">
            <span className="text-lg">🔥</span>
            <strong className="block text-lg text-white font-display mt-1">{stats.current}</strong>
            <small className="text-[9px] text-gray-500">текуща серия</small>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 text-center border border-white/5">
            <span className="text-lg">🏆</span>
            <strong className="block text-lg text-white font-display mt-1">{stats.best}</strong>
            <small className="text-[9px] text-gray-500">най-добра серия</small>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 text-center border border-white/5">
            <span className="text-lg">✓</span>
            <strong className="block text-lg text-white font-display mt-1">{stats.allSober}</strong>
            <small className="text-[9px] text-gray-500">общо трезви дни</small>
          </div>
          <div className="bg-white/5 rounded-2xl p-3.5 text-center border border-white/5">
            <span className="text-lg">30</span>
            <strong className="block text-lg text-white font-display mt-1">{stats.recentPercent}%</strong>
            <small className="text-[9px] text-gray-500">последни 30 дни</small>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1.5">Последни 30 дни</p>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${stats.recentPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
