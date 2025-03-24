"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useCurrentUser"; // 👈 Import the new hook
import Notifications from "./Notifications";
import UserProfileDropdown from "./UserProfileDropdown";

const Navbar: React.FC = () => {
  const [title, setTitle] = useState("Dashboard");
  const pathname = usePathname();

  // Fetch notifications
  const { notifications, loading, error, markNotificationAsRead } = useNotifications();

  // Fetch current user info
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (pathname.includes("/recommendations")) {
      setTitle("Recommendations");
    } else if (pathname.includes("/certifications")) {
      setTitle(pathname.match(/^\/certifications\/\d+$/) ? "Certification" : "Certifications");
    } else if (pathname.startsWith("/dashboard")) {
      setTitle("Dashboard");
    } else {
      setTitle("Dashboard");
    }
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        {/* Left Section */}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-sm relative">
          {/* Notifications */}
          <Notifications
            notifications={notifications}
            loading={loading}
            error={error}
            markNotificationAsRead={markNotificationAsRead}
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown
            userName={
              userLoading
                ? "Loading..."
                : user
                ? `${user.first_name} ${user.last_name}`
                : "Guest"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
