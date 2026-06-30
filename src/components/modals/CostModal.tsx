import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { CostEntry } from '../../types';

type Props = {
  costs: CostEntry[];
  onSave: (entry: Omit<CostEntry, 'id' | 'at'>) => void;
  onDelete: (id: string) => void;
};

export function CostModal({ costs, onSave, onDelete }: Props) {
  const [money, setMoney] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [energy, setEnergy] = useState(5);
  const [workouts, setWorkouts] = useState(0);
  const [anxiety, setAnxiety] = useState(5);
  const [productivity, setProductivity] = useState(5);
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave({ money, sleep, energy, workouts, anxiety, productivity, note: note.trim() });
    setMoney(0);
    setSleep(0);
    setEnergy(5);
    setWorkouts(0);
    setAnxiety(5);
    setProductivity(5);
    setNote('');
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold">ИСТИНСКАТА ЦЕНА</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Ти въвеждаш реалните стойности.</h2>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Няма автоматични догадки. Запиши последствията, които действително си усетил.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Похарчени пари (лв.)">
          <input type="number" min={0} step={0.01} value={money} onChange={(e) => setMoney(Number(e.target.value))} className="field-input" />
        </Field>
        <Field label="Загубен сън (часове)">
          <input type="number" min={0} step={0.5} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="field-input" />
        </Field>
        <Field label="Енергия утре (0–10)">
          <input type="number" min={0} max={10} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="field-input" />
        </Field>
        <Field label="Пропуснати тренировки">
          <input type="number" min={0} step={1} value={workouts} onChange={(e) => setWorkouts(Number(e.target.value))} className="field-input" />
        </Field>
        <Field label="Тревожност (0–10)">
          <input type="number" min={0} max={10} value={anxiety} onChange={(e) => setAnxiety(Number(e.target.value))} className="field-input" />
        </Field>
        <Field label="Продуктивност (0–10)">
          <input type="number" min={0} max={10} value={productivity} onChange={(e) => setProductivity(Number(e.target.value))} className="field-input" />
        </Field>
      </div>

      <Field label="Бележка по желание">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Какво още ти струваше този случай?" rows={2} className="field-input resize-none" />
      </Field>

      <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl transition font-display">
        Запази случая
      </button>

      {costs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/5 max-h-48 overflow-y-auto pr-1">
          {costs
            .slice()
            .reverse()
            .map((item) => (
              <div key={item.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-2 border border-white/5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">
                    {new Date(item.at).toLocaleDateString('bg-BG')} · {item.money.toFixed(2)} лв.
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {item.sleep} ч. сън · енергия {item.energy}/10 · тревожност {item.anxiety}/10
                  </p>
                </div>
                <button onClick={() => onDelete(item.id)} className="text-gray-500 hover:text-red-400 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-400">{label}</label>
      {children}
    </div>
  );
}
