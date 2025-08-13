import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import SlideOutMenu from '../components/SlideOutMenu';
import Seat from '../components/Seat';
import Notification from '../components/Notification';
import Header from '../components/Header';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 me-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;

const SeatLegend = ({t}) => (
    <div className="flex justify-center items-center gap-6 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-green-200 border-b-2 border-green-400"></div>
            <span className="text-sm font-medium">{t('seat_legend_available')}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-secondary-blue border-b-2 border-primary-blue"></div>
            <span className="text-sm font-medium">{t('seat_legend_selected')}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-t-md bg-gray-300 border-b-2 border-gray-400"></div>
            <span className="text-sm font-medium">{t('seat_legend_occupied')}</span>
        </div>
    </div>
);

const PlaneLayout = ({ seats, selectedSeats, onSelectSeat }) => (
    <div className="relative w-full max-w-sm mx-auto p-8 bg-gray-200 dark:bg-gray-700 rounded-3xl shadow-inner">
        <div className="absolute top-1/2 -start-4 w-12 h-20 bg-gray-300 dark:bg-gray-600 rounded-s-full transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 -end-4 w-12 h-20 bg-gray-300 dark:bg-gray-600 rounded-e-full transform -translate-y-1/2"></div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
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
    <div className="relative w-full max-w-xs mx-auto p-6 bg-gray-200 dark:bg-gray-700 rounded-t-xl rounded-b-lg shadow-inner">
         <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
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
    <div className="relative w-full max-w-md mx-auto p-6 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
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
    const { t, i18n } = useTranslation();
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
                setTravelDetails(detailsRes.data);
                const seatsRes = await api.get(`/api/travel/${travelId}/seats/`);
                setSeats(seatsRes.data);
                const bookingsRes = await api.get('/api/user-booking/');
                setHasPendingPayment(bookingsRes.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date()));
            } catch (err) {
                setNotification({ message: "Failed to load reservation data. Please try again.", type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [travelId]);

    const handleSelectSeat = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const handleConfirmReservation = async () => {
        if (selectedSeats.length === 0) {
            setNotification({ message: "Please select at least one seat.", type: 'error' });
            return;
        }
        setIsReserving(true);
        try {
            await api.post('/api/reserve/', { travel_id: travelId, seat_numbers: selectedSeats });
            setNotification({ message: "Reservation successful! Please proceed to payment.", type: 'success' });
            setHasPendingPayment(true);
            navigate('/my-bookings');
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Reservation failed. Please try again.", type: 'error' });
        } finally {
            setIsReserving(false);
        }
    };

    const handlePay = () => {
        if (selectedSeats.length === 0) {
            setNotification({ message: "Please select at least one seat.", type: 'error' });
            return;
        }
        navigate(`/payment/${travelId}`, { state: { seats: selectedSeats, travel: travelDetails } });
    };

    const totalPrice = travelDetails ? (travelDetails.price || 0) * selectedSeats.length : 0;

    const renderLayout = () => {
        if (!travelDetails) return null;
        switch (travelDetails.transport_type.toLowerCase()) {
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
        <div className="min-h-screen">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <Header isAuthenticated={true} onMenuClick={() => setIsMenuOpen(true)} user={user} hasPendingPayment={hasPendingPayment} />
            <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={hasPendingPayment} />
            
            <main className="container mx-auto p-6 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-2 text-center">{t('select_seat')}</h2>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{t('choose_seat_prompt')}</p>
                        {renderLayout()}
                        <SeatLegend t={t}/>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg sticky top-24 border dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-primary-blue dark:text-white mb-6">{t('order_summary')}</h2>
                            {travelDetails && (
                                <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">{t('company')}:</span>
                                        <span className="font-semibold">{travelDetails.transport_company_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">{t('route')}:</span>
                                        <span className="font-semibold">{travelDetails.departure_city} {t('→')} {travelDetails.destination_city}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">{t('date')}:</span>
                                        <span className="font-semibold">{new Date(travelDetails.departure_time).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : 'en-US')}</span>
                                    </div>
                                </div>
                            )}
                            <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-200">{t('passenger')}</h3>
                                {user && <p className="flex items-center text-gray-700 dark:text-gray-300"><UserIcon/> {user.first_name} {user.last_name}</p>}
                                <h3 className="font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">{t('selected_seats')}</h3>
                                {selectedSeats.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSeats.sort((a, b) => a - b).map(seat => <span key={seat} className="bg-blue-100 text-blue-800 font-mono text-sm px-3 py-1 rounded-full">{seat}</span>)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Please select one or more seats from the map.</p>
                                )}
                            </div>
                            <div className="pt-6 flex justify-between items-center">
                                <p className="text-lg font-semibold">{t('total_price')}:</p>
                                <p className="text-3xl font-bold text-accent-orange">${totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleConfirmReservation}
                                    disabled={selectedSeats.length === 0 || isReserving}
                                    className="w-full bg-[#42A5F5] text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                                >
                                    {isReserving ? t('loading') : t('reserve')}
                                </button>
                                <button
                                    onClick={handlePay}
                                    disabled={selectedSeats.length === 0 || isReserving}
                                    className="w-full bg-primary-blue text-white py-4 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                                >
                                    {isReserving ? t('loading') : t('pay')}
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