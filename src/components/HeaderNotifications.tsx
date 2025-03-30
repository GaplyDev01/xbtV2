import React, { useState } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, Info } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

const HeaderNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useAlerts();

  const getNotificationIcon = (type: string, importance: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={16} className="text-theme-accent" />;
      case 'system':
        return <Info size={16} className="text-theme-accent" />;
      default:
        return <Bell size={16} className="text-theme-accent" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-theme-text-secondary hover:text-theme-text-primary rounded-full hover:bg-theme-accent/10 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-theme-accent text-theme-bg text-[10px] flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-theme-bg border border-theme-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-theme-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-theme-text-primary">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-theme-accent hover:text-theme-accent-dark"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-theme-text-secondary hover:text-theme-text-primary"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-theme-border hover:bg-theme-accent/5 cursor-pointer ${
                    !notification.read ? 'bg-theme-accent/10' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5 mr-3">
                      {getNotificationIcon(notification.type, notification.importance)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-text-primary">
                        {notification.title}
                      </p>
                      <p className="text-xs text-theme-text-secondary mt-0.5">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-1 text-[10px] text-theme-text-secondary">
                        <Clock size={10} className="mr-1" />
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="ml-3">
                        <div className="w-2 h-2 bg-theme-accent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-theme-text-secondary">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotifications;