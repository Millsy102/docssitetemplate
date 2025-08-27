import React, { useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface RealtimeNotificationsProps {
  maxNotifications?: number;
  autoDismiss?: boolean;
  dismissDelay?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  maxNotifications = 5,
  autoDismiss = true,
  dismissDelay = 5000,
  position = 'top-right'
}) => {
  const { messages, isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Convert real-time messages to notifications
  useEffect(() => {
    const newNotifications = messages
      .filter(msg => msg.type === 'info' || msg.type === 'success' || msg.type === 'warning' || msg.type === 'error')
      .map(msg => ({
        id: msg.id,
        type: msg.type,
        title: getNotificationTitle(msg.type),
        message: msg.message,
        timestamp: msg.timestamp,
        duration: autoDismiss ? dismissDelay : undefined,
      }))
      .slice(-maxNotifications);

    setNotifications(newNotifications);
  }, [messages, maxNotifications, autoDismiss, dismissDelay]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (!autoDismiss) return;

    const timeouts: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
      if (notification.duration) {
        const timeout = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications, autoDismiss]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Info';
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'success':
        return '';
      case 'warning':
        return '';
      case 'error':
        return '';
      default:
        return 'ℹ';
    }
  };

  const getNotificationStyles = (type: string): string => {
    const baseStyles = 'flex items-start p-4 mb-2 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out transform';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-900/20 border-green-500 text-green-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/20 border-yellow-500 text-yellow-100`;
      case 'error':
        return `${baseStyles} bg-red-900/20 border-red-500 text-red-100`;
      default:
        return `${baseStyles} bg-gray-900/20 border-gray-500 text-gray-100`;
    }
  };

  const getPositionStyles = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionStyles()} max-w-sm w-full`}>
      {/* Connection Status Indicator */}
      <div className={`mb-2 p-2 rounded-lg text-xs font-medium ${
        isConnected 
          ? 'bg-green-900/20 text-green-100 border border-green-500' 
          : 'bg-red-900/20 text-red-100 border border-red-500'
      }`}>
        {isConnected ? ' Connected' : ' Disconnected'}
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${getNotificationStyles(notification.type)} hover:scale-105`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex-shrink-0 mr-3">
              <span className="text-lg font-bold">
                {getNotificationIcon(notification.type)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold mb-1">
                  {notification.title}
                </h4>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
              <p className="text-sm opacity-90">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="mt-2 text-xs font-medium underline hover:no-underline transition-all duration-200"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
