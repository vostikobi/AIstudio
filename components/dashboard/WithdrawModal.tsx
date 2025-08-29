import React, { useState } from 'react';
import type { PlatformSettings } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import BankIcon from '../icons/BankIcon';

interface WithdrawModalProps {
    availableBalance: number;
    settings: PlatformSettings;
    onClose: () => void;
    onWithdraw: (amount: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ availableBalance, settings, onClose, onWithdraw }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleWithdraw = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (numericAmount > availableBalance) {
            setError('Withdrawal amount cannot exceed the available balance.');
            return;
        }
        onWithdraw(numericAmount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Withdraw Platform Revenue</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Available Balance</p>
                        <p className="text-2xl font-bold text-green-600">KES {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount to Withdraw (KES)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError('');
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="e.g., 10000"
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                            <BankIcon className="w-5 h-5 mr-2" />
                            Withdrawal Destination
                        </h4>
                        <div className="text-sm space-y-1">
                            <p><span className="font-medium">Bank:</span> {settings.bankName}</p>
                            <p><span className="font-medium">Account Name:</span> {settings.accountName}</p>
                            <p><span className="font-medium">Account Number:</span> {settings.accountNumber}</p>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={handleWithdraw}
                        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200"
                    >
                        Confirm Withdrawal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
