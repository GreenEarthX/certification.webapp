"use client"; 

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; 
import Notifications from "./Notifications";
import UserProfileDropdown from "./UserProfileDropdown";

const Navbar: React.FC<{ userName: string }> = ({ userName }) => {
  const [title, setTitle] = useState("Dashboard"); 

  const pathname = usePathname(); 

  // Update the title based on the current path
  useEffect(() => {
    switch (pathname) {
      case "/recommendations":
        setTitle("Recommendations");
        break;
      case "/certifications":
        setTitle("Certifications");
        break;
      case "/certifications/1":
        setTitle("Certification");
        break;
      default:
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
          {/* Notifications (No props needed) */}
          <Notifications />

          {/* User Profile Dropdown */}
          <UserProfileDropdown userName={userName} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
