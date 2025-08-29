import React from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus, DeliveryStatus } from '../../types';

const getStatusClass = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.Completed:
    case TransactionStatus.Released:
      return 'bg-green-100 text-green-800';
    case TransactionStatus.Pending:
      return 'bg-yellow-100 text-yellow-800';
    case TransactionStatus.AwaitingSellerAcceptance:
        return 'bg-blue-100 text-blue-800';
    case TransactionStatus.Disputed:
      return 'bg-red-100 text-red-800';
    case TransactionStatus.Canceled:
    case TransactionStatus.Refunded:
    case TransactionStatus.Rejected:
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDeliveryStatusClass = (status: DeliveryStatus) => {
    switch (status) {
        case DeliveryStatus.AwaitingShipment:
            return 'bg-gray-100 text-gray-700';
        case DeliveryStatus.Shipped:
            return 'bg-blue-100 text-blue-700';
        case DeliveryStatus.Delivered:
            return 'bg-purple-100 text-purple-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

interface TransactionCardProps {
    transaction: Transaction;
    perspective: 'buyer' | 'seller';
    onSelect: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, perspective, onSelect }) => {
    const otherParty = perspective === 'buyer' ? transaction.seller : transaction.buyer;
    const otherPartyRole = perspective === 'buyer' ? 'Seller' : 'Buyer';

    return (
        <button onClick={onSelect} className="w-full text-left border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150">
            <div className="flex-grow">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-2">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                        {transaction.status}
                    </span>
                     <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getDeliveryStatusClass(transaction.deliveryStatus)}`}>
                        {transaction.deliveryStatus}
                    </span>
                    <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <h4 className="text-md font-semibold text-gray-800">{transaction.product}</h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                    <img src={otherParty.avatarUrl} alt={otherParty.name} className="w-6 h-6 rounded-full mr-2" />
                    <span>{otherPartyRole}: {otherParty.name}</span>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                    <p className="text-lg font-bold text-gray-900">{transaction.currency} {transaction.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">ID: {transaction.id}</p>
                </div>
            </div>
        </button>
    )
}

export default TransactionCard;