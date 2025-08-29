
import React from 'react';
import type { Transaction } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface FlaggedTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onDismiss: () => void;
  onCancel: () => void;
}

const FlaggedTransactionModal: React.FC<FlaggedTransactionModalProps> = ({ transaction, onClose, onDismiss, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Review Flagged Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.636-1.026 2.15-1.026 2.786 0l5.873 9.477c.636 1.026-.114 2.349-1.393 2.349H3.777c-1.28 0-2.03-1.323-1.393-2.349L8.257 3.099zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 001 1h0a1 1 0 001-1V8a1 1 0 00-2 0v2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This transaction was flagged as a potential duplicate. Please review the details before taking action.
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Transaction Details</h3>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span className="font-medium text-gray-600">Transaction ID:</span> <span>{transaction.id}</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600">Product:</span> <span>{transaction.product}</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600">Total Charged:</span> <span className="font-bold">{transaction.currency} {transaction.totalAmountCharged.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600">Buyer:</span> <span>{transaction.buyer.name}</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600">Seller:</span> <span>{transaction.seller.name}</span></div>
            <div className="flex justify-between"><span className="font-medium text-gray-600">Date:</span> <span>{new Date(transaction.createdAt).toLocaleString()}</span></div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
          <button
            onClick={onDismiss}
            className="px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200"
          >
            Dismiss Flag
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlaggedTransactionModal;
