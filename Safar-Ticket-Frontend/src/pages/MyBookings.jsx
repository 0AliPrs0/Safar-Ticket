import React, { useState, useEffect } from 'react';
import api from '../api';
import SlideOutMenu from '../components/SlideOutMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingIndicator from '../components/LoadingIndicator';

const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>

function Header({ onMenuClick }) {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 left-0 right-0 z-10">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-100"><MenuIcon /></button>
                    <div className="text-2xl font-bold text-[#0D47A1]">My Bookings</div>
                </div>
            </nav>
        </header>
    );
}

const BookingCard = ({ booking, onCancel, isCancelling }) => {
    const departureDate = new Date(booking.departure_time);
    const isPast = departureDate < new Date();
    const isCancellable = booking.status.toLowerCase() === 'paid' && !isPast;
    
    const statusClasses = {
        paid: 'bg-green-100 text-green-800',
        canceled: 'bg-red-100 text-red-800',
        used: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-1">
                    <p className="font-bold text-lg text-[#0D47A1]">{booking.transport_company_name}</p>
                    <p className="font-semibold text-gray-800">{booking.departure_city_name} to {booking.destination_city_name}</p>
                    <p className="text-sm text-gray-500">{departureDate.toLocaleString()}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                    <p className={`px-3 py-1 text-sm font-bold rounded-full ${statusClasses[booking.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>{booking.status}</p>
                    <p className="text-xl font-bold text-[#212529]">${booking.price}</p>
                </div>
            </div>
            {isCancellable && (
                 <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button onClick={() => onCancel(booking.booking_id)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm disabled:bg-red-300" disabled={isCancelling}>
                        {isCancelling ? <LoadingIndicator small /> : <CancelIcon />}
                        <span>{isCancelling ? "Loading..." : "Cancel Booking"}</span>
                    </button>
                 </div>
            )}
        </div>
    );
};

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState({ first_name: 'Guest' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [penaltyInfo, setPenaltyInfo] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/user-booking/');
            setBookings(res.data);
        } catch (err) {
             setError("Failed to fetch bookings. Please try again later.");
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
                 setError("Failed to load your data. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, []);

    const handleOpenCancelModal = async (bookingId) => {
        setSelectedBookingId(bookingId);
        setCancelLoading(true);
        setPenaltyInfo(null);
        try {
            const res = await api.post('/api/check-penalty/', { reservation_id: bookingId });
            setPenaltyInfo(res.data);
            setIsModalOpen(true);
        } catch (err) {
            alert(err.response?.data?.error || "Could not retrieve cancellation details.");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleConfirmCancel = async () => {
        setCancelLoading(true);
        try {
            await api.post('/api/cancel-ticket/', { reservation_id: selectedBookingId });
            await fetchBookings();
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to cancel the ticket.");
        } finally {
            setCancelLoading(false);
            setPenaltyInfo(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} />
            <Header onMenuClick={() => setIsMenuOpen(true)} />
            <main className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center"><LoadingIndicator /></div>
                ) : error ? (
                    <div className="text-center p-10 text-red-500">{error}</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-lg shadow-md">
                        <TicketIcon />
                        <h3 className="text-2xl font-semibold text-[#212529] mt-4">No Bookings Yet</h3>
                        <p className="text-gray-500 mt-2">You haven't made any bookings. Start by searching for a trip!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map(booking => (
                            <BookingCard 
                                key={booking.booking_id} 
                                booking={booking} 
                                onCancel={handleOpenCancelModal}
                                isCancelling={cancelLoading && selectedBookingId === booking.booking_id}
                            />
                        ))}
                    </div>
                )}
            </main>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Confirm Cancellation"
                confirmText="Yes, Cancel"
                loading={cancelLoading}
            >
                {penaltyInfo && (
                    <div className="space-y-2 text-left">
                        <p>Are you sure you want to cancel this booking?</p>
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 mt-4">
                            <p><strong>Penalty Fee:</strong> ${penaltyInfo.penalty_amount} ({penaltyInfo.penalty_percent}%)</p>
                            <p className="font-bold text-green-700"><strong>Refund Amount:</strong> ${penaltyInfo.refund_amount}</p>
                        </div>
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
}

export default MyBookings;
