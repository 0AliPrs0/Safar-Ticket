import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import { faToEn } from '../i18n'; // Import the reverse dictionary
import SlideOutMenu from '../components/SlideOutMenu';
import ExpandedTicket from '../components/ExpandedTicket';
import LoadingIndicator from '../components/LoadingIndicator';
import Header from '../components/Header';
import planeImage from '../assets/pictures/plane.jpg';
import trainImage from '../assets/pictures/train.jpg';
import busImage from '../assets/pictures/bus.jpg';

const PlaneIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.2 5.2c.4.4 1 .5 1.4.1l.5-.3c.4-.3.6-.7.5-1.2z"/></svg>;
const TrainIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13.5l-1.5-1.5 1.5-1.5"/><path d="M21 13.5l1.5-1.5l-1.5-1.5"/><path d="M4.5 12h15"/><path d="M4.5 12l1.5 6.5-1.5 1.5h15l-1.5-1.5 1.5-6.5"/><path d="M4.5 12l1.5-6.5-1.5-1.5h15l-1.5 1.5l1.5 6.5"/></svg>;
const BusIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v-2h4a2 2 0 0 1 2 2v2h-6z" /><path d="M16 4h2a2 2 0 0 1 2 2v2h-4" /><path d="M4 14v-2h16v2" /><path d="M4 12v-6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v6" /><path d="M10 20.5a1.5 1.5 0 0 1 -3 0" /><path d="M17 20.5a1.5 1.5 0 0 1 -3 0" /></svg>;
const SwapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

function ChargeWalletModal({ isOpen, onClose, onChargeSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/charge-wallet/', { amount });
            onChargeSuccess(res.data.new_balance);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to charge wallet.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('charge_wallet')}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><CloseIcon/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-start">{t('amount')}</label>
                    <input
                        type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 500"
                        className="mt-1 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none"
                        required min="1"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button type="submit" disabled={loading} className="mt-6 w-full bg-[#FFA726] text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-400">
                        {loading ? t('loading') : t('add_to_wallet')}
                    </button>
                </form>
            </div>
        </div>
    );
}

