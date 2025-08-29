import React from 'react';
import type { Notification } from '../../types';
import Notifications from './Notifications';
import MenuIcon from '../icons/MenuIcon'; // Import the new icon

interface HeaderProps {
  onLogout: () => void;
  notifications: Notification[];
  onMarkAsRead: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, notifications, onMarkAsRead, onMenuClick }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-20 px-4 sm:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Notifications notifications={notifications} onMarkAsRead={onMarkAsRead} />
        {/* Search input can be hidden on very small screens if needed */}
        <div className="hidden sm:block relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-40 lg:w-64 pl-4 pr-10 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={onLogout}
          className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
