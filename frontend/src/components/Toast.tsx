import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-start gap-3 p-4 rounded-xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 min-w-[300px] max-w-md">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-semibold ${type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>
          {type === 'success' ? 'Success' : 'Error'}
        </p>
        <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
