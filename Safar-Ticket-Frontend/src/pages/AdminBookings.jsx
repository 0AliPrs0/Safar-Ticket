import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import ConfirmationModal from '../components/ConfirmationModal';

function AdminBookings() {
    const { t, i18n } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/bookings/');
            setBookings(res.data);
        } catch (error) {
            setNotification({ message: 'Failed to fetch bookings.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const openConfirmationModal = (booking, action) => {
        setSelectedBooking(booking);
        setActionToConfirm(action);
        setIsModalOpen(true);
    };
    
    const handleAction = async () => {
        if (!actionToConfirm || !selectedBooking) return;
        setIsSubmitting(true);
        try {
               await api.post('/api/admin/booking-actions/', { 
                reservation_id: selectedBooking.reservation_id, 
                action: actionToConfirm 
            });
            setNotification({ message: `Reservation updated successfully.`, type: 'success' });
            fetchBookings(); 
        } catch (err) {
            setNotification({ message: err.response?.data?.error || `Failed to update reservation.`, type: 'error' });
        } finally {
            setIsModalOpen(false);
            setSelectedBooking(null);
            setActionToConfirm(null);
            setIsSubmitting(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const fullName = `${booking.first_name} ${booking.last_name}`.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        return (
            booking.user_email.toLowerCase().includes(searchTermLower) ||
            fullName.includes(searchTermLower)
        );
    });
    
    const statusClasses = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        canceled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
        cancellation_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('manage_bookings')}</h1>

            <div className="mb-4">
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('user')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('travel_details')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center p-4"><LoadingIndicator /></td></tr>
                        ) : (
                            filteredBookings.map(booking => (
                                <tr key={booking.reservation_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold">{booking.first_name} {booking.last_name}</div>
                                        <div className="text-sm text-gray-500">{booking.user_email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-semibold">{booking.departure_city} {t('to')} {booking.destination_city}</div>
                                        <div className="text-sm text-gray-500">{booking.transport_company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[booking.status]}`}>
                                            {t(booking.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4 rtl:space-x-reverse">
                                        {booking.status === 'reserved' && (
                                            <>
                                                <button onClick={() => openConfirmationModal(booking, 'approve_reserved')} className="text-green-600 hover:text-green-900">{t('approve')}</button>
                                                <button onClick={() => openConfirmationModal(booking, 'cancel_reserved')} className="text-red-600 hover:text-red-900">{t('cancel')}</button>
                                            </>
                                        )}
                                        {booking.status === 'paid' && (
                                            <button onClick={() => openConfirmationModal(booking, 'cancel_paid')} className="text-red-600 hover:text-red-900">{t('cancel_booking')}</button>
                                        )}
                                        {booking.status === 'canceled' && (
                                            <button onClick={() => openConfirmationModal(booking, 'mark_as_paid')} className="text-green-600 hover:text-green-900">{t('mark_as_paid')}</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleAction}
                title={t('confirm_cancellation')}
                confirmText={t('yes_button', { action: t(actionToConfirm) })}
                loading={isSubmitting}
            >
                <p>{t('action_confirm_message', { action: t(actionToConfirm) })}</p>
            </ConfirmationModal>
        </div>
    );
}

export default AdminBookings;