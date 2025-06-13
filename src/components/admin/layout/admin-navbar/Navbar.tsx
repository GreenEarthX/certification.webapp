"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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
    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (pathname.includes("/users")) {
        setTitle(
          pathname.match(/^\/admin\/users\/\d+$/)
            ? "User Details"
            : "Users Management"
        );
      } else if (pathname.includes("/plants")) {
        setTitle(
          pathname.match(/^\/admin\/plants\/\d+$/)
            ? "Plant Details"
            : pathname.match(/^\/admin\/plants\/add$/)
            ? "Add Plant"
            : "Plants Management"
        );
      } else if (pathname.includes("/certifications")) {
        setTitle(
          pathname.match(/^\/admin\/certifications\/\d+$/)
            ? "Certification Details"
            : "Certifications Management"
        );
      } else if (pathname.includes("/reports")) {
        setTitle("Reports");
      } else if (pathname.includes("/settings")) {
        setTitle("Settings");
      } else {
        setTitle("Admin Dashboard");
      }
    }
    // Operator routes
    else if (pathname.includes("/recommendations")) {
      setTitle(
        pathname.match(/^\/plant-operator\/recommendations\/[^/]+\/gantt-tracking\/?$/)
          ? "Certification Timeline"
          : pathname.match(/^\/plant-operator\/recommendations\/[^/]+\/startTracking$/)
          ? "Certification Tracking"
          : pathname.match(/^\/plant-operator\/recommendations\/\d+$/)
          ? "Recommendation"
          : "Recommendations"
      );
    } else if (pathname.includes("/certifications")) {
      setTitle(
        pathname.match(/^\/plant-operator\/certifications\/\d+$/)
          ? "Certification"
          : "Certifications"
      );
    } else if (pathname.startsWith("/plant-operator/plants/add")) {
      setTitle("Add Plant");
    } else if (pathname.includes("/plant-operator/manage-plants")) {
      setTitle("Manage Plant Details");  
    } else if (pathname.startsWith("/plant-operator/dashboard")) {
      setTitle(
        pathname.match(/^\/plant-operator\/dashboard\/\d+\/plant-dashboard$/)
          ? "Plant Dashboard"
          : "Dashboard"
      );
    } else if (pathname.startsWith("/profile")) {
      setTitle("Profile");
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