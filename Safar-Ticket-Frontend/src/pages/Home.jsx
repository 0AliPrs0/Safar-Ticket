import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';
import SlideOutMenu from '../components/SlideOutMenu';
import ExpandedTicket from '../components/ExpandedTicket';
import LoadingIndicator from '../components/LoadingIndicator';
import planeImage from '../assets/pictures/plane.jpg';
import trainImage from '../assets/pictures/train.jpg';
import busImage from '../assets/pictures/bus.jpg';

const PlaneIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.2 5.2c.4.4 1 .5 1.4.1l.5-.3c.4-.3.6-.7.5-1.2z"/></svg>;
const TrainIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13.5l-1.5-1.5 1.5-1.5"/><path d="M21 13.5l1.5-1.5l-1.5-1.5"/><path d="M4.5 12h15"/><path d="M4.5 12l1.5 6.5-1.5 1.5h15l-1.5-1.5 1.5-6.5"/><path d="M4.5 12l1.5-6.5-1.5-1.5h15l-1.5 1.5l1.5 6.5"/></svg>;
const BusIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v-2h4a2 2 0 0 1 2 2v2h-6z" /><path d="M16 4h2a2 2 0 0 1 2 2v2h-4" /><path d="M4 14v-2h16v2" /><path d="M4 12v-6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v6" /><path d="M10 20.5a1.5 1.5 0 0 1 -3 0" /><path d="M17 20.5a1.5 1.5 0 0 1 -3 0" /></svg>;
const SwapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

