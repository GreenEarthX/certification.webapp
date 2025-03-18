"use client"; 

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; 
import { useNotifications } from "@/hooks/useNotifications";
import Notifications from "./Notifications";
import UserProfileDropdown from "./UserProfileDropdown";

const Navbar: React.FC<{ userName: string }> = ({ userName }) => {
  const [title, setTitle] = useState("Dashboard"); 
  const pathname = usePathname(); 

  // Fetch notifications in Navbar
  const { notifications, loading, error, markNotificationAsRead } = useNotifications();

  // Update the title based on the current path
  useEffect(() => {
    if (pathname.includes("/recommendations")) {
      setTitle("Recommendations");
    } else if (pathname.includes("/certifications")) {
      setTitle(pathname.match(/^\/certifications\/\d+$/) ? "Certification" : "Certifications");
    } else if (pathname.startsWith("/dashboard")) {
      setTitle("Dashboard");
    } else {
      setTitle("Dashboard"); // Default
    }
  }, [pathname]);
  

  return (
    <div className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-2">
       {/* Left Section */}
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-sm relative">
          {/* Notifications (Data now passed as props) */}
          <Notifications 
            notifications={notifications} 
            loading={loading} 
            error={error} 
            markNotificationAsRead={markNotificationAsRead} 
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown userName={userName} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
