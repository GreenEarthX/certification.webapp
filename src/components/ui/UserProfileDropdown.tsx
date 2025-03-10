import React, { useState } from "react";
import Image from "next/image";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa"; // Import icons from react-icons

interface UserProfileDropdownProps {
  userName: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium overflow-hidden focus:outline-none"
        aria-label="User Menu"
      >
        <Image src="/avatar.png" alt="User" width={40} height={40} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
          {/* User Name */}
          <div className="p-4 border-b">
            <p className="text-sm text-gray-800">Hey, {userName}</p>
          </div>

          {/* Dropdown Items */}
          <ul>
            {/* Profile */}
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaUser className="mr-2" /> {/* Profile Icon */}
                Profile
              </a>
            </li>

            {/* Settings */}
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaCog className="mr-2" /> {/* Settings Icon */}
                Settings
              </a>
            </li>

            {/* Log Out */}
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" /> {/* Log Out Icon */}
                Log Out
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;