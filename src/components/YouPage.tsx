import React, { useState } from 'react';
import { ChevronLeft, Download, Phone, Plus, RotateCcw, ShieldAlert } from 'lucide-react';
import { Profile } from '../types';

type Props = {
  profile: Profile;
  onBack: () => void;
  onNewProfile: () => void;
  onSetContact: (contact: string) => void;
  onExport: () => void;
  onReset: () => void;
};

export function YouPage({ profile, onBack, onNewProfile, onSetContact, onExport, onReset }: Props) {
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState(profile.contact);

  const initials = (profile.profileName || 'АЗ').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition">
        <ChevronLeft className="w-3.5 h-3.5" /> Назад към „Още“
      </button>

      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ТВОЯТ КОМПАС</p>
        <h1 className="text-xl font-extrabold font-display text-white leading-tight">
          Всичко важно <span className="text-emerald-400">остава при теб.</span>
        </h1>
      </div>

      <div className="glass rounded-3xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-lg font-extrabold font-display text-emerald-300 shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-base font-extrabold font-display text-white">{profile.profileName || 'Моето спокойно аз'}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Всеки нов профил започва от 0. Данните се пазят в този браузър.</p>
        </div>
      </div>

      <div className="glass rounded-3xl divide-y divide-white/5 overflow-hidden">
        <button onClick={onNewProfile} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-white/5 transition">
          <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
            <Plus className="w-4 h-4" />
          </span>
          <div className="flex-1">
            <strong className="text-sm text-white block">Нов профил</strong>
            <small className="text-[11px] text-gray-500">Ново начало от абсолютна нула</small>
          </div>
          <span className="text-gray-600">›</span>
        </button>

        {editingContact ? (
          <div className="p-4 space-y-2.5">
            <label className="text-xs font-bold text-gray-300">Кой да е на един бутон разстояние?</label>
            <input
              type="tel"
              value={contactDraft}
              onChange={(e) => setContactDraft(e.target.value)}
              placeholder="+359..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              onClick={() => {
                onSetContact(contactDraft.trim());
                setEditingContact(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Запази
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingContact(true)} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-white/5 transition">
            <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
              <Phone className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <strong className="text-sm text-white block">Човек за контакт</strong>
              <small className="text-[11px] text-gray-500">{profile.contact || 'Добави телефон'}</small>
            </div>
            <span className="text-gray-600">›</span>
          </button>
        )}

        <button onClick={onExport} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-white/5 transition">
          <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
            <Download className="w-4 h-4" />
          </span>
          <div className="flex-1">
            <strong className="text-sm text-white block">Изтегли моите данни</strong>
            <small className="text-[11px] text-gray-500">JSON архив на записите</small>
          </div>
          <span className="text-gray-600">›</span>
        </button>

        <button onClick={onReset} className="w-full flex items-center gap-3.5 p-4 text-left hover:bg-white/5 transition">
          <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-red-400 shrink-0">
            <RotateCcw className="w-4 h-4" />
          </span>
          <div className="flex-1">
            <strong className="text-sm text-white block">Нов старт</strong>
            <small className="text-[11px] text-gray-500">Изчисти локалните данни</small>
          </div>
          <span className="text-gray-600">›</span>
        </button>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
          <strong className="text-sm text-white">Ако си в непосредствена опасност</strong>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          KILLCRITIC не е медицинска услуга. Обади се на 112 или потърси медицинска помощ. Рязкото спиране на алкохола може да бъде опасно при зависимост.
        </p>
        <a href="tel:112" className="inline-block text-xs font-bold text-orange-300 underline underline-offset-2">
          Обади се на 112
        </a>
      </div>
    </div>
  );
}
