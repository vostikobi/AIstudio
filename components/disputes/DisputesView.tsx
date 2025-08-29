

import React, { useState, useMemo } from 'react';
// FIX: Import `Transaction` type to use in props.
import type { Dispute, User, Transaction } from '../../types';
import { TransactionStatus, DisputeStatus, AuditLogAction, NotificationEventType } from '../../types';
import DisputeDetailModal from './DisputeDetailModal';

interface DisputesViewProps {
  disputes: Dispute[];
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
  // FIX: Added the 'transactions' prop to align with its usage in App.tsx.
  transactions: Transaction[];
  // FIX: Replaced `Dispute['transaction'][]` with `Transaction[]` for better readability.
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addNotification: (userId: string, eventType: NotificationEventType, message: string) => void;
  addAuditLog: (actor: User, action: AuditLogAction, targetId: string | undefined, details: string) => void;
  adminUser: User;
}

const DisputesView: React.FC<DisputesViewProps> = ({ disputes: initialDisputes, setDisputes, setTransactions, addNotification, addAuditLog, adminUser }) => {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const activeDisputes = useMemo(() => {
    return initialDisputes.filter(d => d.status === DisputeStatus.Open);
  }, [initialDisputes]);


  const handleResolveDispute = (dispute: Dispute, newStatus: TransactionStatus.Released | TransactionStatus.Refunded) => {
    // Update the transaction's status
    setTransactions(prevTransactions => {
      return prevTransactions.map(t =>
        t.id === dispute.transaction.id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      );
    });

    // Update the dispute's status
    setDisputes(prevDisputes => 
        prevDisputes.map(d => 
            d.id === dispute.id ? { ...d, status: DisputeStatus.Resolved } : d
        )
    );
    
    // Notify both parties
    const resolutionAction = newStatus === TransactionStatus.Released ? 'released funds to the seller' : 'refunded the buyer';
    let buyerMessage = `Admin resolved the dispute for "${dispute.transaction.product}". The admin ${resolutionAction}.`;
    let sellerMessage = `Admin resolved the dispute for "${dispute.transaction.product}". The admin ${resolutionAction}.`;
    const currency = dispute.transaction.currency;

    if (newStatus === TransactionStatus.Refunded) {
        buyerMessage = `Admin resolved the dispute for "${dispute.transaction.product}". Your principal amount of ${currency} ${dispute.transaction.amount.toLocaleString()} has been refunded. The escrow fee was retained.`;
        sellerMessage = `Admin resolved the dispute for "${dispute.transaction.product}" by refunding the buyer. The transaction is now closed.`;
    } else if (newStatus === TransactionStatus.Released) {
        buyerMessage = `Admin resolved the dispute for "${dispute.transaction.product}". Funds have been released to the seller.`;
        sellerMessage = `Admin resolved the dispute for "${dispute.transaction.product}". Funds of ${currency} ${dispute.transaction.amount.toLocaleString()} have been released to you.`;
    }
    
    addNotification(dispute.transaction.buyer.id, NotificationEventType.TransactionUpdate, buyerMessage);
    addNotification(dispute.transaction.seller.id, NotificationEventType.TransactionUpdate, sellerMessage);

    // Add to audit log
    addAuditLog(adminUser, AuditLogAction.DisputeResolved, dispute.id, `Resolved dispute for "${dispute.transaction.product}" by ${resolutionAction}.`);

    setSelectedDispute(null);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Active Disputes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties Involved</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Raised</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dispute.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dispute.transaction.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div className="flex items-center">
                        <img className="h-8 w-8 rounded-full" src={dispute.transaction.buyer.avatarUrl} alt={dispute.transaction.buyer.name} title={`Buyer: ${dispute.transaction.buyer.name}`} />
                        <span className="mx-2 text-red-500 font-bold">vs</span>
                        <img className="h-8 w-8 rounded-full" src={dispute.transaction.seller.avatarUrl} alt={dispute.transaction.seller.name} title={`Seller: ${dispute.transaction.seller.name}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{dispute.transaction.currency} {dispute.transaction.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activeDisputes.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>No active disputes.</p>
            </div>
          )}
        </div>
      </div>
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={(newStatus) => handleResolveDispute(selectedDispute, newStatus)}
        />
      )}
    </>
  );
};

export default DisputesView;