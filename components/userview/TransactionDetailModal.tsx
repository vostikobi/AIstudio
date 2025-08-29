import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Transaction, User } from '../../types';
import { TransactionStatus, DeliveryStatus, KycStatus } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import EscrowWallet from './EscrowWallet';
import TransactionWorkflow from './TransactionWorkflow';
import VerifiedIcon from '../icons/VerifiedIcon';
import StarIcon from '../icons/StarIcon';

interface TransactionDetailModalProps {
  transaction: Transaction;
  currentUser: User;
  onClose: () => void;
  onConfirmTransaction: (transactionId: string) => void;
  onCreateDispute: (transaction: Transaction, reason: string) => void;
  onAddMessage: (text: string) => void;
  onUpdateDeliveryStatus: (newStatus: DeliveryStatus) => void;
  onSellerResponse: (response: 'accepted' | 'rejected') => void;
  onLeaveReview: (rating: number, review: string) => void;
}

const UserCard: React.FC<{ user: User; role: 'Buyer' | 'Seller'; averageRating?: number | null }> = ({ user, role, averageRating }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-600 mb-2">{role}</p>
        {role === 'Seller' && averageRating && (
            <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-gray-600 ml-1">{averageRating.toFixed(1)}</span>
            </div>
        )}
    </div>
    <div className="flex items-center">
      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 flex items-center">
            {user.name}
            {user.kycStatus === KycStatus.Verified && <VerifiedIcon className="w-4 h-4 text-blue-500 ml-1.5" title="KYC Verified" />}
        </p>
        <p className="text-xs text-gray-500">{user.phone}</p>
      </div>
    </div>
  </div>
);

const ChatInterface: React.FC<{
    messages: Transaction['messages'];
    transaction: Transaction;
    currentUser: User;
    onAddMessage: (text: string) => void;
}> = ({ messages, transaction, currentUser, onAddMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const getSender = (senderId: string): User => transaction.buyer.id === senderId ? transaction.buyer : transaction.seller;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onAddMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    return (
        <div>
             <h3 className="text-lg font-semibold text-gray-700 mb-3">Communication</h3>
             <div className="bg-gray-50 p-4 rounded-lg">
                <div className="max-h-48 overflow-y-auto space-y-4 pr-2">
                 {messages.length > 0 ? (
                    messages.map((message, index) => {
                        const sender = getSender(message.senderId);
                        const isCurrentUser = sender.id === currentUser.id;
                        return (
                            <div key={index} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                            <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                <div className={`flex items-baseline space-x-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                                    <p className="text-sm font-semibold text-gray-800">{isCurrentUser ? 'You' : sender.name}</p>
                                    <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`inline-block p-3 rounded-lg mt-1 border ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white border-gray-200'}`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                            </div>
                        );
                    })
                    ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                )}
                 <div ref={messagesEndRef} />
                </div>
                 <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={transaction.status !== TransactionStatus.Pending}
                    />
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200" disabled={transaction.status !== TransactionStatus.Pending}>
                        Send
                    </button>
                 </form>
                 <p className="text-xs text-gray-500 mt-2 text-center">In case of a dispute, this conversation will be reviewed by an administrator.</p>
             </div>
        </div>
    );
}

const ReviewSection: React.FC<{
    transaction: Transaction;
    isBuyer: boolean;
    onLeaveReview: (rating: number, review: string) => void;
}> = ({ transaction, isBuyer, onLeaveReview }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const canLeaveReview = isBuyer && [TransactionStatus.Completed, TransactionStatus.Released].includes(transaction.status) && !transaction.rating;

    if (!canLeaveReview && !transaction.review) {
        return null; // Don't show anything if no review can be left and none exists
    }
    
    const handleSubmit = () => {
        if (rating > 0 && reviewText.trim()) {
            onLeaveReview(rating, reviewText.trim());
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Review</h3>
            {transaction.review ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-5 h-5 ${i < (transaction.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-700 italic">"{transaction.review}"</p>
                    <p className="text-xs text-gray-500 text-right mt-2">- {transaction.buyer.name}</p>
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 mb-2">Leave a review for {transaction.seller.name}</p>
                    <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                            <button key={i} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}>
                                <StarIcon className={`w-6 h-6 transition-colors ${(hoverRating || rating) > i ? 'text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience..."
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <button onClick={handleSubmit} className="mt-3 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                        Submit Review
                    </button>
                </div>
            )}
        </div>
    );
};


const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ 
    transaction, 
    currentUser, 
    onClose,
    onConfirmTransaction,
    onCreateDispute,
    onAddMessage,
    onUpdateDeliveryStatus,
    onSellerResponse,
    onLeaveReview,
}) => {
  const isBuyer = currentUser.id === transaction.buyer.id;
  
  const handleRaiseDispute = () => {
    const reason = prompt(`Please provide a reason for disputing the transaction for "${transaction.product}":`);
    if (reason && reason.trim()) {
        onCreateDispute(transaction, reason.trim());
    }
  }

  // Calculate seller's average rating (simple example)
  const sellerAverageRating = useMemo(() => {
    // In a real app, this would come from a prop or a separate query
    return 4.5; // Dummy value
  }, [transaction.seller.id]);


  const renderActionButtons = () => {
    if (!isBuyer && transaction.status === TransactionStatus.AwaitingSellerAcceptance) {
        return (
            <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Respond to this transaction request:</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={() => onSellerResponse('rejected')} className="px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-200">Reject</button>
                    <button onClick={() => onSellerResponse('accepted')} className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200">Accept Transaction</button>
                </div>
            </div>
        );
    }
    
    if (isBuyer && transaction.status === TransactionStatus.Pending) {
        return (
            <div className="flex justify-end space-x-4">
                <button onClick={handleRaiseDispute} disabled={transaction.buyerConfirmed} className="px-4 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed">Raise Dispute</button>
                <button onClick={() => onConfirmTransaction(transaction.id)} disabled={transaction.buyerConfirmed} className="px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-200 disabled:bg-green-300 disabled:cursor-not-allowed">
                    {transaction.buyerConfirmed ? 'Delivery Confirmed' : 'Confirm Delivery & Release Funds'}
                </button>
            </div>
        );
    }

    if (!isBuyer && transaction.status === TransactionStatus.Pending && !transaction.sellerConfirmed) {
        return (
            <div className="flex justify-end space-x-4">
                <button onClick={() => onConfirmTransaction(transaction.id)} className="px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200">Confirm Transaction</button>
            </div>
        );
    }
    
    return null;
  }
  
  const renderDeliveryStatus = () => {
    if (!isBuyer && (transaction.status === TransactionStatus.Pending || transaction.status === TransactionStatus.Disputed)) {
        return (
            <div className="flex items-center gap-2">
                <label htmlFor="deliveryStatus" className="text-sm font-medium text-gray-700">Delivery Status:</label>
                <select id="deliveryStatus" value={transaction.deliveryStatus} onChange={(e) => onUpdateDeliveryStatus(e.target.value as DeliveryStatus)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    {Object.values(DeliveryStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        );
    }
    return null;
  }

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
              <UserCard user={transaction.seller} role="Seller" averageRating={sellerAverageRating} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Terms / Agreement</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{transaction.terms}"</p>
            </div>
          </div>

          <ChatInterface messages={transaction.messages} transaction={transaction} currentUser={currentUser} onAddMessage={onAddMessage} />
          <ReviewSection transaction={transaction} isBuyer={isBuyer} onLeaveReview={onLeaveReview} />
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center gap-4 flex-wrap">
            <div>{renderDeliveryStatus()}</div>
            <div>{renderActionButtons()}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;