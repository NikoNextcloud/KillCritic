import React, { useState } from 'react';
import { reasonOptions } from '../../data/content';

export function ReasonModal({ onSave }: { onSave: (reason: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold">БЕЗ ПИСАНЕ</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Какво стои под желанието?</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {reasonOptions.map((reason) => (
          <button
            key={reason}
            onClick={() => setSelected(reason)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
              selected === reason ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSave(selected)}
        disabled={!selected}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-2xl transition font-display"
      >
        Запази наблюдението
      </button>
    </div>
  );
}
