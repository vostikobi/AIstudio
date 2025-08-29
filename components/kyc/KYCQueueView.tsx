import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import { KycStatus } from '../../types';
import KYCReviewModal from './KYCReviewModal';

interface KYCQueueViewProps {
  users: User[];
  onReview: (userId: string, decision: 'approved' | 'rejected') => void;
}

const KYCQueueView: React.FC<KYCQueueViewProps> = ({ users, onReview }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const pendingUsers = useMemo(() => {
    return users.filter(u => u.kycStatus === KycStatus.PendingReview);
  }, [users]);

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">KYC Submissions Queue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingUsers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>There are no pending KYC submissions.</p>
            </div>
          )}
        </div>
      </div>
      {selectedUser && (
        <KYCReviewModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDecision={(decision) => {
            onReview(selectedUser.id, decision);
            setSelectedUser(null);
          }}
        />
      )}
    </>
  );
};

export default KYCQueueView;