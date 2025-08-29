import React from 'react';
import type { Transaction } from '../../types';
import TransactionCard from './TransactionCard';

interface BuyerViewProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const BuyerView: React.FC<BuyerViewProps> = ({ transactions, onSelectTransaction }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Purchases</h3>
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map(tx => (
            <TransactionCard 
              key={tx.id} 
              transaction={tx} 
              perspective="buyer"
              onSelect={() => onSelectTransaction(tx)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">You have not made any purchases.</p>
      )}
    </div>
  );
};

export default BuyerView;
