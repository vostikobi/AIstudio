import React, { useMemo } from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus } from '../../types';
import TransactionCard from './TransactionCard';

interface SellerViewProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const SellerView: React.FC<SellerViewProps> = ({ transactions, onSelectTransaction }) => {

  const { requests, ongoingSales } = useMemo(() => {
    const requests = transactions.filter(t => t.status === TransactionStatus.AwaitingSellerAcceptance);
    const ongoingSales = transactions.filter(t => t.status !== TransactionStatus.AwaitingSellerAcceptance);
    return { requests, ongoingSales };
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* New Transaction Requests Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">New Transaction Requests</h3>
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map(tx => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                perspective="seller"
                onSelect={() => onSelectTransaction(tx)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">You have no new transaction requests.</p>
        )}
      </div>

      {/* Ongoing Sales Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ongoing Sales</h3>
        {ongoingSales.length > 0 ? (
          <div className="space-y-4">
            {ongoingSales.map(tx => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                perspective="seller"
                onSelect={() => onSelectTransaction(tx)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">You do not have any ongoing sales.</p>
        )}
      </div>
    </div>
  );
};

export default SellerView;