import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import SlideOutMenu from '../components/SlideOutMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import { ReportModal, ViewReportModal } from '../components/ReportModals';
import Header from '../components/Header';

const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const RefreshCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>;
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

const BookingCard = ({ booking, onCancel, onPay, onRebook, onReport, isProcessing }) => {
    const { t, i18n } = useTranslation();
    const departureDate = new Date(booking.departure_time);
    const expirationDate = new Date(booking.expiration_time);
    
    const isPast = departureDate < new Date();
    const isExpired = expirationDate < new Date();

    const isCancellable = booking.status.toLowerCase() === 'paid' && !isPast;
    const isPayable = booking.status.toLowerCase() === 'reserved' && !isExpired && !isPast;
    const isRebookable = booking.status.toLowerCase() === 'reserved' && isExpired && !isPast;

    const statusClasses = {
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        reserved: isExpired ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        canceled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
        cancellation_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    };
    
    const getStatusText = () => {
        const statusKey = booking.status.toLowerCase();
        if (statusKey === 'reserved' && isExpired) {
            return t('expired');
        }
        return t(statusKey.replace('_', '_'));
    }

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const localeDate = departureDate.toLocaleString(i18n.language.startsWith('fa') ? 'fa-IR' : 'en-US', dateOptions);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1 text-start">
                    <div className="flex items-center gap-4">
                        <p className="font-bold text-lg text-[#0D47A1] dark:text-secondary-blue">{booking.transport_company_name}</p>
                        <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">Seat: {booking.seat_number}</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">{booking.departure_city_name} to {booking.destination_city_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{localeDate}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                    <p className={`px-3 py-1 text-sm font-bold rounded-full capitalize ${statusClasses[booking.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                        {getStatusText()}
                    </p>
                    <p className="text-xl font-bold text-[#212529] dark:text-white">${booking.price}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-4">
                <button onClick={() => onReport(booking.ticket_id, booking.has_report)} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm">
                    <ReportIcon />
                    <span>{booking.has_report ? t('view_report') : t('report_issue')}</span>
                </button>
                {isCancellable && (
                    <button onClick={() => onCancel(booking.booking_id)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm disabled:bg-red-300" disabled={isProcessing}>
                        {isProcessing ? <LoadingIndicator small /> : <CancelIcon />}
                        <span>{isProcessing ? t('loading') : t('cancel_booking')}</span>
                    </button>
                )}
                {isPayable && (
                    <button onClick={() => onPay(booking)} className="flex items-center gap-2 bg-accent-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-500 transition-colors text-sm">
                        <CreditCardIcon />
                        <span>{t('pay_now')}</span>
                    </button>
                )}
                {isRebookable && (
                     <button onClick={() => onRebook(booking.booking_id)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm disabled:bg-blue-300" disabled={isProcessing}>
                        {isProcessing ? <LoadingIndicator small /> : <RefreshCwIcon />}
                        <span>{isProcessing ? t('loading') : t('rebook')}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

function MyBookings() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [penaltyInfo, setPenaltyInfo] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const navigate = useNavigate();
    const [hasPendingPayment, setHasPendingPayment] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [reportData, setReportData] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/user-booking/');
            setBookings(res.data);
            const pending = res.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date());
            setHasPendingPayment(pending);
        } catch (err) {
            setNotification({ message: "Failed to fetch bookings.", type: 'error' });
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            try {
                const userRes = await api.get('/api/profile/');
                setUser(userRes.data);
                await fetchBookings();
            } catch (err) {
                 setNotification({ message: "Failed to load your data.", type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, []);

    const handleOpenCancelModal = async (bookingId) => {
        setProcessingId(bookingId);
        try {
            const res = await api.post('/api/check-penalty/', { reservation_id: bookingId });
            setPenaltyInfo(res.data);
            setIsCancelModalOpen(true);
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Could not retrieve cancellation details.", type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmCancel = async () => {
        setProcessingId(penaltyInfo.reservation_id);
        try {
            await api.post('/api/cancel-ticket/', { reservation_id: penaltyInfo.reservation_id });
            await fetchBookings();
            setIsCancelModalOpen(false);
            setNotification({ message: "Cancellation request submitted successfully.", type: 'success' });
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Failed to submit cancellation request.", type: 'error' });
        } finally {
            setProcessingId(null);
            setPenaltyInfo(null);
        }
    };

    const handlePay = (booking) => {
        navigate(`/payment/${booking.booking_id}`, { state: { booking } });
    };

    const handleRebook = async (bookingId) => {
        setProcessingId(bookingId);
        try {
            const res = await api.post('/api/rebook-ticket/', { reservation_id: bookingId });
            setBookings(currentBookings => 
                currentBookings.map(b => 
                    b.booking_id === bookingId 
                    ? { ...b, expiration_time: res.data.new_expiration_time, status: 'reserved' } 
                    : b
                )
            );
            setHasPendingPayment(true);
            setNotification({ message: "Seat re-booked successfully! Please proceed to payment.", type: 'success' });
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Failed to re-book.", type: 'error' });
            if (err.response?.status === 409) {
                fetchBookings();
            }
        } finally {
            setProcessingId(null);
        }
    };
    
    const handleReport = async (ticketId, hasReport) => {
        setSelectedTicketId(ticketId);
        if (hasReport) {
            try {
                const res = await api.get(`/api/report/${ticketId}/`);
                setReportData(res.data);
                setIsViewReportModalOpen(true);
            } catch (err) {
                setNotification({ message: "Could not fetch report details.", type: 'error' });
            }
        } else {
            setIsReportModalOpen(true);
        }
    };

    const onReportSubmitted = () => {
        setNotification({ message: "Report submitted successfully!", type: 'success' });
        fetchBookings();
    };

    if (loading || !user) {
        return <div className="flex justify-center items-center h-screen"><LoadingIndicator /></div>
    }
    
    return (
        <div className="min-h-screen">
             <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={false}/>
            <Header onMenuClick={() => setIsMenuOpen(true)} user={user} isAuthenticated={true} hasPendingPayment={false}/>
            <main className="container mx-auto px-6 py-12 pt-24">
                <h1 className="text-3xl font-bold text-[#0D47A1] dark:text-white mb-8 text-start">{t('my_bookings')}</h1>
                {bookings.length === 0 ? (
                    <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <TicketIcon />
                        <h3 className="text-2xl font-semibold text-[#212529] dark:text-white mt-4">{t('no_tickets_found')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't made any bookings. Start by searching for a trip!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map(booking => (
                            <BookingCard 
                                key={booking.booking_id} 
                                booking={booking} 
                                onCancel={handleOpenCancelModal}
                                onPay={handlePay}
                                onRebook={handleRebook}
                                onReport={handleReport}
                                isProcessing={processingId === booking.booking_id}
                            />
                        ))}
                    </div>
                )}
            </main>
            <ConfirmationModal 
                isOpen={isCancelModalOpen} 
                onClose={() => setIsCancelModalOpen(false)} 
                onConfirm={handleConfirmCancel} 
                title={t('confirm_cancellation')}
                confirmText={t('yes_cancel')} 
                loading={processingId === penaltyInfo?.reservation_id}
            >
                {penaltyInfo && (
                    <div className="space-y-2 text-start">
                        <p className="text-gray-600 dark:text-gray-300">{t('cancel_booking_prompt')}</p>
                        <div className="p-4 bg-orange-50 dark:bg-gray-700/60 rounded-lg border border-orange-200 dark:border-orange-500/50 mt-4">
                            <p className="dark:text-gray-300"><strong>{t('penalty_fee_approx')}:</strong> ${penaltyInfo.penalty_amount} ({penaltyInfo.penalty_percent}%)</p>
                            <p className="font-bold text-green-700 dark:text-green-400"><strong>{t('refund_amount_approx')}:</strong> ${penaltyInfo.refund_amount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('cancellation_note')}</p>
                        </div>
                    </div>
                )}
            </ConfirmationModal>
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} ticketId={selectedTicketId} onReportSubmitted={onReportSubmitted} />
            {reportData && <ViewReportModal isOpen={isViewReportModalOpen} onClose={() => setIsViewReportModalOpen(false)} reportData={reportData} />}
        </div>
    );
}

export default MyBookings;