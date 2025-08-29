
import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus } from '../../types';
import FlagIcon from '../icons/FlagIcon';
import DownloadIcon from '../icons/DownloadIcon';
import AdminTransactionDetailModal from './AdminTransactionDetailModal';
import FlaggedTransactionModal from './FlaggedTransactionModal';
import EyeIcon from '../icons/EyeIcon';

const getStatusClass = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.Completed:
    case TransactionStatus.Released:
      return 'bg-green-100 text-green-800';
    case TransactionStatus.Pending:
    case TransactionStatus.AwaitingSellerAcceptance:
      return 'bg-yellow-100 text-yellow-800';
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

interface TransactionsViewProps {
    transactions: Transaction[];
    showFilters?: boolean;
    initialItemCount?: number;
    title?: string;
    onDismissFlag: (transactionId: string) => void;
    onCancelTransaction: (transactionId: string) => void;
}

type SortKey = 'totalAmountCharged' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKey;
    currentSortKey: SortKey | null;
    sortDirection: SortDirection;
    onSort: (key: SortKey) => void;
}> = ({ label, sortKey, currentSortKey, sortDirection, onSort }) => {
    const isActive = currentSortKey === sortKey;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                <span>{label}</span>
                {isActive && (
                    <span className="ml-1">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </div>
        </th>
    );
};


const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, showFilters = true, initialItemCount, title, onDismissFlag, onCancelTransaction }) => {
  const [filter, setFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [flaggedTransactionToReview, setFlaggedTransactionToReview] = useState<Transaction | null>(null);


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        setSortKey(key);
        setSortDirection('asc');
    }
  };

  const sortedTransactions = useMemo(() => {
    let sortableItems = transactions.filter(t => filter === 'all' || t.status === filter);

    if (sortKey) {
        sortableItems.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (a[sortKey] > b[sortKey]) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
  }, [filter, transactions, sortKey, sortDirection]);

  const displayTransactions = initialItemCount ? sortedTransactions.slice(0, initialItemCount) : sortedTransactions;

  const downloadCSV = () => {
    const headers = [
      'ID', 'Product', 'Buyer Name', 'Buyer Email', 'Seller Name', 'Seller Email', 
      'Amount', 'Fee', 'Total Charged', 'Currency', 'Status', 'Created At', 'Updated At'
    ];
    
    const rows = sortedTransactions.map(t => [
      t.id,
      `"${t.product.replace(/"/g, '""')}"`,
      `"${t.buyer.name.replace(/"/g, '""')}"`,
      t.buyer.email,
      `"${t.seller.name.replace(/"/g, '""')}"`,
      t.seller.email,
      t.amount,
      t.fee,
      t.totalAmountCharged,
      t.currency,
      t.status,
      t.createdAt,
      t.updatedAt
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {selectedTransaction && (
        <AdminTransactionDetailModal 
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
      {flaggedTransactionToReview && (
        <FlaggedTransactionModal 
            transaction={flaggedTransactionToReview}
            onClose={() => setFlaggedTransactionToReview(null)}
            onDismiss={() => {
                onDismissFlag(flaggedTransactionToReview.id);
                setFlaggedTransactionToReview(null);
            }}
            onCancel={() => {
                onCancelTransaction(flaggedTransactionToReview.id);
                setFlaggedTransactionToReview(null);
            }}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        {(title || showFilters) && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              {title && <h3 className="text-xl font-semibold text-gray-700">{title}</h3>}
              {showFilters && (
                  <div className="flex w-full flex-col sm:flex-row gap-2 sm:w-auto">
                      <select 
                          value={filter} 
                          onChange={(e) => setFilter(e.target.value)}
                          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                          <option value="all">All Statuses</option>
                          {Object.values(TransactionStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                          ))}
                      </select>
                      <button 
                          onClick={downloadCSV}
                          className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 flex items-center justify-center"
                      >
                          <DownloadIcon className="w-4 h-4 mr-2" />
                          Download as Excel
                      </button>
                  </div>
              )}
            </div>
        )}
        
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer & Seller</th>
                <SortableHeader label="Total Charged" sortKey="totalAmountCharged" currentSortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label="Date" sortKey="createdAt" currentSortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id} onClick={() => setSelectedTransaction(transaction)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {transaction.id}
                      {transaction.isFlagged && <FlagIcon className="w-4 h-4 text-red-500 ml-2" title="Flagged for review: Potential duplicate" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={transaction.buyer.avatarUrl} alt={transaction.buyer.name} title={`Buyer: ${transaction.buyer.name}`} />
                      <span className="mx-2">→</span>
                      <img className="h-8 w-8 rounded-full" src={transaction.seller.avatarUrl} alt={transaction.seller.name} title={`Seller: ${transaction.seller.name}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{transaction.currency} {transaction.totalAmountCharged.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.isFlagged && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setFlaggedTransactionToReview(transaction); }}
                            className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition duration-200 flex items-center"
                        >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Review
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayTransactions.length === 0 && (
                  <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500">
                          No transactions match the current filter.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {displayTransactions.map((transaction) => (
            <div key={transaction.id} onClick={() => setSelectedTransaction(transaction)} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{transaction.product}</p>
                  <div className="flex items-center">
                      <p className="text-xs text-gray-500">{transaction.id}</p>
                      {transaction.isFlagged && <FlagIcon className="w-4 h-4 text-red-500 ml-2" title="Flagged for review: Potential duplicate" />}
                  </div>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Date:</span>
                  <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Total Charged:</span>
                  <span className="font-bold text-gray-900">{transaction.currency} {transaction.totalAmountCharged.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Parties</p>
                <div className="flex items-center text-sm">
                  <img className="h-6 w-6 rounded-full" src={transaction.buyer.avatarUrl} alt={transaction.buyer.name} title={`Buyer: ${transaction.buyer.name}`} />
                  <span className="px-2 text-gray-400">→</span>
                  <img className="h-6 w-6 rounded-full" src={transaction.seller.avatarUrl} alt={transaction.seller.name} title={`Seller: ${transaction.seller.name}`} />
                </div>
              </div>
               {transaction.isFlagged && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); setFlaggedTransactionToReview(transaction); }}
                        className="w-full px-2 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-yellow-600 transition duration-200 flex items-center justify-center"
                    >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Review Flagged Transaction
                    </button>
                </div>
              )}
            </div>
          ))}
          {displayTransactions.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No transactions match the current filter.
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default TransactionsView;
