import React from 'react';
import type { User } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface KYCReviewModalProps {
  user: User;
  onClose: () => void;
  onDecision: (decision: 'approved' | 'rejected') => void;
}

const KYCReviewModal: React.FC<KYCReviewModalProps> = ({ user, onClose, onDecision }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Review KYC Submission</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              <p className="text-sm text-gray-500">{user.phone}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Submitted Documents</h4>
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">(Document previews would appear here)</p>
              <p className="text-xs text-gray-400 mt-1">Simulating review of National ID, etc.</p>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
          <button
            onClick={() => onDecision('rejected')}
            className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200"
          >
            Reject
          </button>
          <button
            onClick={() => onDecision('approved')}
            className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCReviewModal;