import React, { useState } from 'react';
import { RadarEntry } from '../../types';

type Props = {
  radarEntries: RadarEntry[];
  onAnalyze: (text: string, planned: number, actual: number) => Promise<RadarEntry>;
};

export function RadarModal({ radarEntries, onAnalyze }: Props) {
  const [text, setText] = useState('');
  const [planned, setPlanned] = useState(1);
  const [actual, setActual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RadarEntry | null>(null);

  const history = radarEntries.slice(-5).reverse();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const entry = await onAnalyze(text.trim(), planned, actual);
      setResult(entry);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold">AI РАДАР ЗА САМОЗАБЛУДА</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Какво си казваш в момента?</h2>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Напиши го с твоите думи. Радарът сравнява мисълта с личната ти история.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400">Моята мисъл</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Например: Само една, днес заслужавам..."
          rows={3}
          className="field-input resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400">Колко планираше?</label>
          <input type="number" min={0} value={planned} onChange={(e) => setPlanned(Number(e.target.value))} className="field-input" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400">Колко стана реално?</label>
          <input type="number" min={0} value={actual} onChange={(e) => setActual(Number(e.target.value))} className="field-input" />
        </div>
      </div>

      <p className="text-[10px] text-gray-500 leading-relaxed">
        При анализа текстът и последните записи се изпращат към настроения AI сървър. GPS координати не се изпращат.
      </p>

      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl transition font-display"
      >
        {loading ? 'Анализирам…' : 'Анализирай и запази'}
      </button>

      {result && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 space-y-1.5 animate-fadeIn">
          <strong className="text-xs text-indigo-300 font-display uppercase tracking-wide">{loading ? 'Личен радар' : 'AI анализ'}</strong>
          <p className="text-xs text-gray-200 leading-relaxed">{result.analysis}</p>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5">
          {history.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs font-bold text-white">„{item.text}“</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                план {item.planned} · реално {item.actual} напитки
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
