import React from 'react';
import { ArrowUpRight, Circle, Flame, RotateCcw } from 'lucide-react';
import { Profile } from '../types';
import { moodOptions } from '../data/content';

type Props = {
  profile: Profile;
  onOpenInsights: () => void;
  onOpenYou: () => void;
  onStartCraving: () => void;
  onSelectMood: (mood: string, emoji: string) => void;
  onOpenSimulator: () => void;
  onOpenMessage: () => void;
  onOpenReason: () => void;
  onOpenPlaces: () => void;
  onOpenCost: () => void;
  onOpenRadar: () => void;
  mission: string;
  onNewMission: () => void;
  onCompleteMission: () => void;
};

const tools = [
  { id: 'sim', color: 'from-[#ff8e75]/20 to-[#ff8e75]/5 border-[#ff8e75]/20', icon: '6h', title: 'След 6 часа', desc: 'Виж реалната цена на избора, преди да го направиш.' },
  { id: 'msg', color: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20', icon: '▶', title: 'Послание от теб', desc: 'Запиши гласа на трезвото си аз за трудните моменти.' },
  { id: 'breathe', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20', icon: '◌', title: 'Само 5 минути', desc: 'Дишане, лично послание и човек за контакт.' },
  { id: 'reason', color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20', icon: '✦', title: 'Какво стои отдолу?', desc: 'Отбележи причината с едно докосване.' },
  { id: 'places', color: 'from-sky-500/20 to-sky-500/5 border-sky-500/20', icon: '⌖', title: 'Рискови места', desc: 'Запази място и получи предупреждение, когато отново си близо.' },
  { id: 'cost', color: 'from-rose-500/20 to-rose-500/5 border-rose-500/20', icon: '∑', title: 'Истинската цена', desc: 'Въведи сам сън, енергия, тревожност, тренировки и продуктивност.' },
  { id: 'radar', color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20', icon: 'AI', title: 'Радар за самозаблуда', desc: 'Напиши мисълта си и виж дали повтаря стар модел.' },
] as const;

export function MorePage({
  profile,
  onOpenInsights,
  onOpenYou,
  onStartCraving,
  onSelectMood,
  onOpenSimulator,
  onOpenMessage,
  onOpenReason,
  onOpenPlaces,
  onOpenCost,
  onOpenRadar,
  mission,
  onNewMission,
  onCompleteMission,
}: Props) {
  const lastMood = profile.moods.at(-1);
  const todayLabel = new Intl.DateTimeFormat('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  const handleToolClick = (id: (typeof tools)[number]['id']) => {
    if (id === 'sim') onOpenSimulator();
    if (id === 'msg') onOpenMessage();
    if (id === 'breathe') onStartCraving();
    if (id === 'reason') onOpenReason();
    if (id === 'places') onOpenPlaces();
    if (id === 'cost') onOpenCost();
    if (id === 'radar') onOpenRadar();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ВСИЧКО ОСТАНАЛО</p>
        <h1 className="text-xl font-extrabold font-display text-white leading-tight">
          Инструменти <span className="text-emerald-400">и профил.</span>
        </h1>
        <div className="flex gap-2 mt-3">
          <button onClick={onOpenInsights} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-xs text-gray-300 px-3 py-2 rounded-xl border border-white/5 transition">
            <ArrowUpRight className="w-3.5 h-3.5" /> Моите победи
          </button>
          <button onClick={onOpenYou} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-xs text-gray-300 px-3 py-2 rounded-xl border border-white/5 transition">
            <Circle className="w-3.5 h-3.5" /> Моят профил
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold capitalize">{todayLabel}</p>
          <h2 className="text-lg font-extrabold font-display text-white">
            Как си <span className="text-emerald-400">точно сега?</span>
          </h2>
        </div>
        <div className="w-12 h-12 rounded-full border border-dashed border-white/15 flex items-center justify-center text-xl">☀</div>
      </div>

      <button
        onClick={onStartCraving}
        className="w-full glass rounded-3xl p-6 flex items-center justify-between text-left relative overflow-hidden radar-glow border-red-500/15"
      >
        <div>
          <small className="text-[9px] text-red-400 font-bold uppercase tracking-widest">БЕЗ ОБЯСНЕНИЯ. БЕЗ ВИНА.</small>
          <h2 className="text-2xl font-extrabold font-display text-white mt-2">Имам желание</h2>
          <p className="text-xs text-gray-400 mt-1">Нека преминем през вълната заедно →</p>
        </div>
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center shrink-0">
          <Flame className="w-7 h-7 text-red-400" />
        </div>
      </button>

      <div className="glass rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ЕДНО ДОКОСВАНЕ</p>
            <h2 className="text-sm font-bold text-white font-display">Отбележи настроението</h2>
          </div>
          <span className="text-[10px] text-gray-500">{lastMood ? lastMood.mood.toLowerCase() : 'не е избрано'}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((m) => (
            <button
              key={m.mood}
              onClick={() => onSelectMood(m.mood, m.emoji)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition ${
                lastMood?.mood === m.mood ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <small className="text-[9px] text-gray-400">{m.label}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-1">ПОМОЩ В ТОЧНИЯ МОМЕНТ — Какво ще ти помогне сега?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`glass bg-gradient-to-br ${tool.color} rounded-2xl p-4 text-left flex flex-col justify-between min-h-[140px] transition hover:-translate-y-0.5`}
            >
              <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold font-display text-white">{tool.icon}</span>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-white font-display leading-tight">{tool.title}</h3>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-xl shrink-0 text-indigo-300">◎</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">МИСИЯ ЗА ДНЕС</p>
          <h2 className="text-sm font-bold text-white leading-snug mt-0.5">{mission}</h2>
          <button onClick={onNewMission} className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
            Друга мисия <RotateCcw className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={onCompleteMission}
          aria-label="Завърши мисия"
          className="w-10 h-10 rounded-full border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0 hover:bg-emerald-500 hover:text-white transition"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
