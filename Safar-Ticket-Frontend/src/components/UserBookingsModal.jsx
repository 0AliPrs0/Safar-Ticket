import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from './LoadingIndicator';

function UserBookingsModal({ isOpen, onClose, userId, filter }) {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchBookings = async () => {
                setLoading(true);
                try {
                    const url = `/api/admin/users/${userId}/bookings/${filter === 'active' ? '?status=active' : ''}`;
                    const res = await api.get(url);
                    setBookings(res.data);
                } catch (error) {
                    console.error("Failed to fetch user bookings", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBookings();
        }
    }, [isOpen, userId, filter]);

    if (!isOpen) return null;
    
    const statusClasses = {
        paid: 'bg-green-100 text-green-800', reserved: 'bg-yellow-100 text-yellow-800',
        canceled: 'bg-red-100 text-red-800', cancellation_pending: 'bg-orange-100 text-orange-800',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{filter === 'active' ? 'Active Bookings' : 'All Bookings'}</h2>
                </div>
                <div className="p-4 overflow-y-auto">
                    {loading ? <LoadingIndicator /> : (
                        <div className="space-y-3">
                            {bookings.length > 0 ? bookings.map(booking => (
                                <div key={booking.reservation_id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{booking.departure_city} {t('to')} {booking.destination_city}</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[booking.status]}`}>
                                            {t(booking.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{booking.transport_company}</p>
                                    <p className="text-sm text-gray-500">Departure: {new Date(booking.departure_time).toLocaleString()}</p>
                                </div>
                            )) : <p>No bookings found.</p>}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700 text-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Close</button>
                </div>
            </div>
        </div>
    );
}

export default UserBookingsModal;