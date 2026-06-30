import React from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative glass-dark w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
