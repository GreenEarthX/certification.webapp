"use client"
import React, { useState} from 'react';
import Notifications from './Notifications'
import UserProfileDropdown from './UserProfileDropdown';

interface NavbarProps {
  title: string;
  notifications: Notification[];
  userName: string;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  notifications,
  userName,
}) => {
  const [updatedNotifications, setUpdatedNotifications] = useState<Notification[]>(notifications);

  // Handle notification click to mark as read
  const handleNotificationClick = (id: number) => {
    setUpdatedNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-sm relative">
          {/* Notifications */}
          <Notifications
            notifications={updatedNotifications}
            onNotificationClick={handleNotificationClick}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown userName={userName} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
