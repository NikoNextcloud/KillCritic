import React, { useRef, useState } from 'react';
import { Mic, Play, Square } from 'lucide-react';

type Props = {
  audioUrl: string;
  onSave: (dataUrl: string) => boolean;
  toast: (msg: string) => void;
};

export function MessageModal({ audioUrl, onSave, toast }: Props) {
  const [recording, setRecording] = useState(false);
  const [statusText, setStatusText] = useState(audioUrl ? 'Има запазено послание.' : 'Все още няма запис.');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleToggleRecord = async () => {
    try {
      if (!recorderRef.current || recorderRef.current.state === 'inactive') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
        recorder.onstop = () => {
          const reader = new FileReader();
          reader.onload = () => {
            const ok = onSave(reader.result as string);
            toast(ok ? 'Посланието е запазено' : 'Записът е твърде дълъг за локално пазене');
            setStatusText(ok ? 'Има запазено послание.' : 'Все още няма запис.');
          };
          reader.readAsDataURL(new Blob(chunksRef.current, { type: 'audio/webm' }));
          stream.getTracks().forEach((track) => track.stop());
        };
        recorder.start();
        recorderRef.current = recorder;
        setRecording(true);
        setStatusText('Записваме… говори спокойно.');
      } else {
        recorderRef.current.stop();
        setRecording(false);
        setStatusText('Запазване…');
      }
    } catch {
      toast('Разреши достъп до микрофона');
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">ПОСЛАНИЕ ОТ ТРЕЗВОТО АЗ</p>
        <h2 className="text-lg font-extrabold font-display text-white mt-1">Твоят глас е по-силен.</h2>
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Запиши кратко послание за труден момент. То остава в този браузър.</p>
      </div>

      <p className="text-xs text-gray-400">{statusText}</p>

      <button
        onClick={handleToggleRecord}
        className={`w-full font-bold text-xs py-3 rounded-2xl transition font-display flex items-center justify-center gap-2 ${
          recording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {recording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        {recording ? 'Спри и запази' : 'Започни запис'}
      </button>

      {audioUrl && !recording && (
        <button
          onClick={() => new Audio(audioUrl).play()}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-2.5 rounded-2xl transition border border-white/5 flex items-center justify-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" /> Чуй записа
        </button>
      )}
    </div>
  );
}
