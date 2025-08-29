import React, { useState, useMemo } from 'react';
import type { Notification } from '../../types';
import BellIcon from '../icons/BellIcon';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: () => void;
}

const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};


const Notifications: React.FC<NotificationsProps> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen && unreadCount > 0) {
      onMarkAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div 
            className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className="flex items-start px-4 py-3 hover:bg-gray-50">
                            <div className={`mt-1 h-2.5 w-2.5 rounded-full ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-700">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.timestamp)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-gray-500">No new notifications.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;