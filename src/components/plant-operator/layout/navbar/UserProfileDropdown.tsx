"use client";

import React, { useCallback, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useDismissable } from "@/hooks/useDismissable";

interface UserProfileDropdownProps {
  userName: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsDropdownOpen(false), []);
  useDismissable(rootRef, isDropdownOpen, close);
  const ONBOARDING_URL = process.env.NEXT_PUBLIC_ONBOARDING_URL ;
  const currentAppUrl = typeof window === "undefined" ? "" : window.location.origin;
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="relative" ref={rootRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-semibold text-white shadow-gex-sm ring-1 ring-brand-700/30 ring-offset-1 ring-offset-white hover:from-brand-700 hover:to-brand-900 active:scale-95"
        aria-label="User Menu"
        aria-haspopup="menu"
        aria-expanded={isDropdownOpen}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-gex-md border border-slate-200 bg-white shadow-gex-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 origin-top-right"
        >
          {/* User Name */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
          </div>

          {/* Dropdown Items */}
          <div className="p-1">
            <button
              role="menuitem"
              onClick={() => {
              localStorage.clear(); // tue tout
              window.location.href = `${ONBOARDING_URL}/api/auth/signout?callbackUrl=${encodeURIComponent(currentAppUrl)}`;}}
              className="flex w-full items-center gap-3 rounded-gex-sm px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100"
            >
              <LogOut className="size-4" />
              Log Out (All Apps)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
