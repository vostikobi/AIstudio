import React from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus } from '../../types';
import LockIcon from '../icons/LockIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import GavelIcon from '../icons/GavelIcon';
import RefundIcon from '../icons/RefundIcon';
import XCircleIcon from '../icons/XCircleIcon';

interface EscrowWalletProps {
  transaction: Transaction;
}

const EscrowWallet: React.FC<EscrowWalletProps> = ({ transaction }) => {
  let statusInfo: {
    icon: React.ReactNode;
    text: string;
    bgColor: string;
    textColor: string;
  };

  switch (transaction.status) {
    case TransactionStatus.Pending:
    case TransactionStatus.AwaitingSellerAcceptance:
      statusInfo = {
        icon: <LockIcon className="w-8 h-8" />,
        text: 'Funds Secured & Held in Escrow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      };
      break;
    case TransactionStatus.Released:
    case TransactionStatus.Completed:
      statusInfo = {
        icon: <CheckCircleIcon className="w-8 h-8" />,
        text: 'Funds Released to Seller',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      };
      break;
    case TransactionStatus.Disputed:
      statusInfo = {
        icon: <GavelIcon className="w-8 h-8" />,
        text: 'Funds Locked - Dispute Active',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      };
      break;
    case TransactionStatus.Refunded:
      statusInfo = {
        icon: <RefundIcon className="w-8 h-8" />,
        text: 'Amount Refunded to Buyer (Fee Retained)',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
      };
      break;
    case TransactionStatus.Canceled:
    case TransactionStatus.Rejected:
      statusInfo = {
        icon: <XCircleIcon className="w-8 h-8" />,
        text: 'Transaction Canceled/Rejected',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      };
      break;
    default:
        statusInfo = {
            icon: <LockIcon className="w-8 h-8" />,
            text: 'Status Unknown',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
        };
  }

  return (
    <div className={`p-4 rounded-lg flex items-center space-x-4 ${statusInfo.bgColor} border ${statusInfo.bgColor.replace('bg-', 'border-')}-200`}>
      <div className={`flex-shrink-0 ${statusInfo.textColor}`}>
        {statusInfo.icon}
      </div>
      <div className="flex-grow">
        <p className={`font-bold text-lg ${statusInfo.textColor}`}>{statusInfo.text}</p>
        <p className="text-sm text-gray-700">Amount: <span className="font-semibold">{transaction.currency} {transaction.amount.toLocaleString()}</span></p>
      </div>
    </div>
  );
};

export default EscrowWallet;