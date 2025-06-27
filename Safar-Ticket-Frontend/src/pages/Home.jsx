import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../api';
import SlideOutMenu from '../components/SlideOutMenu'; 

// --- Icon Components ---
const PlaneIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.2 5.2c.4.4 1 .5 1.4.1l.5-.3c.4-.3.6-.7.5-1.2z"/></svg>;
const TrainIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13.5l-1.5-1.5 1.5-1.5"/><path d="M21 13.5l1.5-1.5l-1.5-1.5"/><path d="M4.5 12h15"/><path d="M4.5 12l1.5 6.5-1.5 1.5h15l-1.5-1.5 1.5-6.5"/><path d="M4.5 12l1.5-6.5-1.5-1.5h15l-1.5 1.5l1.5 6.5"/></svg>;
const BusIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v-2h4a2 2 0 0 1 2 2v2h-6z" /><path d="M16 4h2a2 2 0 0 1 2 2v2h-4" /><path d="M4 14v-2h16v2" /><path d="M4 12v-6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v6" /><path d="M10 20.5a1.5 1.5 0 0 1 -3 0" /><path d="M17 20.5a1.5 1.5 0 0 1 -3 0" /></svg>;
const SwapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

// --- Header Component ---
function Header({ onMenuClick }) {
    const navigate = useNavigate();
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-30">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="p-2 rounded-full hover:bg-gray-100">
                        <MenuIcon />
                    </button>
                    <div className="text-2xl font-bold text-primary-blue cursor-pointer" onClick={() => navigate('/')}>
                        ✈️ SafarTicket
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/profile')} className="font-semibold text-gray-600 hover:text-primary-blue transition-colors">My Account</button>
                    <button onClick={() => navigate('/logout')} className="bg-accent-orange/10 text-accent-orange px-4 py-2 rounded-lg font-bold hover:bg-accent-orange/20 transition-colors">Logout</button>
                </div>
            </nav>
        </header>
    );
}

