import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className={`fixed top-24 right-4 z-[100] max-w-md animate-slide-up`}>
      <div className={`${c.bg} ${c.border} border rounded-xl p-4 shadow-2xl backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${c.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${c.text}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`${c.text} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};