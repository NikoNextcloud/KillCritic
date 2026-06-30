import React from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import { Profile } from '../types';

type Props = {
  profile: Profile;
  onBack: () => void;
  onRunDeepAnalysis: () => void;
  isAnalyzing: boolean;
};

const moodScore: Record<string, number> = { '😊': 95, '😐': 65, '😔': 38, '😡': 48, '😰': 30 };

export function InsightsPage({ profile, onBack, onRunDeepAnalysis, isAnalyzing }: Props) {
  const totals = profile.costs.reduce(
    (sum, item) => ({
      sleep: sum.sleep + Number(item.sleep || 0),
      money: sum.money + Number(item.money || 0),
      workouts: sum.workouts + Number(item.workouts || 0),
    }),
    { sleep: 0, money: 0, workouts: 0 }
  );

  const recentMoods = profile.moods.slice(-7);
  const chartCols = Array.from({ length: 7 }, (_, i) => recentMoods[i]);

  const reasonCounts = profile.reasons.reduce<Record<string, number>>((all, item) => {
    all[item.reason] = (all[item.reason] || 0) + 1;
    return all;
  }, {});
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
  const patternText = topReason
    ? `Най-често отбелязваш „${topReason[0].toLowerCase()}“. Това е добра точка за ранна грижа.`
    : 'Когато събереш няколко отбелязвания, тук ще видиш своите закономерности.';

  const lastInsight = profile.aiInsights.at(-1);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
        <ChevronLeft className="w-3.5 h-3.5" /> Назад към „Още“
      </button>

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">НЕ БРОИМ ЛИШЕНИЯ</p>
        <h1 className="text-xl font-extrabold font-display text-white leading-tight">
          Ето какво <span className="text-emerald-400">си върна.</span>
        </h1>
      </div>

      <div className="glass rounded-3xl p-5 flex items-center gap-5 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-extrabold font-display text-white">{profile.wins}</span>
          <small className="text-[8px] text-gray-400">добри избора</small>
        </div>
        <div>
          <p className="text-xs text-gray-400">Твоята посока</p>
          <h2 className="text-lg font-extrabold font-display text-white leading-tight mt-1">
            Повече време,
            <br />
            по-малко шум.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass rounded-2xl p-3.5">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ЗАПИСАНИ СЛУЧАИ</small>
          <strong className="block text-xl text-white font-display mt-1">{profile.costs.length}</strong>
        </div>
        <div className="glass rounded-2xl p-3.5">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ЗАГУБЕН СЪН</small>
          <strong className="block text-xl text-white font-display mt-1">{totals.sleep.toFixed(1)} ч.</strong>
        </div>
        <div className="glass rounded-2xl p-3.5">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ОБЩ РАЗХОД</small>
          <strong className="block text-xl text-white font-display mt-1">{totals.money.toFixed(2)} лв.</strong>
        </div>
        <div className="glass rounded-2xl p-3.5">
          <small className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">ПРОПУСНАТИ ТРЕНИРОВКИ</small>
          <strong className="block text-xl text-white font-display mt-1">{totals.workouts}</strong>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 space-y-3 border-indigo-500/20">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">AI АНАЛИЗ</p>
        <h2 className="text-sm font-bold text-white font-display">Свържи точките по-дълбоко</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          {lastInsight ? lastInsight.text : 'След като добавиш записи, AI може да потърси повтарящи се часове, причини и последствия.'}
        </p>
        <div className="flex items-start gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <small className="text-[10px] text-gray-500 leading-relaxed">
            При натискане записите за настроение и последствия се изпращат към настроения AI сървър. GPS координати не се изпращат.
          </small>
        </div>
        <button
          onClick={onRunDeepAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl transition font-display"
        >
          {isAnalyzing ? 'Анализирам…' : 'Анализирай записите'}
        </button>
      </div>

      <div className="glass rounded-3xl p-5 space-y-3">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ПОСЛЕДНИТЕ 7 ДНИ</p>
        <h2 className="text-sm font-bold text-white font-display">Карта на настроенията</h2>
        <div className="flex items-end gap-2 h-32 mt-2">
          {chartCols.map((mood, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-sm">{mood?.emoji || '·'}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400"
                style={{ height: `${mood ? moodScore[mood.emoji] : 8}%` }}
              />
              <small className="text-[8px] text-gray-500">{mood ? new Date(mood.at).toLocaleDateString('bg-BG', { weekday: 'short' }) : '—'}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-5 flex items-start gap-3">
        <span className="text-lg shrink-0">✦</span>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ЛИЧНО ПРОЗРЕНИЕ</p>
          <h2 className="text-sm font-bold text-white leading-snug mt-0.5">{patternText}</h2>
          <p className="text-[11px] text-gray-500 mt-1">Това е наблюдение, не диагноза.</p>
        </div>
      </div>
    </div>
  );
}
