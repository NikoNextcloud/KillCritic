import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

type Props = {
  onCreate: (name: string) => void;
};

export function Onboarding({ onCreate }: Props) {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#e5e7eb] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md glass rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
          <Sparkles className="w-7 h-7" />
        </div>

        <div>
          <p className="text-[10px] text-red-500 uppercase tracking-widest font-extrabold mb-2">ТВОЕТО НАЧАЛО</p>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
            Започваме от нула.
            <br />
            Без чужди числа.
          </h1>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Въведи име или прякор. Всички победи, записи и анализи ще бъдат само твои.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onCreate(name.trim());
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Как да те наричаме?</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Например: Алекс"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl transition disabled:opacity-40 disabled:cursor-not-allowed font-display uppercase tracking-wider"
          >
            Създай моя профил
          </button>
        </form>
      </div>
    </div>
  );
}
