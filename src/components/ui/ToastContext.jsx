import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastViewport } from './Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'default') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      message,
      type,
    };
    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'destructive');

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.type}>
            <div className="grid gap-1">
              <ToastTitle>
                {toast.type === 'success' ? 'Success' : 'Error'}
              </ToastTitle>
              <ToastDescription>{toast.message}</ToastDescription>
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
};