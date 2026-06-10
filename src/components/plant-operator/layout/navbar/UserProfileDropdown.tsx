"use client";

import React, { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

interface UserProfileDropdownProps {
  userName: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const ONBOARDING_URL = process.env.NEXT_PUBLIC_ONBOARDING_URL ;
  const currentAppUrl = typeof window === "undefined" ? "" : window.location.origin;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 rounded-full bg-blue-600/90 ring-1 ring-blue-200 flex items-center justify-center text-white font-semibold text-sm focus:outline-none"
        aria-label="User Menu"
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200">
          {/* User Name */}
          <div className="p-4 border-b">
            <p className="text-sm text-gray-800 font-medium">Hey, {userName}</p>
          </div>

          {/* Dropdown Items */}
          <ul>
            <button
              onClick={() => {
              localStorage.clear(); // tue tout
              window.location.href = `${ONBOARDING_URL}/api/auth/signout?callbackUrl=${encodeURIComponent(currentAppUrl)}`;}}
              className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <FaSignOutAlt className="mr-3" />
              Log Out (All Apps)
            </button>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
