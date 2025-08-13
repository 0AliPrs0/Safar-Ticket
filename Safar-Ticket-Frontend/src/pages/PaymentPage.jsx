import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';

const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const CryptoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/><path d="M15.5 16.5l-3-3-3 3M8.5 7.5l3 3 3-3"/></svg>;

function CreditCardForm({ onFormChange }) {
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', pin: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = (value.replace(/\D/g, '').match(/.{1,4}/g) || []).join('-').substr(0, 19);
        } else if (name === 'expiry') {
            formattedValue = (value.replace(/\D/g, '').match(/.{1,2}/g) || []).join('/').substr(0, 5);
        }

        const newDetails = { ...cardDetails, [name]: formattedValue };
        setCardDetails(newDetails);

        const isValid = newDetails.number.length === 19 && 
                        newDetails.expiry.length === 5 && 
                        newDetails.cvv.length >= 3 && 
                        newDetails.pin.length >= 4;
        onFormChange(isValid);
    };
    
    const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white";

    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
            <input type="text" name="number" placeholder="Card Number" maxLength="19" value={cardDetails.number} onChange={handleChange} className={inputClasses} dir="ltr"/>
            <div className="flex gap-4">
                <input type="text" name="expiry" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={handleChange} className={`w-1/2 ${inputClasses}`} dir="ltr"/>
                <input type="text" name="cvv" placeholder="CVV2" maxLength="4" value={cardDetails.cvv} onChange={handleChange} className={`w-1/2 ${inputClasses}`} dir="ltr"/>
            </div>
            <input type="password" name="pin" placeholder="Dynamic PIN" maxLength="8" value={cardDetails.pin} onChange={handleChange} className={inputClasses} dir="ltr"/>
        </div>
    );
}

function PaymentPage() {
    const { reservationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const { allReservationIds, totalPrice } = location.state || {};
    const isGroupPayment = Array.isArray(allReservationIds) && allReservationIds.length > 0;

    const [booking, setBooking] = useState(location.state?.booking || null);
    const [user, setUser] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('wallet');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [isCardFormValid, setIsCardFormValid] = useState(false);

    const finalPrice = isGroupPayment ? totalPrice : booking?.price;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/api/profile/');
                setUser(userRes.data);

                if (!isGroupPayment && !booking) {
                    const bookingRes = await api.get(`/api/booking/${reservationId}/`);
                    setBooking(bookingRes.data);
                }
                if (isGroupPayment && !booking) {
                    const bookingRes = await api.get(`/api/booking/${allReservationIds[0]}/`);
                    setBooking(bookingRes.data);
                }

            } catch (err) {
                setError("Failed to load booking details. It might be expired or invalid.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reservationId, isGroupPayment, booking]);

    const handlePayment = async () => {
        setIsPaying(true);
        setError('');
        
        const reservationIdsToPay = isGroupPayment ? allReservationIds : [reservationId];

        try {
            for (const resId of reservationIdsToPay) {
                await api.post('/api/payment-ticket/', {
                    reservation_id: resId,
                    payment_method: selectedMethod,
                });
            }
            navigate('/bookings', { state: { message: 'Payment successful! Your booking is confirmed.' } });
        } catch (err) {
            setError(err.response?.data?.error || "Payment failed. Please check your bookings page for details.");
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoadingIndicator /></div>;
    }

    if (error || !booking) {
         return (
            <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error')}</h2>
                    <p className="text-gray-700 dark:text-gray-300">{error || "Booking details not found."}</p>
                    <Link to="/bookings" className="mt-6 inline-block bg-primary-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90">
                        {t('my_bookings')}
                    </Link>
                </div>
            </div>
        );
    }

    const canAffordWithWallet = user && finalPrice && user.wallet >= finalPrice;
    const isPayButtonDisabled = isPaying || 
                                (selectedMethod === 'wallet' && !canAffordWithWallet) ||
                                (selectedMethod === 'credit_card' && !isCardFormValid);

    return (
        <div className="min-h-screen flex justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                    <h2 className="text-3xl font-bold text-center text-primary-blue dark:text-white mb-2">{t('complete_payment')}</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('payment_prompt')}</p>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{t('trip_details')}:</span>
                            <span className="font-bold text-primary-blue dark:text-secondary-blue">{isGroupPayment ? `${allReservationIds.length} tickets` : `${booking.departure_city_name} ${t('→')} ${booking.destination_city_name}`}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{t('total_amount')}:</span>
                            <span className="text-2xl font-bold text-accent-orange">${finalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">{t('select_payment_method')}</h3>
                    <div className="space-y-4">
                        <div 
                            onClick={() => setSelectedMethod('wallet')}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === 'wallet' ? 'border-primary-blue bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <WalletIcon className={`me-4 ${selectedMethod === 'wallet' ? 'text-primary-blue' : 'text-gray-500'}`} />
                            <div>
                                <p className="font-bold dark:text-gray-200">{t('wallet')}</p>
                                <p className={`text-sm ${canAffordWithWallet ? 'text-green-600' : 'text-red-500'}`}>
                                    {t('balance')}: ${user?.wallet.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setSelectedMethod('credit_card')}
                            className={`flex flex-col items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === 'credit_card' ? 'border-primary-blue bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <div className="flex items-center w-full">
                                <CreditCardIcon className={`me-4 ${selectedMethod === 'credit_card' ? 'text-primary-blue' : 'text-gray-500'}`} />
                                <div>
                                    <p className="font-bold dark:text-gray-200">{t('credit_card')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pay with Visa, Mastercard, etc.</p>
                                </div>
                            </div>
                            {selectedMethod === 'credit_card' && <CreditCardForm onFormChange={setIsCardFormValid} />}
                        </div>
                        <div 
                            onClick={() => setSelectedMethod('crypto')}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedMethod === 'crypto' ? 'border-primary-blue bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <CryptoIcon className={`me-4 ${selectedMethod === 'crypto' ? 'text-primary-blue' : 'text-gray-500'}`} />
                            <div>
                                <p className="font-bold dark:text-gray-200">{t('crypto')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pay with digital currencies.</p>
                            </div>
                        </div>
                    </div>
                    
                    {selectedMethod === 'wallet' && !canAffordWithWallet && (
                        <p className="text-red-500 text-sm text-center mt-4">{t('insufficient_balance')}</p>
                    )}
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

                    <button 
                        onClick={handlePayment}
                        disabled={isPayButtonDisabled}
                        className="mt-8 w-full bg-primary-blue text-white py-4 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all disabled:bg-gray-400"
                    >
                        {isPaying ? t('loading') : `${t('pay')} $${finalPrice.toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;