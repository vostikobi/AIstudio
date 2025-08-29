import React, { useState } from 'react';
import type { User } from '../../types';
import { NotificationEventType, KycStatus } from '../../types';
import NotificationSettingsView from './NotificationSettingsView';
import VerifiedIcon from '../icons/VerifiedIcon';

interface UserProfileViewProps {
  user: User;
  users: User[]; // For checking conflicts
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  onUpdateAvatar: (userId: string, newAvatarUrl: string) => void;
  onUpdateNotificationPreferences: (newPreferences: User['notificationPreferences']) => void;
  onKycSubmit: () => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, users, setUsers, setCurrentUser, onUpdateAvatar, onUpdateNotificationPreferences, onKycSubmit }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'verification'>('profile');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(user.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    // --- Input Format Validation ---
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
    }

    const phoneRegex = /^\+254\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid Kenyan phone number (e.g., +254712345678).');
        return;
    }

    // --- Conflict Validation ---
    if (users.some(u => u.id !== user.id && u.email === formData.email)) {
        setError('This email is already in use by another account.');
        return;
    }
    if (users.some(u => u.id !== user.id && u.phone === formData.phone)) {
        setError('This phone number is already in use by another account.');
        return;
    }

    let updatedUser = { ...user, name: formData.name, email: formData.email, phone: formData.phone, password: user.password };

    // --- Password Change Logic & Validation ---
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('To change your password, please fill all three password fields.');
            return;
        }
        if (formData.currentPassword !== user.password) {
            setError('The current password you entered is incorrect.');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        updatedUser.password = formData.newPassword;
    }

    setUsers(prevUsers => prevUsers.map(u => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    setSuccess('Profile updated successfully!');
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };
  
  const KycVerificationView = () => {
    let statusContent;
    switch (user.kycStatus) {
        case KycStatus.Verified:
            statusContent = (
                <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
                    <VerifiedIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-green-800">You are a Verified User</h4>
                    <p className="text-sm text-green-700 mt-1">Your identity has been confirmed. The "Verified" badge is now visible on your profile.</p>
                </div>
            );
            break;
        case KycStatus.PendingReview:
            statusContent = (
                <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-lg font-bold text-yellow-800">Submission Under Review</h4>
                    <p className="text-sm text-yellow-700 mt-1">Your documents have been received and are being reviewed by our team. This usually takes 24-48 hours.</p>
                </div>
            );
            break;
        case KycStatus.Rejected:
             statusContent = (
                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-lg font-bold text-red-800">Submission Rejected</h4>
                    <p className="text-sm text-red-700 mt-1 mb-4">Your KYC submission could not be approved. Please check your notifications for more details and try again.</p>
                    <button onClick={onKycSubmit} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                        Re-Submit Documents
                    </button>
                </div>
            );
            break;
        case KycStatus.NotSubmitted:
        default:
             statusContent = (
                <div className="text-center p-8">
                    <h4 className="text-lg font-bold text-gray-800">Verify Your Identity</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">Become a verified user to increase trust. Submit your documents for review.</p>
                    <button onClick={onKycSubmit} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                        Start Verification
                    </button>
                </div>
            );
            break;
    }
    return <div className="p-6">{statusContent}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left gap-6 mb-6">
                <div className="relative group w-24 h-24 flex-shrink-0">
                    <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-sm font-bold rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                    </label>
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                </div>
                <div>
                     <h3 className="text-xl font-semibold text-gray-700">My Profile</h3>
                     <p className="text-sm text-gray-500 mt-1">Update your personal details, password, and notification settings.</p>
                </div>
            </div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Edit Profile
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`${activeTab === 'notifications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Notification Settings
                    </button>
                    <button onClick={() => setActiveTab('verification')} className={`${activeTab === 'verification' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Verification
                    </button>
                </nav>
            </div>
        </div>

        {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                <div>
                    <h4 className="text-md font-semibold text-gray-600 border-b pb-2 mb-4">Personal Information</h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required placeholder="+254712345678" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-md font-semibold text-gray-600 border-b pb-2 mb-4">Change Password (optional)</h4>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input type="password" id="currentPassword" value={formData.currentPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" id="newPassword" value={formData.newPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <div className="pt-4">
                    <button
                    type="submit"
                    className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    >
                    Update Profile Details
                    </button>
                </div>
            </form>
        )}
        
        {activeTab === 'notifications' && (
            <NotificationSettingsView 
                preferences={user.notificationPreferences}
                onSave={onUpdateNotificationPreferences}
            />
        )}
        
        {activeTab === 'verification' && <KycVerificationView />}
      </div>
    </div>
  );
};

export default UserProfileView;