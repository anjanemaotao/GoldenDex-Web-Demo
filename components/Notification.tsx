
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X, AlertTriangle, Zap } from 'lucide-react';

export interface RichNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'liquidation';
  title: string;
  message: string;
}

interface NotificationContainerProps {
  notifications: RichNotification[];
  removeNotification: (id: string) => void;
}

const NotificationItem: React.FC<{ notification: RichNotification; onRemove: () => void }> = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Wait 3 seconds, then start exit animation
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 3000);

    // After exit animation finishes (0.3s), remove from state
    const removeTimer = setTimeout(() => {
      if (isExiting) onRemove();
    }, 3300);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [isExiting, onRemove]);

  const icons = {
    success: <CheckCircle className="text-teal-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    liquidation: <Zap className="text-rose-600" size={20} />,
  };

  return (
    <div className={`mb-3 w-80 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl flex items-start p-4 pointer-events-auto ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
      <div className="mr-3 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{notification.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{notification.message}</p>
      </div>
      <button 
        onClick={() => setIsExiting(true)} 
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end pointer-events-none">
      {notifications.map(n => (
        <NotificationItem key={n.id} notification={n} onRemove={() => removeNotification(n.id)} />
      ))}
    </div>
  );
};
