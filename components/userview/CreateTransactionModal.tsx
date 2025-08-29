

import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import MpesaIcon from '../icons/MpesaIcon';

interface CreateTransactionModalProps {
  buyer: User;
  sellers: User[];
  onClose: () => void;
  onCreate: (seller: User, product: string, amount: number, terms: string, fee: number, totalAmountCharged: number, currency: 'KES' | 'USD') => void;
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({ buyer, sellers, onClose, onCreate }) => {
  const [step, setStep] = useState<'details' | 'mpesaPrompt'>('details');
  const [sellerId, setSellerId] = useState<string>(sellers[0]?.id || '');
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [terms, setTerms] = useState('');
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  const [error, setError] = useState('');

  const [fee, setFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const numericAmount = parseFloat(amount);
    if (!isNaN(numericAmount) && numericAmount > 0) {
      const calculatedFee = numericAmount * 0.05;
      setFee(calculatedFee);
      setTotalAmount(numericAmount + calculatedFee);
    } else {
      setFee(0);
      setTotalAmount(0);
    }
  }, [amount]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const selectedSeller = sellers.find(s => s.id === sellerId);
    const numericAmount = parseFloat(amount);
    
    if (selectedSeller && product && terms && !isNaN(numericAmount) && numericAmount > 0) {
      setStep('mpesaPrompt');
    } else {
      setError("Please fill in all fields correctly with a valid amount.");
    }
  };

  const handleConfirmMpesaPayment = () => {
    const selectedSeller = sellers.find(s => s.id === sellerId);
    const numericAmount = parseFloat(amount);
    if (selectedSeller) {
        onCreate(selectedSeller, product, numericAmount, terms, fee, totalAmount, currency);
    }
  };

  const renderDetailsForm = () => (
    <form onSubmit={handleDetailsSubmit}>
      <div className="p-6 space-y-4">
        <div>
          <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
            Seller
          </label>
          <select
            id="seller"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700">
            Product or Service
          </label>
          <input
            type="text"
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
            placeholder="e.g., Handmade Leather Wallet"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="e.g., 5000"
              className="flex-1 block w-full border border-gray-300 rounded-none rounded-l-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'KES' | 'USD')}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
            >
              <option>KES</option>
              <option>USD</option>
            </select>
          </div>
        </div>
        
        {totalAmount > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Escrow Fee (5%):</span>
              <span>{currency} {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total to Pay:</span>
              <span>{currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
            Terms / Agreement
          </label>
          <textarea
            id="terms"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            required
            placeholder="e.g., Delivery within 3 days. Item must be in new condition."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
         {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Proceed to Payment
        </button>
      </div>
    </form>
  );

  const renderMpesaPrompt = () => (
    <div className="p-6 flex flex-col items-center text-center">
        <MpesaIcon className="w-20 h-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-800">M-PESA STK PUSH SENT</h3>
        <p className="text-sm text-gray-600">
            Please check your phone to authorize the payment.
        </p>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-4 w-full text-sm text-left space-y-2">
            <div className="flex justify-between text-gray-600">
                <span>Amount to Seller:</span>
                <span className="font-medium text-gray-800">{currency} {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
                <span>Escrow Fee (5%):</span>
                <span className="font-medium text-gray-800">{currency} {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-base">
                    <span className="text-gray-900">Total to Pay:</span>
                    <span className="text-blue-600">{currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
        <div className="w-full space-y-3">
             <button
              onClick={handleConfirmMpesaPayment}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
            >
              Confirm Payment on Phone
            </button>
             <button
              onClick={onClose}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Cancel Payment
            </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'details' ? 'Start a New Transaction' : 'Confirm Your Payment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {step === 'details' ? renderDetailsForm() : renderMpesaPrompt()}
      </div>
    </div>
  );
};

export default CreateTransactionModal;