// --- Search Form Component ---
function SearchForm({ tripType, setTripType, onSearch }) {
    const [searchParams, setSearchParams] = useState({
        origin: null,
        destination: null,
        departureDate: '',
        isRoundTrip: false,
        company: '',
        travelClass: '',
        minPrice: '',
        maxPrice: '',
    });
    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [travelClasses, setTravelClasses] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        api.get('/api/cities/').then(res => setCities(res.data.map(c => ({ value: c.city_name, label: c.city_name })))).catch(err => console.error("Error fetching cities:", err));
        api.get('/api/companies/').then(res => setCompanies(res.data)).catch(err => console.error("Error fetching companies:", err));
        api.get('/api/travel-options/').then(res => setTravelClasses(res.data.travel_classes)).catch(err => console.error("Error fetching travel options:", err));
    }, []);

    const handleSwap = () => {
        setSearchParams(prev => ({ ...prev, origin: prev.destination, destination: prev.origin }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSelectChange = (name, selectedOption) => {
        setSearchParams(prev => ({ ...prev, [name]: selectedOption }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ ...searchParams, tripType });
    };

    const TripTypeButton = ({ type, icon, label }) => ( <button type="button" onClick={() => setTripType(type)} className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200 border-b-4 ${tripType === type ? 'bg-white text-primary-blue border-accent-orange' : 'bg-transparent text-white/80 hover:bg-white/10 border-transparent'}`}>{icon}<span className="font-bold">{label}</span></button> );
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
                        <Select options={cities} required value={searchParams.origin} onChange={(opt) => handleSelectChange('origin', opt)} placeholder="Origin" isClearable isSearchable styles={customSelectStyles} className="w-full" />
                        <button onClick={handleSwap} type="button" className="flex-shrink-0 w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary-blue transition-all duration-200"><SwapIcon /></button>
                        <Select options={cities} required value={searchParams.destination} onChange={(opt) => handleSelectChange('destination', opt)} placeholder="Destination" isClearable isSearchable styles={customSelectStyles} className="w-full" />
                    </div>
                    <div className="md:col-span-2">
                        <input type="date" required name="departureDate" value={searchParams.departureDate} onChange={handleChange} className="w-full p-4 h-[60px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none text-gray-500" />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1"><button type="submit" className="w-full h-[60px] bg-accent-orange text-white rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30">Search</button></div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-primary-blue font-semibold hover:underline"><FilterIcon /><span>{showFilters ? 'Hide' : 'Show'} Advanced Filters</span></button>
                </div>
                {showFilters && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-dark-text mb-4">Optional Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input type="number" name="minPrice" value={searchParams.minPrice} onChange={handleChange} placeholder="Min Price" className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            <input type="number" name="maxPrice" value={searchParams.maxPrice} onChange={handleChange} placeholder="Max Price" className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue"/>
                            <select name="company" value={searchParams.company} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue bg-white"><option value="">All Companies</option>{companies.map(comp => <option key={comp} value={comp}>{comp}</option>)}</select>
                            <select name="travelClass" value={searchParams.travelClass} onChange={handleChange} className="w-full p-3 h-[50px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue bg-white"><option value="">All Classes</option>{travelClasses.map(cls => <option key={cls} value={cls}>{cls.charAt(0).toUpperCase() + cls.slice(1)}</option>)}</select>
                            <div className="flex items-center justify-center p-3 border border-gray-300 rounded-lg bg-gray-50 h-[50px]">
                                <input id="round-trip-checkbox" name="isRoundTrip" type="checkbox" checked={searchParams.isRoundTrip} onChange={handleChange} className="h-5 w-5 text-primary-blue rounded border-gray-300 focus:ring-secondary-blue" />
                                <label htmlFor="round-trip-checkbox" className="ml-3 block text-sm text-gray-900 font-medium">Round Trip</label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}

function Home() {
    const [tripType, setTripType] = useState('plane');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState({ first_name: 'Guest', last_name: '', email: '' }); // Default user

    // میتوانید اطلاعات کاربر را از یک API بخوانید
    // useEffect(() => {
    //   api.get('/api/profile/').then(res => setUser(res.data));
    // }, []);

    const handleSearch = async (params) => {
        setLoading(true);
        setError(null);
        setSearched(true);
        setSearchResults([]);

        const searchData = {
            origin_city_name: params.origin?.value,
            destination_city_name: params.destination?.value,
            travel_date: params.departureDate,
            transport_type: tripType,
            is_round_trip: params.isRoundTrip,
            company_name: params.company,
            travel_class: params.travelClass,
            min_price: params.minPrice,
            max_price: params.maxPrice,
        };

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
    
    return (
        <div className="min-h-screen bg-light-bg font-sans">
            <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} />
            <Header onMenuClick={() => setIsMenuOpen(true)} />
            <main>
                <div className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-secondary-blue" style={{clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'}}/>
                    <div className="absolute inset-0 z-0">
                        <PlaneIcon className={`absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 text-white/5 transition-opacity duration-700 ease-in-out ${tripType === 'plane' ? 'opacity-100' : 'opacity-0'}`}/>
                        <TrainIcon className={`absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 text-white/5 transition-opacity duration-700 ease-in-out ${tripType === 'train' ? 'opacity-100' : 'opacity-0'}`}/>
                        <BusIcon className={`absolute -top-1/4 -right-1/4 w-1/2 h-1/2 text-white/5 transition-opacity duration-700 ease-in-out ${tripType === 'bus' ? 'opacity-100' : 'opacity-0'}`}/>
                    </div>
                    <div className="container mx-auto px-6 text-center z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Where to next?</h1>
                        <p className="text-xl text-white/80">Book your next trip with ease and confidence.</p>
                    </div>
                </div>
                
                <div className="container mx-auto px-6 -mt-32 sm:-mt-24 z-20 relative">
                    <SearchForm tripType={tripType} setTripType={setTripType} onSearch={handleSearch} />
                </div>
                
                <div className="container mx-auto px-6 mt-12 mb-16">
                    {loading && <div className="text-center p-10"><p>Loading results...</p></div>}
                    {error && <div className="text-center p-10 text-red-500"><p>{error}</p></div>}
                    {!loading && searched && searchResults.length === 0 && (
                        <div className="text-center p-10 bg-white rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-dark-text">No Tickets Found</h3>
                            <p className="text-gray-500 mt-2">We couldn't find any trips matching your search criteria. Please try different dates or locations.</p>
                        </div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-dark-text mb-4">Available Tickets</h2>
                            {searchResults.map(ticket => (
                                <div key={ticket.travel_id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center hover:shadow-xl transition-shadow">
                                    <div>
                                        <p className="font-bold text-lg text-primary-blue">{ticket.transport_company_name}</p>
                                        <p className="font-semibold">{ticket.departure_city_name} to {ticket.destination_city_name}</p>
                                        <p className="text-sm text-gray-500">{new Date(ticket.departure_time).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-dark-text">${ticket.price}</p>
                                        <button className="mt-2 bg-accent-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">Select</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Home;
