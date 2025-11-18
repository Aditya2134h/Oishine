import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

export interface ToastConfig {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export const getToastIcon = (variant?: string) => {
  switch (variant) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case 'destructive':
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    default:
      return <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
  }
};

export const enhancedToast = (config: ToastConfig) => {
  return {
    ...config,
    className: `${
      config.variant === 'success' ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800' :
      config.variant === 'destructive' ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800' :
      config.variant === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800' :
      config.variant === 'info' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' :
      'bg-background dark:bg-background border-border'
    }`,
  };
};
