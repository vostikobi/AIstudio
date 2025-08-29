import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page, User, Notification } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activePage: Page;
  setActivePage: (page: Page) => void;
  notifications: Notification[];
  onMarkAsRead: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, 
    user, 
    onLogout, 
    activePage, 
    setActivePage, 
    notifications, 
    onMarkAsRead,
    isSidebarOpen,
    setIsSidebarOpen
}) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        user={user} 
        activePage={activePage} 
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            onLogout={onLogout} 
            notifications={notifications} 
            onMarkAsRead={onMarkAsRead}
            onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
