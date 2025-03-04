import React, { useState } from 'react';
import Image from 'next/image';

interface UserProfileDropdownProps {
  userName: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ userName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium overflow-hidden focus:outline-none"
        aria-label="User Menu"
      >
        <Image src="/avatar.png" alt="User" width={40} height={40} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4 border-b">
            <p className="text-sm text-gray-800">Hey, {userName}</p>
          </div>
          <ul>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
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
