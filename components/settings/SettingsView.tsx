import React, { useState } from 'react';
import type { PlatformSettings } from '../../types';

interface SettingsViewProps {
    settings: PlatformSettings;
    onSave: (newSettings: PlatformSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<PlatformSettings>(settings);
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setSuccess('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setSuccess('Settings updated successfully!');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-6">Platform Settings</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-600 border-b pb-2">Withdrawal Bank Account</h4>
                    <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input type="text" id="bankName" value={formData.bankName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">Account Name</label>
                        <input type="text" id="accountName" value={formData.accountName} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input type="text" id="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsView;
