'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requireInput?: string; // If provided, user must type this to confirm
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger',
  requireInput,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireInput && inputValue !== requireInput) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled = isSubmitting || (requireInput ? inputValue !== requireInput : false);

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          iconBg: 'bg-red-500/10',
          btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10',
          btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        };
      case 'info':
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-cyan-500" />,
          iconBg: 'bg-cyan-500/10',
          btn: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity" 
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-zinc-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                {styles.icon}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-white">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-zinc-400">
                    {message}
                  </p>
                </div>
                
                {requireInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Ketik <span className="font-mono text-cyan-400 font-bold bg-zinc-800 px-1 py-0.5 rounded select-all">{requireInput}</span> untuk mengonfirmasi:
                    </label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder={requireInput}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900/50 border-t border-zinc-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              disabled={isConfirmDisabled}
              className={`inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
              onClick={handleConfirm}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-300 shadow-sm hover:bg-zinc-700 sm:mt-0 sm:w-auto disabled:opacity-50 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