function SearchForm({ tripType, setTripType, onSearch }) {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useState({
        origin: null, destination: null, departureDate: '', isRoundTrip: false,
        company: '', travelOptionValue: '', minPrice: '', maxPrice: '',
    });
    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [travelOptions, setTravelOptions] = useState({ type: 'travel_class', options: [] });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const lang = i18n.language.startsWith('fa') ? 'fa' : 'en';
        
        api.get(`/api/cities/?lang=${lang}`).then(res => {
            const options = res.data.map(c => ({ value: c.city_name, label: c.city_name }));
            setCities(options);
        }).catch(err => console.error("Error fetching cities:", err));

        api.get(`/api/companies/?lang=${lang}`).then(res => setCompanies(res.data)).catch(err => console.error("Error fetching companies:", err));
    }, [i18n.language]);

    useEffect(() => {
        api.get(`/api/travel-options/?transport_type=${tripType}`)
            .then(res => {
                setTravelOptions({ type: res.data.option_type, options: res.data.options });
                setSearchParams(prev => ({ ...prev, travelOptionValue: '' }));
            })
            .catch(err => {
                console.error(`Error fetching options for ${tripType}:`, err);
                setTravelOptions({ type: 'travel_class', options: [] });
            });
    }, [tripType]);

    const handleSwap = () => { setSearchParams(prev => ({ ...prev, origin: prev.destination, destination: prev.origin })); };
    const handleChange = (e) => { const { name, value, type, checked } = e.target; setSearchParams(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
    const handleSelectChange = (name, selectedOption) => { setSearchParams(prev => ({ ...prev, [name]: selectedOption })); };
    const handleSubmit = (e) => { e.preventDefault(); onSearch({ ...searchParams, tripType, travelOptionType: travelOptions.type }); };

    const getTravelOptionLabel = () => {
        switch (travelOptions.type) {
            case 'travel_class': return t('all_classes');
            case 'bus_type': return t('all_bus_types');
            case 'train_rating': return t('all_train_ratings');
            default: return t('all_classes');
        }
    };
    
    const TripTypeButton = ({ type, icon, label }) => ( <button type="button" onClick={() => setTripType(type)} className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 border-b-4 ${tripType === type ? 'bg-white dark:bg-gray-800 text-[#0D47A1] dark:text-white border-[#FFA726]' : 'bg-transparent text-white/80 hover:bg-white/10 border-transparent'}`}>{icon}<span className="font-bold">{label}</span></button> );
    const customSelectStyles = { control: (provided) => ({ ...provided, minHeight: '60px', borderRadius: '0.5rem' }), menu: (provided) => ({...provided, zIndex: 10}) };

    return (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg p-2 rounded-xl border border-white/20">
            <div className="flex items-center -mb-px">
                <TripTypeButton type="plane" icon={<PlaneIcon className="w-5 h-5" />} label={t('flight')} />
                <TripTypeButton type="train" icon={<TrainIcon className="w-5 h-5" />} label={t('train')} />
                <TripTypeButton type="bus" icon={<BusIcon className="w-5 h-5" />} label={t('bus')} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg rounded-tl-none shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="relative md:col-span-8 flex items-center gap-4">
                        <Select options={cities} value={searchParams.origin} onChange={(opt) => handleSelectChange('origin', opt)} placeholder={t('origin')} isClearable isSearchable styles={customSelectStyles} className="w-full text-gray-900" />
                        <button onClick={handleSwap} type="button" className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary-blue transition-all duration-200"><SwapIcon /></button>
                        <Select options={cities} value={searchParams.destination} onChange={(opt) => handleSelectChange('destination', opt)} placeholder={t('destination')} isClearable isSearchable styles={customSelectStyles} className="w-full text-gray-900" />
                    </div>
                    <div className="md:col-span-2"><input type="date" name="departureDate" value={searchParams.departureDate} onChange={handleChange} className="w-full p-4 h-[60px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-300" /></div>
                    <div className="md:col-span-2 grid grid-cols-1"><button type="submit" className="w-full h-[60px] bg-accent-orange text-white rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30">{t('search')}</button></div>
                </div>
                <div className="mt-4 flex justify-end rtl:justify-start"><button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-primary-blue dark:text-secondary-blue font-semibold hover:underline"><FilterIcon /><span>{showFilters ? t('hide_filters') : t('show_filters')}</span></button></div>
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-dark-text dark:text-white mb-4 text-start">{t('optional_filters')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <input type="number" name="minPrice" value={searchParams.minPrice} onChange={handleChange} placeholder={t('min_price')} className="w-full p-3 h-[50px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            <input type="number" name="maxPrice" value={searchParams.maxPrice} onChange={handleChange} placeholder={t('max_price')} className="w-full p-3 h-[50px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            <select name="company" value={searchParams.company} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-blue bg-white dark:bg-gray-700"><option value="">{t('all_companies')}</option>{Array.isArray(companies) && companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}</select>
                            <select name="travelOptionValue" value={searchParams.travelOptionValue} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-blue bg-white dark:bg-gray-700"><option value="">{getTravelOptionLabel()}</option>{Array.isArray(travelOptions.options) && travelOptions.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}</select>
                        </div>
                        <div className="mt-4 flex items-center justify-start"><input id="round-trip-checkbox" name="isRoundTrip" type="checkbox" checked={searchParams.isRoundTrip} onChange={handleChange} className="h-5 w-5 text-primary-blue rounded border-gray-300 focus:ring-secondary-blue" /><label htmlFor="round-trip-checkbox" className="ms-3 block text-sm font-medium dark:text-gray-300">{t('round_trip')}</label></div>
                    </div>
                )}
            </div>
        </form>
    );
}

const headerImages = {
    plane: planeImage,
    train: trainImage,
    bus: busImage,
};

function Home() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [tripType, setTripType] = useState('plane');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null); 
    const [expandedTicketDetails, setExpandedTicketDetails] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [hasPendingPayment, setHasPendingPayment] = useState(false);

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }
            try {
                const userRes = await api.get('/api/profile/');
                setUser(userRes.data);
                setIsAuthenticated(true);

                const bookingsRes = await api.get('/api/user-booking/');
                const pending = bookingsRes.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date());
                setHasPendingPayment(pending);

            } catch(err) {
                setIsAuthenticated(false);
                setUser(null);
            }
        };
        checkAuthAndFetchData();
    }, []);

    const handleSearch = async (params) => {
        setLoading(true);
        setError(null);
        setSearched(true);
        setSearchResults([]);
        setSelectedTicketId(null);
        
        let originCityEn = params.origin?.value;
        let destinationCityEn = params.destination?.value;
        let company = params.company?.value;

        if (i18n.language === 'fa') {
            originCityEn = faToEn.cities[originCityEn] || originCityEn;
            destinationCityEn = faToEn.cities[destinationCityEn] || destinationCityEn;
            company = faToEn.companies[company] || company;
        }

        const searchData = {
            origin_city_name: originCityEn,
            destination_city_name: destinationCityEn,
            travel_date: params.departureDate,
            transport_type: tripType,
            is_round_trip: params.isRoundTrip,
            company_name: company,
            min_price: params.minPrice,
            max_price: params.maxPrice,
        };
        if (params.travelOptionValue) {
            searchData[params.travelOptionType] = params.travelOptionValue;
        }
        try {
            const res = await api.post('/api/search-tickets/', searchData);
            setSearchResults(res.data);
        } catch (err) {
            setError("Failed to fetch search results. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketSelect = async (travelId) => {
        if (selectedTicketId === travelId) {
            setSelectedTicketId(null);
            setExpandedTicketDetails(null);
            return;
        }
        setIsDetailsLoading(true);
        setSelectedTicketId(travelId);
        setExpandedTicketDetails(null); 
        try {
            const res = await api.get(`/api/travel/${travelId}/`);
            setExpandedTicketDetails(res.data);
        } catch (err) {
            setError("Could not load ticket details.");
            console.error("Failed to fetch ticket details:", err);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleReserve = (travelId) => {
        if (!isAuthenticated) {
            const destinationPath = `/reserve/${travelId}`;
            navigate('/login', { state: { from: { pathname: destinationPath } } });
            return;
        }
        navigate(`/reserve/${travelId}`);
    };
    
    return (
        <div className="min-h-screen">
            {isAuthenticated && user && <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={hasPendingPayment} />}
            <Header isAuthenticated={isAuthenticated} onMenuClick={() => setIsMenuOpen(true)} user={user} onChargeClick={() => setIsWalletModalOpen(true)} hasPendingPayment={hasPendingPayment} />
            {isAuthenticated && <ChargeWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} onChargeSuccess={(newBalance) => setUser(prev => ({ ...prev, wallet: newBalance }))} />}
            
            <main>
                <div className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden bg-gray-800">
                    {Object.entries(headerImages).map(([type, src]) => (
                        <img 
                            key={type}
                            src={src} 
                            alt={`${type} background`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${tripType === type ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                
                <div className="container mx-auto px-6 -mt-32 sm:-mt-24 z-20 relative">
                    <SearchForm tripType={tripType} setTripType={setTripType} onSearch={handleSearch} />
                </div>
                
                <div className="container mx-auto px-6 mt-12 mb-16">
                    {loading && <div className="text-center p-10"><LoadingIndicator/></div>}
                    {error && <div className="text-center p-10 text-red-500"><p>{error}</p></div>}
                    {!loading && searched && searchResults.length === 0 && (
                        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
                            <h3 className="text-2xl font-semibold text-dark-text dark:text-white">{t('no_tickets_found')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('no_tickets_criteria')}</p>
                        </div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4 text-start">{t('available_tickets')}</h2>
                            {searchResults.map(ticket => {
                                const isPast = new Date(ticket.departure_time) < new Date();
                                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                                const departureLocaleDate = new Date(ticket.departure_time).toLocaleString(i18n.language === 'fa' ? 'fa-IR' : 'en-US', dateOptions);

                                return (
                                <div key={ticket.travel_id}>
                                    <div 
                                        className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center transition-all duration-200 border dark:border-gray-700 ${isPast ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl dark:hover:shadow-blue-500/20 cursor-pointer'}`} 
                                        onClick={() => !isPast && handleTicketSelect(ticket.travel_id)}
                                    >
                                        <div className="text-start">
                                            <p className="font-bold text-lg text-primary-blue dark:text-secondary-blue">{ticket.transport_company_name}</p>
                                            <p className="font-semibold dark:text-gray-200">{ticket.departure_city_name} to {ticket.destination_city_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{departureLocaleDate}</p>
                                        </div>
                                        <div className="text-end flex flex-col items-end">
                                            <p className="text-xl font-bold text-dark-text dark:text-white">${ticket.price}</p>
                                            {isPast ? (
                                                <span className="mt-2 text-sm font-bold text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded-full">{t('departed')}</span>
                                            ) : (
                                                <span className="mt-2 text-sm font-semibold text-primary-blue dark:text-secondary-blue">{t('view_details')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${selectedTicketId === ticket.travel_id ? 'max-h-screen' : 'max-h-0'}`}>
                                        {isDetailsLoading && selectedTicketId === ticket.travel_id && <div className="p-4 text-center"><LoadingIndicator /></div>}
                                        {!isDetailsLoading && expandedTicketDetails && selectedTicketId === ticket.travel_id && (
                                            <ExpandedTicket ticket={expandedTicketDetails} onReserve={handleReserve} />
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;