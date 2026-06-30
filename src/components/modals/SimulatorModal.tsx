import React, { useState } from 'react';

export function SimulatorModal({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(5);

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-[#ff8e75] uppercase tracking-widest font-bold">СИМУЛАТОР „СЛЕД 6 ЧАСА“</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Нека видим целия сценарий.</h2>
        <p className="text-xs text-gray-400 mt-1.5">Това е ориентир, не медицинска прогноза.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-300">
          <span>Колко напитки обмисляш?</span>
          <span className="text-[#ff8e75] font-mono">{count} напитки</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff8e75]"
        />
      </div>

      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1.5">
        <strong className="text-xs text-white font-display">Възможният утрешен отпечатък</strong>
        <p className="text-xs text-gray-300 leading-relaxed">
          ≈ {Math.round(count * 55)} мин. нарушен сън
          <br />≈ {count * 6} лв. разход
          <br />
          Енергия: −{Math.min(70, count * 8)}%
        </p>
      </div>

      <button onClick={onClose} className="w-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs py-3 rounded-2xl transition font-display">
        Добре, видях го
      </button>
    </div>
  );
}
