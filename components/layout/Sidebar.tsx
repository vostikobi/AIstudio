import React from 'react';
import DashboardIcon from '../icons/DashboardIcon';
import TransactionIcon from '../icons/TransactionIcon';
import DisputeIcon from '../icons/DisputeIcon';
import UserManagementIcon from '../icons/UserManagementIcon';
import ProfileIcon from '../icons/ProfileIcon';
import SettingsIcon from '../icons/SettingsIcon';
import KycQueueIcon from '../icons/KycQueueIcon';
import type { Page, User } from '../../types';

interface SidebarProps {
  user: User;
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 w-full text-left ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);


const Sidebar: React.FC<SidebarProps> = ({ user, activePage, setActivePage, isOpen, setIsOpen }) => {
  const handleNavigation = (page: Page) => {
    setActivePage(page);
    if (window.innerWidth < 768) { // md breakpoint in Tailwind
        setIsOpen(false);
    }
  }
  
  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>

        <div className={`fixed md:relative z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
          <div className="flex items-center justify-center h-20 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">Escrow<span className="text-gray-700">Admin</span></h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavLink
              icon={<DashboardIcon className="w-5 h-5" />}
              label="Dashboard"
              isActive={activePage === 'dashboard'}
              onClick={() => handleNavigation('dashboard')}
            />
            <NavLink
              icon={<TransactionIcon className="w-5 h-5" />}
              label="Transactions"
              isActive={activePage === 'transactions'}
              onClick={() => handleNavigation('transactions')}
            />
            <NavLink
              icon={<DisputeIcon className="w-5 h-5" />}
              label="Disputes"
              isActive={activePage === 'disputes'}
              onClick={() => handleNavigation('disputes')}
            />
             <NavLink
              icon={<UserManagementIcon className="w-5 h-5" />}
              label="User Management"
              isActive={activePage === 'users'}
              onClick={() => handleNavigation('users')}
            />
            <NavLink
              icon={<KycQueueIcon className="w-5 h-5" />}
              label="KYC Submissions"
              isActive={activePage === 'kycSubmissions'}
              onClick={() => handleNavigation('kycSubmissions')}
            />
            <NavLink
              icon={<ProfileIcon className="w-5 h-5" />}
              label="Profile"
              isActive={activePage === 'profile'}
              onClick={() => handleNavigation('profile')}
            />
            <NavLink
              icon={<SettingsIcon className="w-5 h-5" />}
              label="Settings"
              isActive={activePage === 'settings'}
              onClick={() => handleNavigation('settings')}
            />
          </nav>
           <div className="px-4 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => handleNavigation('profile')}
                className="flex items-center w-full text-left p-2 -m-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                aria-label="View profile"
              >
                <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </button>
            </div>
        </div>
    </>
  );
};

export default Sidebar;