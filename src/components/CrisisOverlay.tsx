import React, { useEffect, useRef, useState } from 'react';
import { Flame, Phone, X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSurvived: () => void;
  onSaveIntensity: (level: number) => void;
  contact: string;
  audioUrl: string;
};

export function CrisisOverlay({ open, onClose, onSurvived, onSaveIntensity, contact, audioUrl }: Props) {
  const [remaining, setRemaining] = useState(300);
  const [breathTick, setBreathTick] = useState(0);
  const [intensity, setIntensity] = useState(7);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setRemaining(300);
    setBreathTick(0);
    setFinished(false);
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          setFinished(true);
          onSurvived();
          return 0;
        }
        return prev - 1;
      });
      setBreathTick((t) => t + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const phase = breathTick % 8 < 4 ? 'Вдишай' : 'Издишай';
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-center p-6 animate-fadeIn overflow-y-auto">
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 py-5">
        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-display text-sm">K</span>
        <button onClick={onClose} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-full border border-white/10 transition">
          Изход <X className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="text-center space-y-6 max-w-xs w-full my-auto">
        <p className="text-[10px] text-red-500 uppercase tracking-widest font-extrabold">ВЪЛНАТА СЕ ДВИЖИ. ТИ НЕ СИ ВЪЛНАТА.</p>

        <h2 className="text-2xl font-black font-display text-white leading-tight">
          {finished ? (
            <>
              Ти остана.
              <br />
              Вълната се промени.
            </>
          ) : (
            <>
              Остани тук
              <br />
              за следващия дъх.
            </>
          )}
        </h2>

        <div className="text-4xl font-extrabold font-display text-emerald-400 font-mono tracking-tight">
          {minutes}:{seconds}
        </div>

        {/* Breath animation ring */}
        <div className="my-8 flex items-center justify-center h-44">
          <div
            className="rounded-full bg-emerald-500/15 border border-emerald-400 flex items-center justify-center text-emerald-300 font-extrabold text-sm shadow-2xl shadow-emerald-500/10 transition-all duration-[4000ms] ease-in-out font-mono uppercase tracking-widest"
            style={{
              width: phase === 'Вдишай' ? '170px' : '110px',
              height: phase === 'Вдишай' ? '170px' : '110px',
            }}
          >
            {phase}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 text-left space-y-2.5">
          <label className="flex justify-between text-xs font-bold text-gray-300">
            <span>Колко силно е сега?</span>
            <span className="text-emerald-400 font-mono">{intensity}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => (audioUrl ? new Audio(audioUrl).play() : undefined)}
            disabled={!audioUrl}
            className="bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5 border border-white/5"
          >
            <Flame className="w-3.5 h-3.5 text-emerald-400" /> Послание от мен
          </button>
          <a
            href={`tel:${contact || '112'}`}
            className="bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" /> Обади се
          </a>
        </div>

        <button
          onClick={() => {
            onSaveIntensity(intensity);
            onClose();
          }}
          className="text-xs text-gray-400 hover:text-white underline underline-offset-2 transition"
        >
          Запази как се чувствам
        </button>
      </div>
    </div>
  );
}
