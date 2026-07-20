"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
        pathname.match(/^\/plant-operator\/recommendations\/[^/]+\/gantt-tracking\/?$/)
          ? "Certification Timeline"
          :pathname.match(/^\/plant-operator\/recommendations\/[^/]+\/startTracking$/)
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
    } else if (pathname.startsWith("/plant-operator/plausibility-check")) {
      setTitle("Plausibility Check");
    } else if (pathname.startsWith("/plant-operator/plant-builder")) {
      setTitle("Plant Builder");    
    } else if (pathname.startsWith("/plant-operator/dashboard")) {
      setTitle(
        pathname.match(/^\/plant-operator\/dashboard\/\d+\/plant-dashboard$/)
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
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-[80px]">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center">
            <Image
              src="/logoGEX.png"
              alt="Green Fuel Compliance"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Green Fuel Compliance</h1>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
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
