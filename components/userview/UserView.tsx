
import React, { useState } from 'react';
import type { Transaction, Dispute, User } from '../../types';
import BuyerView from './BuyerView';
import SellerView from './SellerView';
import CreateTransactionModal from './CreateTransactionModal';
import TransactionDetailModal from './TransactionDetailModal';
import SellerAnalyticsView from './SellerAnalyticsView';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { TransactionStatus, DisputeStatus, AuditLogAction, DeliveryStatus, NotificationEventType } from '../../types';

interface UserViewProps {
  currentUser: User;
  allUsers: User[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  disputes: Dispute[];
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
  addNotification: (userId: string, eventType: NotificationEventType, message: string) => void;
  addAuditLog: (actor: User, action: AuditLogAction, targetId: string | undefined, details: string) => void;
  onUpdateDeliveryStatus: (transactionId: string, newStatus: DeliveryStatus) => void;
  onAddTransactionMessage: (transactionId: string, sender: User, text: string) => void;
  onSellerResponse: (transactionId: string, response: 'accepted' | 'rejected') => void;
  onLeaveReview: (transactionId: string, rating: number, review: string) => void;
  initialView?: 'buyer' | 'seller' | 'analytics';
}

const UserView: React.FC<UserViewProps> = ({ 
    currentUser, 
    allUsers, 
    transactions, 
    setTransactions, 
    disputes, 
    setDisputes, 
    addNotification, 
    addAuditLog,
    onUpdateDeliveryStatus,
    onAddTransactionMessage,
    onSellerResponse,
    onLeaveReview,
    initialView = 'buyer',
}) => {
  const [view, setView] = useState<'buyer' | 'seller' | 'analytics'>(initialView);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleCreateTransaction = (seller: User, product: string, amount: number, terms: string, fee: number, totalAmountCharged: number, currency: 'KES' | 'USD') => {
    // Basic Fraud Detection: Check for recent similar transactions
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isPotentialDuplicate = transactions.some(t => 
        t.buyer.id === currentUser.id &&
        t.seller.id === seller.id &&
        t.product === product &&
        t.amount === amount &&
        new Date(t.createdAt) > fiveMinutesAgo
    );
    
    const newTransaction: Transaction = {
      id: `txn-${Math.random().toString(36).substr(2, 5)}`,
      buyer: currentUser,
      seller,
      amount,
      fee,
      totalAmountCharged,
      product,
      status: TransactionStatus.AwaitingSellerAcceptance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buyerConfirmed: false,
      sellerConfirmed: false,
      terms,
      deliveryStatus: DeliveryStatus.AwaitingShipment,
      messages: [],
      currency,
      isFlagged: isPotentialDuplicate,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    addNotification(seller.id, NotificationEventType.TransactionUpdate, `You have a new transaction request from ${currentUser.name} for "${product}".`);
    addNotification(currentUser.id, NotificationEventType.TransactionUpdate, `Your transaction request for "${product}" has been sent to the seller.`);
    addAuditLog(currentUser, AuditLogAction.TransactionCreated, newTransaction.id, `${currentUser.name} created transaction for "${product}" with ${seller.name}.`);

    if (isPotentialDuplicate) {
        const adminUser = allUsers.find(u => u.role === 'admin');
        if (adminUser) {
            addNotification(adminUser.id, NotificationEventType.TransactionUpdate, `Suspicious transaction flagged for review: ${newTransaction.id}`);
        }
        addAuditLog(currentUser, AuditLogAction.FraudDetected, newTransaction.id, `Potential duplicate transaction detected and flagged.`);
    }

    setIsCreateModalOpen(false);
  };

  const handleConfirmTransaction = (transactionId: string) => {
     setTransactions(prev => prev.map(t => {
        if (t.id === transactionId) {
            const isBuyer = t.buyer.id === currentUser.id;
            const wasOtherPartyConfirmed = isBuyer ? t.sellerConfirmed : t.buyerConfirmed;
            
            const otherPartyId = isBuyer ? t.seller.id : t.buyer.id;
            addNotification(otherPartyId, NotificationEventType.TransactionUpdate, `${currentUser.name} has confirmed the transaction for "${t.product}".`);

            if (wasOtherPartyConfirmed) {
                addNotification(t.buyer.id, NotificationEventType.FundsReleased, `Funds for "${t.product}" have now been released to the seller.`);
                addNotification(t.seller.id, NotificationEventType.FundsReleased, `Funds for "${t.product}" have been released to your account.`);
            }

            return {
                ...t,
                buyerConfirmed: isBuyer ? true : t.buyerConfirmed,
                sellerConfirmed: !isBuyer ? true : t.sellerConfirmed,
                updatedAt: new Date().toISOString(),
            };
        }
        return t;
     }));
  }

  const handleCreateDispute = (transaction: Transaction, reason: string) => {
    const newDispute: Dispute = {
        id: `disp-${Math.random().toString(36).substr(2, 5)}`,
        transaction,
        reason,
        messages: [{
            senderId: currentUser.id,
            text: reason,
            timestamp: new Date().toISOString(),
        }],
        createdAt: new Date().toISOString(),
        status: DisputeStatus.Open,
    };
    setDisputes(prev => [newDispute, ...prev]);
    setTransactions(prev => prev.map(t => t.id === transaction.id ? {...t, status: TransactionStatus.Disputed, updatedAt: new Date().toISOString()} : t));
    
    const otherPartyId = transaction.buyer.id === currentUser.id ? transaction.seller.id : transaction.buyer.id;
    const adminUser = allUsers.find(u => u.role === 'admin');

    addNotification(otherPartyId, NotificationEventType.DisputeRaised, `${currentUser.name} has raised a dispute for the transaction "${transaction.product}".`);
    if (adminUser) {
      addNotification(adminUser.id, NotificationEventType.DisputeRaised, `New dispute from ${currentUser.name} on "${transaction.product}" (Txn: ${transaction.id}).`);
    }
    
    addAuditLog(currentUser, AuditLogAction.DisputeRaised, newDispute.id, `${currentUser.name} raised a dispute for transaction "${transaction.product}".`);
    setSelectedTransaction(t => t ? {...t, status: TransactionStatus.Disputed} : null); // Update status in modal view
  };

  const downloadUserCSV = () => {
    const headers = [
      'ID', 'Date', 'Product', 'Role', 'Other Party', 'Amount', 
      'Fee', 'Total Charged / Received', 'Currency', 'Status'
    ];
    
    const rows = transactions.map(t => {
      const isBuyer = t.buyer.id === currentUser.id;
      return [
        t.id,
        new Date(t.createdAt).toISOString(),
        `"${t.product.replace(/"/g, '""')}"`,
        isBuyer ? 'Buyer' : 'Seller',
        `"${(isBuyer ? t.seller.name : t.buyer.name).replace(/"/g, '""')}"`,
        t.amount,
        isBuyer ? t.fee : '-', // Fee only applies to buyer
        isBuyer ? t.totalAmountCharged : t.amount,
        t.currency,
        t.status,
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `escrow_history_${currentUser.username}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto">
      {isCreateModalOpen && (
        <CreateTransactionModal
          buyer={currentUser}
          sellers={allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin')}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTransaction}
        />
      )}
      
      {selectedTransaction && (
        <TransactionDetailModal
            transaction={selectedTransaction}
            currentUser={currentUser}
            onClose={() => setSelectedTransaction(null)}
            onConfirmTransaction={handleConfirmTransaction}
            onCreateDispute={handleCreateDispute}
            onAddMessage={(text) => onAddTransactionMessage(selectedTransaction.id, currentUser, text)}
            onUpdateDeliveryStatus={(newStatus) => onUpdateDeliveryStatus(selectedTransaction.id, newStatus)}
            onSellerResponse={(response) => {
                onSellerResponse(selectedTransaction.id, response);
                const newStatus = response === 'accepted' ? TransactionStatus.Pending : TransactionStatus.Rejected;
                setSelectedTransaction(t => t ? {...t, status: newStatus } : null);
            }}
            onLeaveReview={(rating, review) => onLeaveReview(selectedTransaction.id, rating, review)}
        />
      )}

      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-semibold text-gray-800">My Transactions</h2>
            <p className="text-sm text-gray-500">Viewing your activity as a buyer and seller.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
                onClick={downloadUserCSV}
                className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 flex items-center justify-center"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download History
            </button>
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
                New Transaction
            </button>
        </div>
      </div>

      {/* View Toggles and Content */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setView('buyer')}
              className={`${
                view === 'buyer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              As Buyer
            </button>
            <button
              onClick={() => setView('seller')}
              className={`${
                view === 'seller'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              As Seller
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`${
                view === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <AnalyticsIcon className="w-5 h-5 mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        <div>
          {view === 'buyer' && (
            <BuyerView 
                transactions={transactions.filter(t => t.buyer.id === currentUser.id)}
                onSelectTransaction={setSelectedTransaction}
            />
          )}
          {view === 'seller' && (
            <SellerView 
                transactions={transactions.filter(t => t.seller.id === currentUser.id)}
                onSelectTransaction={setSelectedTransaction}
            />
          )}
          {view === 'analytics' && (
             <SellerAnalyticsView 
                transactions={transactions.filter(t => t.seller.id === currentUser.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;
