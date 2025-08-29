import React, { useState } from 'react';
import type { User } from '../../types';
import { AuditLogAction, KycStatus } from '../../types';
import AddAdminModal from './AddAdminModal';
import { defaultNotificationPreferences } from '../../data/mockData';
import VerifiedIcon from '../icons/VerifiedIcon';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
  addAuditLog: (actor: User, action: AuditLogAction, targetId: string | undefined, details: string) => void;
}

const getKycStatusClass = (status: KycStatus) => {
    switch (status) {
        case KycStatus.Verified:
            return 'bg-green-100 text-green-800';
        case KycStatus.PendingReview:
            return 'bg-yellow-100 text-yellow-800';
        case KycStatus.Rejected:
            return 'bg-red-100 text-red-800';
        case KycStatus.NotSubmitted:
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const UsersView: React.FC<UsersViewProps> = ({ users, setUsers, currentUser, addAuditLog }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddAdmin = (newAdminData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'isBlacklisted' | 'notificationPreferences' | 'kycStatus'>) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...newAdminData,
            role: 'admin',
            avatarUrl: `https://picsum.photos/seed/admin${users.length + 1}/40/40`,
            isBlacklisted: false,
            notificationPreferences: defaultNotificationPreferences,
            kycStatus: KycStatus.Verified,
        };
        setUsers(prev => [...prev, newUser]);
        addAuditLog(currentUser, AuditLogAction.AdminAdded, newUser.id, `Added ${newUser.name} as a new administrator.`);
        setIsModalOpen(false);
    };

    const handleToggleBlacklist = (userToToggle: User) => {
        const isBlacklisting = !userToToggle.isBlacklisted;
        setUsers(prev => prev.map(u => u.id === userToToggle.id ? { ...u, isBlacklisted: isBlacklisting } : u));
        
        const action = isBlacklisting ? AuditLogAction.UserBlacklisted : AuditLogAction.UserUnblacklisted;
        const details = isBlacklisting ? `Blacklisted user ${userToToggle.name}.` : `Unblacklisted user ${userToToggle.name}.`;
        addAuditLog(currentUser, action, userToToggle.id, details);
    }

  return (
    <>
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-700">User Management</h3>
        <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 w-full sm:w-auto"
        >
            Add New Admin
        </button>
       </div>
      
      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {user.name}
                        {user.kycStatus === KycStatus.Verified && <VerifiedIcon className="w-4 h-4 text-blue-500 ml-1.5" title="KYC Verified" />}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentUser.id !== user.id && user.role !== 'admin' ? (
                        <button
                            onClick={() => handleToggleBlacklist(user)}
                            className={`relative inline-flex items-center h-7 w-28 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                !user.isBlacklisted 
                                ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                                : 'bg-gray-900 shadow-lg shadow-gray-900/50'
                            }`}
                        >
                            <span className="sr-only">Toggle Blacklist Status</span>
                            <span
                                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out absolute top-1 left-1 ${
                                    !user.isBlacklisted ? 'translate-x-[84px]' : 'translate-x-0'
                                }`}
                            />
                            {!user.isBlacklisted ? (
                                <span className="absolute left-4 text-xs font-bold text-white">Active</span>
                            ) : (
                                <span className="absolute right-2 text-xs font-bold text-white">Blacklisted</span>
                            )}
                        </button>
                    ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {user.isBlacklisted ? 'Blacklisted' : 'Active'}
                        </span>
                    )}
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusClass(user.kycStatus)}`}>
                        {user.kycStatus}
                    </span>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
            <div key={user.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img className="h-12 w-12 rounded-full" src={user.avatarUrl} alt={user.name} />
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center">
                      {user.name}
                       {user.kycStatus === KycStatus.Verified && <VerifiedIcon className="w-4 h-4 text-blue-500 ml-1.5" title="KYC Verified" />}
                    </p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800' }`}>
                  {user.role}
                </span>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3 text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Email:</span>
                    <span className="text-gray-800">{user.email}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-medium text-gray-500">Phone:</span>
                    <span className="text-gray-800">{user.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">KYC Status:</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKycStatusClass(user.kycStatus)}`}>
                        {user.kycStatus}
                    </span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">Status:</span>
                     {currentUser.id !== user.id && user.role !== 'admin' ? (
                        <button
                            onClick={() => handleToggleBlacklist(user)}
                            className={`relative inline-flex items-center h-7 w-28 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                !user.isBlacklisted 
                                ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                                : 'bg-gray-900 shadow-lg shadow-gray-900/50'
                            }`}
                        >
                            <span className="sr-only">Toggle Blacklist Status</span>
                            <span
                                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out absolute top-1 left-1 ${
                                    !user.isBlacklisted ? 'translate-x-[84px]' : 'translate-x-0'
                                }`}
                            />
                            {!user.isBlacklisted ? (
                                <span className="absolute left-4 text-xs font-bold text-white">Active</span>
                            ) : (
                                <span className="absolute right-2 text-xs font-bold text-white">Blacklisted</span>
                            )}
                        </button>
                    ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isBlacklisted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {user.isBlacklisted ? 'Blacklisted' : 'Active'}
                        </span>
                    )}
                </div>
              </div>
            </div>
          ))}
      </div>

    </div>
    {isModalOpen && (
        <AddAdminModal 
            onClose={() => setIsModalOpen(false)}
            onAddAdmin={handleAddAdmin}
            existingUsers={users}
        />
    )}
    </>
  );
};

export default UsersView;