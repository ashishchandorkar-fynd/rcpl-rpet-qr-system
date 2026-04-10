import { createContext, useContext } from 'react';
import { ToastType } from '../types';

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  addToast: () => undefined,
});

export function useToastContext() {
  return useContext(ToastContext);
}
