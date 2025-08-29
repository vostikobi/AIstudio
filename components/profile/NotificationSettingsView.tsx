import React, { useState } from 'react';
import type { User } from '../../types';
import { NotificationEventType } from '../../types';

interface NotificationSettingsViewProps {
    preferences: User['notificationPreferences'];
    onSave: (newPreferences: User['notificationPreferences']) => void;
}

const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({ preferences, onSave }) => {
    const [currentPrefs, setCurrentPrefs] = useState(preferences);
    const [successMessage, setSuccessMessage] = useState('');

    const handlePrefChange = (eventType: NotificationEventType, channel: keyof User['notificationPreferences'][NotificationEventType]) => {
        setCurrentPrefs(prev => {
            const newPrefs = { ...prev };
            newPrefs[eventType] = {
                ...newPrefs[eventType],
                [channel]: !newPrefs[eventType][channel],
            };
            return newPrefs;
        });
        setSuccessMessage('');
    };

    const handleSave = () => {
        onSave(currentPrefs);
        setSuccessMessage('Notification settings saved successfully!');
    };

    return (
        <div className="p-6">
            <div className="space-y-6">
                {Object.values(NotificationEventType).map((eventType) => (
                    <div key={eventType}>
                        <p className="text-sm font-medium text-gray-800">{eventType}</p>
                        <p className="text-xs text-gray-500 mb-3">Choose how you want to be notified for this event.</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={currentPrefs[eventType]?.inApp ?? true} onChange={() => handlePrefChange(eventType, 'inApp')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-2">In-App</span>
                            </label>
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={currentPrefs[eventType]?.email ?? true} onChange={() => handlePrefChange(eventType, 'email')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-2">Email</span>
                            </label>
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input type="checkbox" checked={currentPrefs[eventType]?.sms ?? true} onChange={() => handlePrefChange(eventType, 'sms')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-2">SMS</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            {successMessage && <p className="text-sm text-green-600 text-center mt-6">{successMessage}</p>}

            <div className="pt-6 mt-6 border-t">
                <button
                    onClick={handleSave}
                    className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                >
                    Save Notification Settings
                </button>
            </div>
        </div>
    );
};

export default NotificationSettingsView;
