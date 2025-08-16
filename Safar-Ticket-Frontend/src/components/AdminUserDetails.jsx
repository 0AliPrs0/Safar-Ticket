import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from './LoadingIndicator';
import UserBookingsModal from './UserBookingsModal';
import ConfirmationModal from './ConfirmationModal';
import Notification from './Notification';

function AdminUserDetails({ user, onStatusChange }) {
    const { t, i18n } = useTranslation();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
    const [bookingFilter, setBookingFilter] = useState('all'); // 'all' or 'active'
    
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchDetails = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await api.get(`/api/admin/users/${user.user_id}/`);
                setDetails(res.data);
            } catch (error) {
                console.error("Failed to fetch user details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [user]);

    const handleShowBookings = (filter) => {
        setBookingFilter(filter);
        setIsBookingsModalOpen(true);
    };

    const handleToggleStatus = async () => {
        setIsSubmitting(true);
        const newStatus = user.account_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.post(`/api/admin/users/${user.user_id}/status/`, { status: newStatus });
            setNotification({ message: 'User status updated successfully.', type: 'success' });
            onStatusChange(user.user_id, newStatus);
        } catch (error) {
            setNotification({ message: 'Failed to update user status.', type: 'error' });
        } finally {
            setIsSubmitting(false);
            setIsConfirmModalOpen(false);
        }
    };

    if (loading || !details) {
        return <div className="flex items-center justify-center h-full"><LoadingIndicator /></div>;
    }

    return (
        <div className="text-start space-y-4">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h3 className="text-xl font-semibold mb-2">User Details</h3>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <p><strong>{t('first_name')}:</strong> {user.first_name}</p>
                <p><strong>{t('last_name')}:</strong> {user.last_name}</p>
                <p><strong>{t('email_address')}:</strong> {user.email}</p>
                <p><strong>{t('phone_number')}:</strong> {user.phone_number || 'N/A'}</p>
                <p><strong>{t('city')}:</strong> {user.city_name || 'N/A'}</p>
                <p><strong>Registered:</strong> {new Date(user.registration_date).toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div onClick={() => handleShowBookings('all')} className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900">
                    <p className="text-2xl font-bold">{details.total_reservations}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Reservations</p>
                </div>
                <div onClick={() => handleShowBookings('active')} className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900">
                    <p className="text-2xl font-bold">{details.active_reservations}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Active Reservations</p>
                </div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={() => setIsConfirmModalOpen(true)}
                    className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${
                        user.account_status === 'ACTIVE' 
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                >
                    {user.account_status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                </button>
            </div>

            <UserBookingsModal 
                isOpen={isBookingsModalOpen}
                onClose={() => setIsBookingsModalOpen(false)}
                userId={user.user_id}
                filter={bookingFilter}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleToggleStatus}
                title="Confirm Status Change"
                confirmText={`Yes, ${user.account_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}`}
                loading={isSubmitting}
            >
                <p>Are you sure you want to {user.account_status === 'ACTIVE' ? 'deactivate' : 'activate'} this user's account?</p>
            </ConfirmationModal>
        </div>
    );
}

export default AdminUserDetails;