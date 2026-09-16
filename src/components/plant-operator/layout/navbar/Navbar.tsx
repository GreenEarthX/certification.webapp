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
    <header
      className="sticky top-0 z-50 border-b border-brand-100 bg-gradient-to-r from-white via-white to-brand-50/70 backdrop-blur-md shadow-gex-sm
                 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-brand-700 before:via-brand-500 before:to-brand-300/40
                 relative"
    >
      <div className="flex justify-between items-center w-full px-6 h-[var(--navbar-height)]">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 shadow-gex-sm ring-1 ring-brand-200/80">
            <Image
              src="/logoGEX.png"
              alt="Green Fuel Compliance"
              width={30}
              height={30}
              className="rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">Green Fuel Compliance</h1>
            <span className="hidden h-5 w-px bg-brand-200 sm:block" aria-hidden />
            <span className="hidden items-center rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-800 ring-1 ring-inset ring-brand-200/70 sm:inline-flex">
              {title}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
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
    </header>
  );
};

export default Navbar;
