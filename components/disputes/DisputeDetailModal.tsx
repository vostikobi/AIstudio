import React from 'react';
import type { Dispute, User } from '../../types';
import { TransactionStatus, DisputeStatus } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import TransactionWorkflow from '../userview/TransactionWorkflow'; // Import the new component

interface DisputeDetailModalProps {
  dispute: Dispute;
  onClose: () => void;
  onResolve: (newStatus: TransactionStatus.Released | TransactionStatus.Refunded) => void;
}

const UserCard: React.FC<{ user: Dispute['transaction']['buyer']; role: 'Buyer' | 'Seller' }> = ({ user, role }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm font-semibold text-gray-600 mb-2">{role}</p>
    <div className="flex items-center">
      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.phone}</p>
      </div>
    </div>
  </div>
);


const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({ dispute, onClose, onResolve }) => {
  const { transaction, messages, status } = dispute;
  
  const getSender = (senderId: string): User => {
    if (senderId === transaction.buyer.id) {
        return transaction.buyer;
    }
    return transaction.seller;
  }
  
  const statusClass = status === DisputeStatus.Open ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-800">Dispute: {dispute.id}</h2>
                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                    {status}
                </span>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Transaction Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Transaction Details</h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-600">Product:</span> {transaction.product}</div>
              <div><span className="font-medium text-gray-600">Amount:</span> <span className="font-bold">{transaction.currency} {transaction.amount.toLocaleString()}</span></div>
              <div className="relative group">
                <div className="cursor-pointer"><span className="font-medium text-gray-600">Transaction ID:</span> {transaction.id}</div>
                <div className="absolute top-full left-0 mt-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                  <TransactionWorkflow transaction={transaction} />
                </div>
              </div>
              <div><span className="font-medium text-gray-600">Date:</span> {new Date(transaction.createdAt).toLocaleString()}</div>
            </div>
          </div>
          
          {/* Parties Involved */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parties Involved</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UserCard user={transaction.buyer} role="Buyer" />
              <UserCard user={transaction.seller} role="Seller" />
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Reason for Dispute</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{dispute.reason}"</p>
            </div>
          </div>

          {/* Communication History */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Communication History</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto space-y-4">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const sender = getSender(message.senderId);
                  const isBuyer = sender.id === transaction.buyer.id;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <p className="text-sm font-semibold text-gray-800">{sender.name}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {isBuyer ? 'Buyer' : 'Seller'}
                          </span>
                           <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg mt-1 border border-gray-200">
                            <p className="text-sm text-gray-700">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No messages in this dispute.</p>
              )}
            </div>
          </div>
        </div>
        
        {status === DisputeStatus.Open && (
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
              <button
                onClick={() => onResolve(TransactionStatus.Refunded)}
                className="px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-200"
              >
                Refund to Buyer
              </button>
              <button
                onClick={() => onResolve(TransactionStatus.Released)}
                className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
              >
                Release Funds to Seller
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetailModal;