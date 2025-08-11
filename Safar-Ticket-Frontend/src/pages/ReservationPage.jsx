import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import SlideOutMenu from '../components/SlideOutMenu';
import Seat from '../components/Seat';
import Notification from '../components/Notification';
import Header from '../components/Header'; 


const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

// function Header({ isAuthenticated, onMenuClick, user, hasPendingPayment }) {
//     const navigate = useNavigate();
//     return (
//         <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
//             <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
//                 <div className="flex items-center gap-4">
//                     {isAuthenticated && (
//                         <button onClick={onMenuClick} className="relative p-2 rounded-full hover:bg-gray-100">
//                            <MenuIcon />
//                            {hasPendingPayment && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
//                         </button>
//                     )}
//                     <div className="text-2xl font-bold text-[#0D47A1] cursor-pointer" onClick={() => navigate('/')}>✈️ SafarTicket</div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     {isAuthenticated && user && (
//                         <>
//                             <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 border border-gray-200">
//                                 <WalletIcon />
//                                 <span className="font-bold text-[#0D47A1]">${user.wallet?.toLocaleString() || '0'}</span>
//                             </div>
//                             <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-secondary-blue transition-all duration-200" title="My Account">
//                                 <img
//                                     src={user.profile_image_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=0D47A1&color=fff&size=128`}
//                                     alt="User Profile"
//                                     className="w-full h-full object-cover"
//                                 />
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </nav>
//         </header>
//     );
// }

const SeatLegend = () => (
    <div className="flex justify-center items-center gap-6 mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-green-200 border-b-2 border-green-400"></div>
            <span className="text-sm font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-secondary-blue border-b-2 border-primary-blue"></div>
            <span className="text-sm font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-gray-300 border-b-2 border-gray-400"></div>
            <span className="text-sm font-medium">Occupied</span>
        </div>
    </div>
);

const PlaneLayout = ({ seats, selectedSeats, onSelectSeat }) => (
    <div className="relative w-full max-w-sm mx-auto p-8 bg-gray-200 rounded-3xl shadow-inner">
        <div className="absolute top-1/2 -left-4 w-12 h-20 bg-gray-300 rounded-l-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 -right-4 w-12 h-20 bg-gray-300 rounded-r-full transform -translate-y-1/2"></div>
        <div className="bg-gray-100 rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-x-2 gap-y-4 items-center">
                {seats.map((seat) => (
                    <React.Fragment key={seat.seat_number}>
                        <div className={(seat.seat_number - 1) % 6 === 3 ? 'col-span-1' : ''}></div>
                        <Seat
                            seat={seat}
                            status={!seat.is_available ? 'occupied' : selectedSeats.includes(seat.seat_number) ? 'selected' : 'available'}
                            onSelect={onSelectSeat}
                        />
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
);

const BusLayout = ({ seats, selectedSeats, onSelectSeat }) => (
    <div className="relative w-full max-w-xs mx-auto p-6 bg-gray-200 rounded-t-xl rounded-b-lg shadow-inner">
         <div className="bg-gray-100 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-x-2 gap-y-4 items-center">
                {seats.map((seat) => (
                    <React.Fragment key={seat.seat_number}>
                        <div className={(seat.seat_number - 1) % 4 === 2 ? 'col-span-1' : ''}></div>
                        <Seat
                            seat={seat}
                            status={!seat.is_available ? 'occupied' : selectedSeats.includes(seat.seat_number) ? 'selected' : 'available'}
                            onSelect={onSelectSeat}
                        />
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
);

const TrainLayout = ({ seats, selectedSeats, onSelectSeat }) => (
    <div className="relative w-full max-w-md mx-auto p-6 bg-gray-200 rounded-lg shadow-inner">
        <div className="bg-gray-100 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4">
                {seats.map(seat => (
                    <Seat 
                        key={seat.seat_number} 
                        seat={seat} 
                        status={!seat.is_available ? 'occupied' : selectedSeats.includes(seat.seat_number) ? 'selected' : 'available'}
                        onSelect={onSelectSeat} 
                    />
                ))}
            </div>
        </div>
    </div>
);

function ReservationPage() {
    const { travelId } = useParams();
    const navigate = useNavigate();
    const [travelDetails, setTravelDetails] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isReserving, setIsReserving] = useState(false);
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasPendingPayment, setHasPendingPayment] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userRes = await api.get('/api/profile/');
                setUser(userRes.data);

                const detailsRes = await api.get(`/api/travel/${travelId}/`);
                const seatsRes = await api.get(`/api/travel/${travelId}/seats/`);
                
                setTravelDetails(detailsRes.data);
                setSeats(seatsRes.data);

                const bookingsRes = await api.get('/api/user-booking/');
                const pending = bookingsRes.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date());
                setHasPendingPayment(pending);

            } catch (err) {
                setNotification({ message: "Failed to load reservation data. Please try again.", type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [travelId]);

    const handleSelectSeat = (seatNumber) => {
        setSelectedSeats(prev =>
            prev.includes(seatNumber)
                ? prev.filter(s => s !== seatNumber)
                : [...prev, seatNumber]
        );
    };
    
    const performSequentialReservations = async () => {
        let successfulReservations = [];
        for (const seatNumber of selectedSeats) {
            try {
                const res = await api.post('/api/reserve-ticket/', {
                    travel_id: travelId,
                    seat_number: seatNumber
                });
                successfulReservations.push(res.data);
            } catch (error) {
                console.error(`Failed to reserve seat ${seatNumber}:`, error);
                throw error; // Stop if any reservation fails
            }
        }
        return successfulReservations;
    };

    const handleConfirmReservation = async () => {
        setIsReserving(true);
        setNotification({ message: '', type: '' });
        try {
            await performSequentialReservations();
            navigate('/bookings', { state: { message: 'Your tickets have been successfully reserved! Please proceed to payment.' } });
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "An error occurred while reserving seats. Please check your bookings and try again.", type: 'error' });
        } finally {
            setIsReserving(false);
        }
    };
    
    const handlePay = async () => {
        setIsReserving(true);
        setNotification({ message: '', type: '' });
        try {
            const successfulReservations = await performSequentialReservations();
            if (successfulReservations.length > 0) {
                const reservationIds = successfulReservations.map(r => r.reservation_id);
                const firstReservationId = reservationIds[0];
                
                navigate(`/payment/${firstReservationId}`, { 
                    state: { 
                        allReservationIds: reservationIds,
                        totalPrice: totalPrice 
                    } 
                });
            } else {
                throw new Error("No seats were reserved.");
            }
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "An error occurred during reservation. Please try again.", type: 'error' });
        } finally {
            setIsReserving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LoadingIndicator /></div>;
    
    const totalPrice = selectedSeats.length * (travelDetails?.price || 0);

    const renderLayout = () => {
        if (!travelDetails) return <LoadingIndicator />;
        switch (travelDetails.transport_type) {
            case 'plane':
                return <PlaneLayout seats={seats} selectedSeats={selectedSeats} onSelectSeat={handleSelectSeat} />;
            case 'bus':
                return <BusLayout seats={seats} selectedSeats={selectedSeats} onSelectSeat={handleSelectSeat} />;
            case 'train':
                return <TrainLayout seats={seats} selectedSeats={selectedSeats} onSelectSeat={handleSelectSeat} />;
            default:
                return <p className="text-center text-gray-500">Seat map not available for this transport type.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            {user && <Header isAuthenticated={true} onMenuClick={() => setIsMenuOpen(true)} user={user} hasPendingPayment={hasPendingPayment} />}
            {user && <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={hasPendingPayment} />}
            
            <main className="container mx-auto p-6 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-2 text-center">Select Your Seat</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Choose your preferred seat from the layout below.</p>
                        {renderLayout()}
                        <SeatLegend />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg sticky top-24 border dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-6">Order Summary</h2>
                            {travelDetails && (
                                <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Company:</span>
                                        <span className="font-semibold">{travelDetails.transport_company_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Route:</span>
                                        <span className="font-semibold">{travelDetails.departure_city} → {travelDetails.destination_city}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Date:</span>
                                        <span className="font-semibold">{new Date(travelDetails.departure_time).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )}
                            <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Passenger</h3>
                                {user && <p className="flex items-center text-gray-700 dark:text-gray-300"><UserIcon/> {user.first_name} {user.last_name}</p>}
                                <h3 className="font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">Selected Seats</h3>
                                {selectedSeats.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSeats.sort((a, b) => a - b).map(seat => <span key={seat} className="bg-blue-100 text-blue-800 font-mono text-sm px-3 py-1 rounded-full">{seat}</span>)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Please select one or more seats from the map.</p>
                                )}
                            </div>
                            <div className="pt-6 flex justify-between items-center">
                                <p className="text-lg font-semibold">Total Price:</p>
                                <p className="text-3xl font-bold text-accent-orange">${totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleConfirmReservation}
                                    disabled={selectedSeats.length === 0 || isReserving}
                                    className="w-full bg-[#42A5F5] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                                >
                                    {isReserving ? 'Processing...' : 'Reserve'}
                                </button>
                                <button
                                    onClick={handlePay}
                                    disabled={selectedSeats.length === 0 || isReserving}
                                    className="w-full bg-primary-blue text-white py-4 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                                >
                                    {isReserving ? 'Processing...' : 'Pay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ReservationPage;