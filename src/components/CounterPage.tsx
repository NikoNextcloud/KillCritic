import React from 'react';
import { Share2 } from 'lucide-react';
import { Profile, SobrietyParts } from '../types';
import { formatDuration } from '../hooks/useProfile';

type Props = {
  profile: Profile;
  parts: SobrietyParts;
  totalDays: number;
  onStart: () => void;
  onStop: () => void;
  onShare: () => void;
};

const units: { key: keyof SobrietyParts; label: string }[] = [
  { key: 'years', label: 'години' },
  { key: 'months', label: 'месеца' },
  { key: 'days', label: 'дни' },
  { key: 'hours', label: 'часа' },
  { key: 'minutes', label: 'минути' },
  { key: 'seconds', label: 'секунди' },
];

export function CounterPage({ profile, parts, totalDays, onStart, onStop, onShare }: Props) {
  const started = Boolean(profile.soberStart);
  const sessions = [...profile.soberSessions].reverse();

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 flex flex-col items-center text-center relative overflow-hidden emerald-glow">
        <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 text-[9px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-widest font-mono">
          {started ? 'ACTIVE SOBER' : 'СПРЯН'}
        </div>

        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 font-bold mt-2">МОЯТ ПЪТ БЕЗ АЛКОХОЛ</p>
        <h1 className="text-xl font-extrabold font-display text-white leading-tight">
          Всяка секунда <span className="text-emerald-400">е твоя.</span>
        </h1>

        <div className="grid grid-cols-3 gap-2 w-full mt-5">
          {units.map((unit) => (
            <div key={unit.key} className="bg-white/5 border border-white/5 rounded-2xl py-3 px-1">
              <p className="text-2xl font-extrabold font-display font-mono text-emerald-400">{parts[unit.key]}</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{unit.label}</p>
            </div>
          ))}
        </div>

        <div className="w-full grid grid-cols-3 gap-2 mt-5">
          <button
            onClick={onStart}
            disabled={started}
            className="col-span-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[11px] py-3 rounded-2xl transition font-display"
          >
            {started ? '✓ Активна' : 'Трезвеност'}
          </button>
          <button
            onClick={onStop}
            disabled={!started}
            className="col-span-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[11px] py-3 rounded-2xl transition border border-white/10"
          >
            ■ Спри
          </button>
          <button
            onClick={onShare}
            disabled={!started}
            className="col-span-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[11px] py-3 rounded-2xl transition border border-white/10 flex items-center justify-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" /> Сподели
          </button>
        </div>

        <p className="text-[11px] text-gray-400 mt-3">
          {started
            ? `Начало: ${new Date(profile.soberStart).toLocaleString('bg-BG', { dateStyle: 'long', timeStyle: 'short' })}`
            : 'Броячът е спрян. Натисни „Трезвеност“, когато си готов.'}
        </p>
      </div>

      <div className="glass rounded-3xl p-5 flex items-start gap-3">
        <span className="text-lg mt-0.5">✦</span>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">ТВОЯТ ПРОГРЕС</p>
          <h2 className="text-sm text-white font-semibold leading-relaxed">
            {totalDays > 0
              ? `${totalDays} ${totalDays === 1 ? 'цял ден е' : 'цели дни са'} вече зад теб. Продължи само с днешния.`
              : 'Не е нужно да мислиш за завинаги. Само за днес.'}
          </h2>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ЗАПАЗЕНИ ПОСТИЖЕНИЯ</p>
            <h2 className="text-sm font-bold text-white font-display">История на брояча</h2>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">
            {sessions.length} {sessions.length === 1 ? 'запис' : 'записа'}
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-3">Предишните постижения ще се пазят тук.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sessions.map((session, index) => (
              <div key={session.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                  {sessions.length - index}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {new Date(session.start).toLocaleDateString('bg-BG')} – {new Date(session.end).toLocaleDateString('bg-BG')}
                  </p>
                  <p className="text-[10px] text-gray-500">{session.action === 'reset' ? 'Нулиран и започнат отново' : 'Броячът е спрян'}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0">{formatDuration(session.durationMs)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