function ChargeWalletModal({ isOpen, onClose, onChargeSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Charge Your Wallet</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><CloseIcon/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                        type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g., 500"
                        className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none"
                        required min="1"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <button type="submit" disabled={loading} className="mt-6 w-full bg-[#FFA726] text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-400">
                        {loading ? 'Processing...' : 'Add to Wallet'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Header({ isAuthenticated, onMenuClick, user, onChargeClick }) {
    const navigate = useNavigate();
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {isAuthenticated && <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-100"><MenuIcon /></button>}
                    <div className="text-2xl font-bold text-[#0D47A1] cursor-pointer" onClick={() => navigate('/')}>✈️ SafarTicket</div>
                </div>
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 border border-gray-200">
                                <WalletIcon />
                                <span className="font-bold text-[#0D47A1]">${user?.wallet?.toLocaleString() || '0'}</span>
                                <button onClick={onChargeClick} className="ml-2 bg-[#0D47A1] text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-opacity-90 transition-transform hover:scale-110">+</button>
                            </div>
                            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-secondary-blue transition-all duration-200" title="My Account">
                                <img
                                    src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=0D47A1&color=fff&size=128`}
                                    alt="User Profile"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="font-semibold text-gray-700 hover:text-[#0D47A1] transition-colors">Login</button>
                            <button onClick={() => navigate('/register')} className="bg-[#0D47A1] text-white px-5 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">Register</button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

function SearchForm({ tripType, setTripType, onSearch }) {
    const [searchParams, setSearchParams] = useState({
        origin: null, destination: null, departureDate: '', isRoundTrip: false,
        company: '', travelOptionValue: '', minPrice: '', maxPrice: '',
    });
    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [travelOptions, setTravelOptions] = useState({ type: 'travel_class', options: [] });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        api.get('/api/cities/').then(res => setCities(res.data.map(c => ({ value: c.city_name, label: c.city_name })))).catch(err => console.error("Error fetching cities:", err));
        api.get('/api/companies/').then(res => setCompanies(res.data)).catch(err => console.error("Error fetching companies:", err));
    }, []);

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
            case 'travel_class': return 'Class';
            case 'bus_type': return 'Bus Type';
            case 'train_rating': return 'Train Rating';
            default: return 'Option';
        }
    };
    
    const TripTypeButton = ({ type, icon, label }) => ( <button type="button" onClick={() => setTripType(type)} className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 border-b-4 ${tripType === type ? 'bg-white text-[#0D47A1] border-[#FFA726]' : 'bg-transparent text-white/80 hover:bg-white/10 border-transparent'}`}>{icon}<span className="font-bold">{label}</span></button> );
    const customSelectStyles = { control: (provided) => ({ ...provided, minHeight: '60px', borderRadius: '0.5rem' }), menu: (provided) => ({...provided, zIndex: 10}) };

    return (
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg p-2 rounded-xl border border-white/20">
            <div className="flex items-center -mb-px">
                <TripTypeButton type="plane" icon={<PlaneIcon className="w-5 h-5" />} label="Flight" />
                <TripTypeButton type="train" icon={<TrainIcon className="w-5 h-5" />} label="Train" />
                <TripTypeButton type="bus" icon={<BusIcon className="w-5 h-5" />} label="Bus" />
            </div>
            <div className="bg-white p-6 rounded-lg rounded-tl-none shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="relative md:col-span-8 flex items-center gap-4">
                        <Select options={cities} value={searchParams.origin} onChange={(opt) => handleSelectChange('origin', opt)} placeholder="Origin" isClearable isSearchable styles={customSelectStyles} className="w-full" />
                        <button onClick={handleSwap} type="button" className="flex-shrink-0 w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#0D47A1] transition-all duration-200"><SwapIcon /></button>
                        <Select options={cities} value={searchParams.destination} onChange={(opt) => handleSelectChange('destination', opt)} placeholder="Destination" isClearable isSearchable styles={customSelectStyles} className="w-full" />
                    </div>
                    <div className="md:col-span-2"><input type="date" name="departureDate" value={searchParams.departureDate} onChange={handleChange} className="w-full p-4 h-[60px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none text-gray-500" /></div>
                    <div className="md:col-span-2 grid grid-cols-1"><button type="submit" className="w-full h-[60px] bg-[#FFA726] text-white rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30">Search</button></div>
                </div>
                <div className="mt-4 flex justify-end"><button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-[#0D47A1] font-semibold hover:underline"><FilterIcon /><span>{showFilters ? 'Hide' : 'Show'} Advanced Filters</span></button></div>
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-[#212529] mb-4">Optional Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <input type="number" name="minPrice" value={searchParams.minPrice} onChange={handleChange} placeholder="Min Price" className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5]"/>
                            <input type="number" name="maxPrice" value={searchParams.maxPrice} onChange={handleChange} placeholder="Max Price" className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5]"/>
                            <select name="company" value={searchParams.company} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] bg-white"><option value="">All Companies</option>{Array.isArray(companies) && companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}</select>
                            <select name="travelOptionValue" value={searchParams.travelOptionValue} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] bg-white"><option value="">All {getTravelOptionLabel()}s</option>{Array.isArray(travelOptions.options) && travelOptions.options.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}</select>
                        </div>
                        <div className="mt-4 flex items-center justify-start"><input id="round-trip-checkbox" name="isRoundTrip" type="checkbox" checked={searchParams.isRoundTrip} onChange={handleChange} className="h-5 w-5 text-[#0D47A1] rounded border-gray-300 focus:ring-[#42A5F5]" /><label htmlFor="round-trip-checkbox" className="ml-3 block text-sm text-gray-900 font-medium">Round Trip</label></div>
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
    const navigate = useNavigate();
    const location = useLocation();
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

    useEffect(() => {
        const checkAuthAndFetchUser = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }
            try {
                const res = await api.get('/api/profile/');
                setUser(res.data);
                setIsAuthenticated(true);
            } catch(err) {
                setIsAuthenticated(false);
                setUser(null);
            }
        };
        checkAuthAndFetchUser();
    }, []);

    const handleSearch = async (params) => {
        setLoading(true);
        setError(null);
        setSearched(true);
        setSearchResults([]);
        setSelectedTicketId(null);
        const searchData = {
            origin_city_name: params.origin?.value,
            destination_city_name: params.destination?.value,
            travel_date: params.departureDate,
            transport_type: tripType,
            is_round_trip: params.isRoundTrip,
            company_name: params.company,
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
        <div className="min-h-screen bg-[#F8F9FA]">
            {isAuthenticated && user && <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} />}
            <Header isAuthenticated={isAuthenticated} onMenuClick={() => setIsMenuOpen(true)} user={user} onChargeClick={() => setIsWalletModalOpen(true)} />
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
                </div>
                
                <div className="container mx-auto px-6 -mt-32 sm:-mt-24 z-20 relative">
                    <SearchForm tripType={tripType} setTripType={setTripType} onSearch={handleSearch} />
                </div>
                
                <div className="container mx-auto px-6 mt-12 mb-16">
                    {loading && <div className="text-center p-10"><LoadingIndicator/></div>}
                    {error && <div className="text-center p-10 text-red-500"><p>{error}</p></div>}
                    {!loading && searched && searchResults.length === 0 && (
                        <div className="text-center p-10 bg-white rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-[#212529]">No Tickets Found</h3>
                            <p className="text-gray-500 mt-2">We couldn't find any trips matching your search criteria.</p>
                        </div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-dark-text mb-4">Available Tickets</h2>
                            {searchResults.map(ticket => {
                                const isPast = new Date(ticket.departure_time) < new Date();
                                return (
                                <div key={ticket.travel_id}>
                                    <div 
                                        className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-center transition-all duration-200 ${isPast ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl cursor-pointer'}`} 
                                        onClick={() => !isPast && handleTicketSelect(ticket.travel_id)}
                                    >
                                        <div>
                                            <p className="font-bold text-lg text-primary-blue">{ticket.transport_company_name}</p>
                                            <p className="font-semibold">{ticket.departure_city_name} to {ticket.destination_city_name}</p>
                                            <p className="text-sm text-gray-500">{new Date(ticket.departure_time).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xl font-bold text-dark-text">${ticket.price}</p>
                                            {isPast ? (
                                                <span className="mt-2 text-sm font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">Departed</span>
                                            ) : (
                                                <span className="mt-2 text-sm font-semibold text-primary-blue">View Details</span>
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
