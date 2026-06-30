import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastContextValue = {
  toast: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const toast = useCallback((msg: string, duration = 2500) => {
    setMessage(msg);
    setShow(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setShow(false), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className={`fixed z-[200] left-1/2 -translate-x-1/2 bottom-24 bg-[#0c0c0e] text-white text-xs font-semibold px-4 py-3 rounded-full border border-white/10 shadow-2xl transition-all duration-300 pointer-events-none ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
