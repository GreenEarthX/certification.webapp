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
      setTitle(
        pathname.match(/^\/dashboards\/recommendations\/[^/]+\/gantt-tracking\/?$/)
          ? "Certification Timeline"
          :pathname.match(/^\/dashboards\/recommendations\/[^/]+\/startTracking$/)
          ? "Certification Tracking"
          : pathname.match(/^\/dashboards\/recommendations\/\d+$/)
          ? "Recommendation"
          : "Recommendations"
      );
    } else if (pathname.includes("/certifications")) {
      setTitle(
        pathname.match(/^\/dashboards\/certifications\/\d+$/)
          ? "Certification"
          : "Certifications"
      );
    } else if (pathname.startsWith("/dashboards/plants/add")) {
      setTitle("Add Plant");
    } else if (pathname.includes("/dashboards/manage-plants")) {
      setTitle("Manage Plant Details");  
    } else if (pathname.startsWith("/dashboards/dashboard")) {
      setTitle(
        pathname.match(/^\/dashboards\/dashboard\/\d+\/plantDashboard$/)
          ? "Plant Dashboard"
          : "Dashboard"
      );
    } else if (pathname.startsWith("/profile")) {
      setTitle("Profile");
    } else if (pathname.includes("/manage-plants")) {
      setTitle("Manage Plants Details");  
    } else {
      setTitle("Dashboard");
    }
  }, [pathname]);
  

  return (
    <div className="sticky top-0 z-50 bg-blue-100/30 backdrop-blur-md shadow-lg border-b border-blue-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
        {/* Left Section */}
        <h1 className="text-2xl font-bold text-blue-700">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4 rounded-full p-2 shadow-sm relative">
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
