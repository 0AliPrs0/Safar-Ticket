import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import ConfirmationModal from '../components/ConfirmationModal';

function AdminCancellations() {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null); // 'approve' or 'reject'
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/cancellations/');
            setRequests(res.data);
        } catch (error) {
            setNotification({ message: 'Failed to fetch cancellation requests.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async () => {
        if (!actionToConfirm || !selectedRequest) return;
        
        setIsSubmitting(true);
        const action = actionToConfirm === 'approve' ? 'approve_cancellation' : 'reject_cancellation';
        try {
            await api.post('/api/ticket-management/', {
                reservation_id: selectedRequest.reservation_id,
                action: action,
                user_id: selectedRequest.user_id
            });
            setNotification({ message: `Request successfully ${actionToConfirm}d.`, type: 'success' });
            setSelectedRequest(null);
            setActionToConfirm(null);
            fetchRequests(); // Refresh the list
        } catch (error) {
            setNotification({ message: `Failed to ${actionToConfirm} request.`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const RequestListItem = ({ request }) => {
        const isActive = selectedRequest?.reservation_id === request.reservation_id;
        return (
            <div 
                onClick={() => setSelectedRequest(request)} 
                className={`p-4 border-s-4 rounded-e-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                        ? 'bg-blue-50 dark:bg-gray-700 border-primary-blue' 
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-800'
                }`}
            >
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{request.user_email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.reservation_time).toLocaleDateString()}
                    </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {request.departure_city} to {request.destination_city}
                </p>
            </div>
        );
    };
    
    if (loading) return <LoadingIndicator />;

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('manage_cancellations')}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1 md:border-e dark:border-gray-700 p-4 space-y-2">
                        {requests.length > 0 ? (
                            requests.map(req => <RequestListItem key={req.reservation_id} request={req} />)
                        ) : (
                            <p className="text-center text-gray-500 p-4">No pending requests.</p>
                        )}
                    </div>
                    <div className="md:col-span-2 p-6">
                        {selectedRequest ? (
                            <div className="text-start space-y-4">
                                <h3 className="text-xl font-semibold mb-2">Request Details</h3>
                                <div className="space-y-1 text-gray-700 dark:text-gray-300">
                                    <p><strong>{t('user')}:</strong> {selectedRequest.user_email}</p>
                                    <p><strong>{t('travel_details')}:</strong> {selectedRequest.transport_company} - {selectedRequest.departure_city} to {selectedRequest.destination_city}</p>
                                    <p><strong>Travel Date:</strong> {new Date(selectedRequest.departure_time).toLocaleString(i18n.language.startsWith('fa') ? 'fa-IR' : 'en-US')}</p>
                                    <p><strong>{t('request_time')}:</strong> {new Date(selectedRequest.reservation_time).toLocaleString(i18n.language.startsWith('fa') ? 'fa-IR' : 'en-US')}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                    <p><strong>{t('ticket_price')}:</strong> ${selectedRequest.price.toLocaleString()}</p>
                                    <p className="text-red-600 dark:text-red-400"><strong>{t('penalty')}:</strong> ${selectedRequest.penalty_amount.toLocaleString()}</p>
                                    <p className="font-bold text-green-600 dark:text-green-400"><strong>{t('refundable_amount')}:</strong> ${selectedRequest.refund_amount.toLocaleString()}</p>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setActionToConfirm('approve')} className="w-full py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                                        {t('approve')}
                                    </button>
                                    <button onClick={() => setActionToConfirm('reject')} className="w-full py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                                        {t('reject')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <p>{t('select_request_prompt')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!actionToConfirm}
                onClose={() => setActionToConfirm(null)}
                onConfirm={handleAction}
                title={`Confirm ${actionToConfirm}`}
                confirmText={`Yes, ${actionToConfirm}`}
                loading={isSubmitting}
            >
                <p>Are you sure you want to {actionToConfirm} this cancellation request?</p>
            </ConfirmationModal>
        </div>
    );
}

export default AdminCancellations;