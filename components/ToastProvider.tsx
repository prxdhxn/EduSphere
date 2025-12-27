import React, { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: string; message: string; type?: 'info'|'success'|'error' };

const ToastContext = createContext<{ show: (message: string, type?: Toast['type']) => void } | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const t: Toast = { id, message, type };
    setToasts((s) => [t, ...s]);
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex flex-col-reverse gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-xs px-4 py-3 rounded shadow-lg text-sm text-white ${t.type === 'error' ? 'bg-rose-600' : t.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
