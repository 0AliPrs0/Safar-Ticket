import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import AdminUserDetails from '../components/AdminUserDetails';

function AdminManageUsers() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/users/?search=${searchTerm}`);
            setUsers(res.data);
        } catch (error) {
            setNotification({ message: 'Failed to fetch users.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleStatusChange = (userId, newStatus) => {
        setUsers(users.map(u => u.user_id === userId ? { ...u, account_status: newStatus } : u));
        if (selectedUser && selectedUser.user_id === userId) {
            setSelectedUser({ ...selectedUser, account_status: newStatus });
        }
    };

    const UserListItem = ({ user }) => {
        const isActive = selectedUser?.user_id === user.user_id;
        return (
            <div 
                onClick={() => setSelectedUser(user)} 
                className={`p-4 border-s-4 rounded-e-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                        ? 'bg-blue-50 dark:bg-gray-700 border-primary-blue' 
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{user.first_name} {user.last_name}</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.account_status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {user.account_status}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.email}</p>
            </div>
        );
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('manage_users')}</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1 md:border-e dark:border-gray-700 p-4">
                        <input 
                            type="text"
                            placeholder="Search by name, email, city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-900 mb-4"
                        />
                        <div className="space-y-2 h-[60vh] overflow-y-auto">
                            {loading ? <LoadingIndicator /> : (
                                users.length > 0 ? (
                                    users.map(user => <UserListItem key={user.user_id} user={user} />)
                                ) : (
                                    <p className="text-center text-gray-500 p-4">No users found.</p>
                                )
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 p-6">
                        {selectedUser ? (
                            <AdminUserDetails 
                                user={selectedUser} 
                                onStatusChange={handleStatusChange}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <p>Select a user from the list to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminManageUsers;