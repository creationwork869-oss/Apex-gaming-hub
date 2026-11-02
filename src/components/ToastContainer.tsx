import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGame();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-18 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#0f241a]/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-[#290d14]/90 border-rose-500/40 text-rose-100 shadow-rose-950/40'
              : 'bg-[#18112c]/90 border-purple-500/40 text-purple-100 shadow-purple-950/40'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
