import React, { useState } from 'react';
import { Notification } from '@/models/notification';

interface NotificationProps {
  notifications: Notification[];
  onNotificationClick: (id: number) => void;
}

const Notifications: React.FC<NotificationProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleNotificationClick = (id: number) => {
    onNotificationClick(id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        className="text-gray-500 hover:text-gray-800 relative"
        aria-label="View Notifications"
      >
        {/* Notification Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notifications.filter(notification => !notification.read).length > 0 && (
          <span className="absolute top-0 right-0 px-1.5 py-0.5 text-[10px] font-bold text-red-100 bg-red-600 rounded-full">
            {notifications.filter(notification => !notification.read).length}
          </span>
        )}
      </button>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 border-b">
            <p className="text-sm font-medium text-gray-800">Notifications</p>
          </div>
          <ul>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification.id)} // Mark as read
                    className={`block w-full px-4 py-2 text-sm text-gray-700 text-left hover:bg-gray-100 ${
                      !notification.read ? 'bg-gray-50' : 'bg-gray-100'
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        !notification.read ? 'text-black' : 'text-gray-500'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-sm text-gray-500">No new notifications</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
