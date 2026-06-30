import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { RiskPlace } from '../../types';

type Props = {
  places: RiskPlace[];
  onSave: (place: Omit<RiskPlace, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  watching: boolean;
};

export function PlacesModal({ places, onSave, onDelete, watching }: Props) {
  const [name, setName] = useState('');
  const [radius, setRadius] = useState(200);
  const [status, setStatus] = useState('');

  const handleSave = () => {
    if (!navigator.geolocation) {
      setStatus('Този браузър не поддържа геолокация');
      return;
    }
    if (!name.trim()) {
      setStatus('Дай име на мястото');
      return;
    }
    setStatus('Определям местоположението…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSave({
          name: name.trim(),
          radius: Math.min(2000, Math.max(50, radius)),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setName('');
        setStatus('');
      },
      (error) => {
        if (error.code === 1) setStatus('Достъпът до местоположение не е разрешен.');
        else if (error.code === 2) setStatus('Местоположението не може да бъде определено.');
        else setStatus('GPS заявката отне твърде дълго.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-sky-400 uppercase tracking-widest font-bold">РИСКОВИ МЕСТА</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Предупреждение преди автоматичния избор.</h2>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          Запази текущото място. Когато приложението е отворено и влезеш в избрания радиус, ще получиш предупреждение.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400">Име на мястото</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: барът до офиса" className="field-input" />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-400">Радиус за предупреждение (м)</label>
        <input type="number" min={50} max={2000} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="field-input" />
      </div>

      <button onClick={handleSave} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 rounded-2xl transition font-display flex items-center justify-center gap-1.5">
        ⌖ Запази текущото местоположение
      </button>

      {status && <p className="text-[11px] text-amber-400">{status}</p>}

      <p className="text-[10px] text-gray-500">{watching ? 'GPS наблюдението е активно.' : 'GPS ще се активира след разрешение.'}</p>

      {places.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-3">Още няма запазени рискови места.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {places.map((place) => (
            <div key={place.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between gap-2 border border-white/5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{place.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  радиус {place.radius} м · {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </p>
              </div>
              <button onClick={() => onDelete(place.id)} className="text-gray-500 hover:text-red-400 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
