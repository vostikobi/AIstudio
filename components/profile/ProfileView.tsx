import React, { useState } from 'react';
import type { User } from '../../types';

interface ProfileViewProps {
  user: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  onUpdateAvatar: (userId: string, newAvatarUrl: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUsers, setCurrentUser, onUpdateAvatar }) => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

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

    const updatedUser = { ...user, password: formData.newPassword };

    // Update the master list of users
    setUsers(prevUsers => prevUsers.map(u => (u.id === user.id ? updatedUser : u)));
    
    // Update the currently logged-in user's state
    setCurrentUser(updatedUser);

    setSuccess('Password updated successfully!');
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Admin Profile</h3>
        <div className="flex items-center space-x-6 mb-8">
            <div className="relative group w-24 h-24">
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
                <h4 className="text-lg font-bold text-gray-800">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">{user.username}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-md font-semibold text-gray-600 border-b pb-2">Change Password</h4>
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="pt-4">
                <button
                type="submit"
                className="w-full px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                >
                Update Password
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileView;