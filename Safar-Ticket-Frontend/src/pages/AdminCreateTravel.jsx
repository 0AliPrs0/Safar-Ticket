import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

function AdminCreateTravel() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        transport_type: { value: 'plane', label: t('transport_type_plane') },
        departure_city: null,
        destination_city: null,
        departure_terminal_id: null,
        destination_terminal_id: null,
        departure_time: '',
        arrival_time: '',
        total_capacity: '',
        company_name: null,
        price: '',
        travel_class: { value: 'economy', label: 'Economy' },
        is_round_trip: false,
        return_time: null,
    });

    const [cities, setCities] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [departureTerminals, setDepartureTerminals] = useState([]);
    const [destinationTerminals, setDestinationTerminals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [citiesRes, companiesRes] = await Promise.all([
                    api.get('/api/cities/'),
                    api.get('/api/companies/')
                ]);
                setCities(citiesRes.data.map(c => ({ value: c.city_id, label: c.city_name })));
                setCompanies(companiesRes.data.map(c => ({ value: c, label: c })));
            } catch (error) {
                setNotification({ message: 'Failed to load initial data.', type: 'error' });
            }
        };
        fetchData();
    }, []);

    // --- FIX: Fetch terminals when city OR transport_type changes ---
    useEffect(() => {
        if (formData.departure_city && formData.transport_type) {
            setFormData(prev => ({ ...prev, departure_terminal_id: null }));
            api.get(`/api/terminals/?city_id=${formData.departure_city.value}&transport_type=${formData.transport_type.value}`)
                .then(res => setDepartureTerminals(res.data.map(t => ({ value: t.terminal_id, label: t.terminal_name }))))
                .catch(() => setNotification({ message: 'Failed to load departure terminals.', type: 'error' }));
        }
    }, [formData.departure_city, formData.transport_type]);

    useEffect(() => {
        if (formData.destination_city && formData.transport_type) {
            setFormData(prev => ({ ...prev, destination_terminal_id: null }));
            api.get(`/api/terminals/?city_id=${formData.destination_city.value}&transport_type=${formData.transport_type.value}`)
                .then(res => setDestinationTerminals(res.data.map(t => ({ value: t.terminal_id, label: t.terminal_name }))))
                .catch(() => setNotification({ message: 'Failed to load destination terminals.', type: 'error' }));
        }
    }, [formData.destination_city, formData.transport_type]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ message: '', type: '' });

        if (formData.departure_terminal_id?.value && formData.departure_terminal_id.value === formData.destination_terminal_id?.value) {
            setNotification({ message: "Origin and destination terminals cannot be the same.", type: 'error' });
            return;
        }
        if (new Date(formData.arrival_time) <= new Date(formData.departure_time)) {
            setNotification({ message: "Arrival time must be after departure time.", type: 'error' });
            return;
        }
        if (formData.is_round_trip && (new Date(formData.return_time) <= new Date(formData.arrival_time))) {
            setNotification({ message: "Return time must be after arrival time.", type: 'error' });
            return;
        }

        const dataToSubmit = {
            ...Object.fromEntries(Object.entries(formData).map(([key, value]) => [key, value?.value ?? value])),
            departure_terminal_id: formData.departure_terminal_id.value,
            destination_terminal_id: formData.destination_terminal_id.value,
        };
        
        setLoading(true);
        try {
            await api.post('/api/admin/travels/create/', dataToSubmit);
            setNotification({ message: 'Travel created successfully!', type: 'success' });
        } catch (error) {
            setNotification({ message: error.response?.data?.error || 'Failed to create travel.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (name, selectedOption) => {
        setFormData(prev => ({ ...prev, [name]: selectedOption }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    // --- FIX: Added solid backgrounds for react-select components ---
    const reactSelectStyles = {
        control: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--select-bg)', borderColor: 'var(--select-border)' }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--select-bg)' }),
        option: (baseStyles, { isFocused, isSelected }) => ({
            ...baseStyles,
            backgroundColor: isSelected ? '#0D47A1' : isFocused ? 'var(--select-option-hover-bg)' : 'transparent',
            color: isSelected ? 'white' : 'var(--select-text-color)',
            ':active': { ...baseStyles[':active'], backgroundColor: '#0D47A1' }
        }),
        singleValue: (base) => ({...base, color: 'var(--select-text-color)'}),
        input: (base) => ({...base, color: 'var(--select-text-color)'}),
    };
    
    const customSelectStyles = { control: (provided) => ({ ...provided, minHeight: '60px', borderRadius: '0.5rem' }), menu: (provided) => ({...provided, zIndex: 10}) };

    return (
        <div className="react-select-container">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('create_new_travel')}</h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('transport_type')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="transport_type" value={formData.transport_type} onChange={opt => handleSelectChange('transport_type', opt)} options={[{ value: 'plane', label: t('transport_type_plane') }, { value: 'train', label: t('transport_type_train') }, { value: 'bus', label: t('transport_type_bus') }]} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('travel_class')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="travel_class" value={formData.travel_class} onChange={opt => handleSelectChange('travel_class', opt)} options={[{ value: 'economy', label: 'Economy' }, { value: 'business', label: 'Business' }, { value: 'VIP', label: 'VIP' }]} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('company')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="company_name" value={formData.company_name} onChange={opt => handleSelectChange('company_name', opt)} options={companies} isClearable placeholder={t('select_company')} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('origin_city')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="departure_city" value={formData.departure_city} onChange={opt => handleSelectChange('departure_city', opt)} options={cities} isClearable placeholder={t('select_city')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('origin_terminal')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="departure_terminal_id" value={formData.departure_terminal_id} onChange={opt => handleSelectChange('departure_terminal_id', opt)} options={departureTerminals} isClearable isDisabled={!formData.departure_city} placeholder={t('select_terminal')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('destination_city')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="destination_city" value={formData.destination_city} onChange={opt => handleSelectChange('destination_city', opt)} options={cities} isClearable placeholder={t('select_city')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('destination_terminal')}</label>
                        <Select styles={customSelectStyles} className="w-full text-gray-900"  name="destination_terminal_id" value={formData.destination_terminal_id} onChange={opt => handleSelectChange('destination_terminal_id', opt)} options={destinationTerminals} isClearable isDisabled={!formData.destination_city} placeholder={t('select_terminal')} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('departure_time')}</label>
                        <input type="datetime-local" name="departure_time" value={formData.departure_time} onChange={handleInputChange} className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" required min={minDateTime} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('arrival_time')}</label>
                        <input type="datetime-local" name="arrival_time" value={formData.arrival_time} onChange={handleInputChange} className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" required min={formData.departure_time || minDateTime} />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('total_capacity')}</label>
                        <input type="number" name="total_capacity" value={formData.total_capacity} onChange={handleInputChange} className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="e.g., 50" required min="1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" placeholder="e.g., 500000" required min="0" />
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <input type="checkbox" id="is_round_trip" name="is_round_trip" checked={formData.is_round_trip} onChange={handleInputChange} className="h-5 w-5 rounded text-primary-blue focus:ring-secondary-blue" />
                    <label htmlFor="is_round_trip" className="font-medium text-gray-700 dark:text-gray-300">{t('is_round_trip')}</label>
                </div>

                {formData.is_round_trip && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('return_time')}</label>
                        <input type="datetime-local" name="return_time" value={formData.return_time || ''} onChange={handleInputChange} className="w-full p-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700" required={formData.is_round_trip} min={formData.arrival_time || minDateTime} />
                    </div>
                )}

                <div className="text-end">
                    <button type="submit" className="bg-primary-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all" disabled={loading}>
                        {loading ? <LoadingIndicator /> : t('create_travel_button')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdminCreateTravel;