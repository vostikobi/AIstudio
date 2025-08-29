import React, { useState } from 'react';
import type { User } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface AddAdminModalProps {
  onClose: () => void;
  // FIX: Replaced 'kycVerified' with 'kycStatus' to match the User type and resolve the type error.
  onAddAdmin: (newAdminData: Omit<User, 'id' | 'role' | 'avatarUrl' | 'isBlacklisted' | 'notificationPreferences' | 'kycStatus'>) => void;
  existingUsers: User[];
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({ onClose, onAddAdmin, existingUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingUsers.some(u => u.username === formData.username)) {
      setError('Username already exists.');
      return;
    }
    if (!formData.name || !formData.username || !formData.password) {
        setError('Please fill in all required fields.');
        return;
    }
    setError('');
    onAddAdmin(formData);
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', required: true },
    { id: 'username', label: 'Username', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
    { id: 'password', label: 'Password', type: 'password', required: true },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Add New Administrator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {fields.map(field => (
                 <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && '*'}
                    </label>
                    <input
                        id={field.id}
                        type={field.type}
                        value={formData[field.id as keyof typeof formData]}
                        onChange={handleChange}
                        required={field.required}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
