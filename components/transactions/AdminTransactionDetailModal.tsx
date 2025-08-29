

import React from 'react';
import type { Transaction, User } from '../../types';
// FIX: Import KycStatus to check if a user is verified.
import { KycStatus } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import EscrowWallet from '../userview/EscrowWallet';
import TransactionWorkflow from '../userview/TransactionWorkflow';
import VerifiedIcon from '../icons/VerifiedIcon';

interface AdminTransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const UserCard: React.FC<{ user: User; role: 'Buyer' | 'Seller' }> = ({ user, role }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm font-semibold text-gray-600 mb-2">{role}</p>
    <div className="flex items-center">
      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 flex items-center">
            {user.name}
            {/* FIX: Changed 'kycVerified' to 'kycStatus' to match the User type definition. */}
            {user.kycStatus === KycStatus.Verified && <VerifiedIcon className="w-4 h-4 text-blue-500 ml-1.5" title="KYC Verified" />}
        </p>
        <p className="text-xs text-gray-500">{user.phone}</p>
      </div>
    </div>
  </div>
);

const AdminTransactionDetailModal: React.FC<AdminTransactionDetailModalProps> = ({ transaction, onClose }) => {
    const getSender = (senderId: string): User => transaction.buyer.id === senderId ? transaction.buyer : transaction.seller;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="relative group">
                <h2 className="text-xl font-bold text-gray-800 cursor-pointer">Transaction: {transaction.id}</h2>
                <div className="absolute top-full left-0 mt-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <TransactionWorkflow transaction={transaction} />
                </div>
            </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <EscrowWallet transaction={transaction} />

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Details</h3>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between"><span className="font-medium text-gray-600">Product:</span> <span>{transaction.product}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-600">Date:</span> <span>{new Date(transaction.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-600">Status:</span> <span>{transaction.status}</span></div>
                <div className="border-t border-blue-200 my-2"></div>
                <div className="flex justify-between"><span className="font-medium text-gray-600">Amount (to Seller):</span> <span>{transaction.currency} {transaction.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-600">Escrow Fee (5%):</span> <span>{transaction.currency} {transaction.fee.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-base"><span className="font-medium text-gray-800">Total Paid by Buyer:</span> <span className="text-blue-700">{transaction.currency} {transaction.totalAmountCharged.toLocaleString()}</span></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parties Involved</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UserCard user={transaction.buyer} role="Buyer" />
              <UserCard user={transaction.seller} role="Seller" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Terms / Agreement</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{transaction.terms}"</p>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-semibold text-gray-700 mb-3">Communication History</h3>
             <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto space-y-4 pr-2">
                 {transaction.messages.length > 0 ? (
                    transaction.messages.map((message, index) => {
                        const sender = getSender(message.senderId);
                        const isBuyer = sender.id === transaction.buyer.id;
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-sm font-semibold text-gray-800">{sender.name}</p>
                                         <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {isBuyer ? 'Buyer' : 'Seller'}
                                        </span>
                                        <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg mt-1 border border-gray-200">
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No messages for this transaction.</p>
                )}
             </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl text-center">
            <p className="text-sm text-gray-600">This is a read-only view for administrative oversight.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionDetailModal;
