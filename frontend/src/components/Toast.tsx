import { useEffect } from 'react';
import { Toast as ToastType } from '../types';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

const colors: Record<ToastType['type'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`flex items-center gap-3 ${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg min-w-64 max-w-sm`}>
      <span className="flex-shrink-0 font-bold">{icons[toast.type]}</span>
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}
