import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Profile } from '../types';
import { todayChallenges } from '../data/content';
import { localDateKey } from '../hooks/useProfile';

type Props = {
  profile: Profile;
  onToggle: (index: number) => void;
  onRefresh: () => void;
};

export function ChallengesPage({ profile, onToggle, onRefresh }: Props) {
  const key = localDateKey();
  const completed = profile.challengeCompletions[key] || [];
  const items = todayChallenges(profile);
  const dateLabel = new Intl.DateTimeFormat('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-5 space-y-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">МАЛКИ ДЕЙСТВИЯ, ИСТИНСКА ПРОМЯНА</p>
        <h1 className="text-xl font-extrabold font-display text-white leading-tight">
          Твоят план <span className="text-emerald-400">за днес.</span>
        </h1>
        <p className="text-xs text-gray-400 capitalize">{dateLabel}</p>

        <div className="flex items-center justify-between pt-1">
          <div>
            <strong className="text-sm text-white font-display">{completed.length} от 6</strong>
            <span className="text-[10px] text-gray-500 ml-1.5">завършени</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${(completed.length / 6) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map(([emoji, title, desc], index) => {
          const done = completed.includes(index);
          return (
            <button
              key={index}
              onClick={() => onToggle(index)}
              className={`w-full glass rounded-2xl p-4 flex items-center gap-3 text-left transition ${done ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
            >
              <span className="text-2xl shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white">{title}</h2>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <span
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition ${
                  done ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/15 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onRefresh}
        className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-3 rounded-2xl transition border border-white/5 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Дай ми различни предизвикателства
      </button>
    </div>
  );
}
