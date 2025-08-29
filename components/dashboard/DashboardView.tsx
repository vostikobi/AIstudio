

import React, { useState } from 'react';
import StatCard from './StatCard';
import DashboardIcon from '../icons/DashboardIcon';
import TransactionIcon from '../icons/TransactionIcon';
import DisputeIcon from '../icons/DisputeIcon';
import FlagIcon from '../icons/FlagIcon';
import TransactionsView from '../transactions/TransactionsView';
import AuditLogView from './AuditLogView';
import RevenueIcon from '../icons/RevenueIcon';
import WithdrawModal from './WithdrawModal';
import TransactionChart from './TransactionChart';
import type { Transaction, Dispute, AuditLog, PlatformSettings } from '../../types';

interface DashboardViewProps {
    transactions: Transaction[];
    disputes: Dispute[];
    auditLogs: AuditLog[];
    platformBalance: number;
    platformSettings: PlatformSettings;
    onWithdraw: (amount: number) => void;
    // FIX: Add missing properties to pass to TransactionsView
    onDismissFlag: (transactionId: string) => void;
    onCancelTransaction: (transactionId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
    transactions, 
    disputes, 
    auditLogs, 
    platformBalance, 
    platformSettings, 
    onWithdraw,
    onDismissFlag,
    onCancelTransaction 
}) => {
  const totalTransactions = transactions.length;
  const totalVolumeKES = transactions.filter(t => t.currency === 'KES').reduce((sum, txn) => sum + txn.totalAmountCharged, 0);
  const activeDisputes = disputes.filter(d => d.status === 'Open').length;
  const flaggedForReview = transactions.filter(t => t.isFlagged).length;
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <>
      {isWithdrawModalOpen && (
        <WithdrawModal
          availableBalance={platformBalance}
          settings={platformSettings}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdraw={onWithdraw}
        />
      )}
      <div className="container mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Transactions"
            value={totalTransactions.toString()}
            icon={<TransactionIcon className="w-6 h-6 text-blue-500" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Total Volume (KES)"
            value={totalVolumeKES.toLocaleString()}
            icon={<DashboardIcon className="w-6 h-6 text-green-500" />}
            color="bg-green-100"
          />
          <StatCard
            title="Active Disputes"
            value={activeDisputes.toString()}
            icon={<DisputeIcon className="w-6 h-6 text-red-500" />}
            color="bg-red-100"
          />
          <StatCard
            title="Flagged for Review"
            value={flaggedForReview.toString()}
            icon={<FlagIcon className="w-6 h-6 text-yellow-500" />}
            color="bg-yellow-100"
          />
          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Platform Revenue</p>
                <p className="text-2xl font-bold text-gray-800">KES {platformBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <RevenueIcon className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        <TransactionChart transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionsView 
                transactions={transactions} 
                showFilters={false} 
                initialItemCount={5} 
                title="Recent Transactions" 
                onDismissFlag={onDismissFlag} 
                onCancelTransaction={onCancelTransaction} 
            />
          </div>
          <div className="lg:col-span-1">
            <AuditLogView auditLogs={auditLogs} />
          </div>
        </div>

      </div>
    </>
  );
};

export default DashboardView;