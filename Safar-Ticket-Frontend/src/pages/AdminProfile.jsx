import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import api from '../api';
import { faToEn } from '../i18n';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

function AdminProfile() {
    const { t, i18n } = useTranslation();
    const { user, onProfileUpdate } = useOutletContext();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const fileInputRef = useRef(null);
    const [localUser, setLocalUser] = useState(null);

    useEffect(() => {
        if (user) {
            const userData = { ...user };
            if (userData.birth_date) {
                userData.birth_date = userData.birth_date.split('T')[0];
            }
            setLocalUser(userData);
        }
    }, [user]);

    useEffect(() => {
        const fetchCities = async () => {
            const lang = i18n.language.startsWith('fa') ? 'fa' : 'en';
            try {
                const citiesRes = await api.get(`/api/cities/?lang=${lang}`);
                setCities(citiesRes.data);
            } catch (err) {
                setNotification({ message: "Failed to load city data.", type: 'error' });
            }
        };
        fetchCities();
    }, [i18n.language]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalUser((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const imageFormData = new FormData();
        imageFormData.append('profile_image', file);
        
        setLoading(true);
        try {
            await api.post('/api/upload-profile-image/', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNotification({ message: "Profile image updated!", type: 'success' });
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Failed to upload image.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localUser) return;

        setLoading(true);
        setNotification({ message: '', type: '' });
        
        let dataToUpdate = { ...localUser, user_id: user.user_id };
        
        if (i18n.language === 'fa' && dataToUpdate.city_name) {
            const cityInEnglish = faToEn.cities[dataToUpdate.city_name];
            if (cityInEnglish) {
                dataToUpdate.city_name = cityInEnglish;
            } else {
                // Fallback to prevent empty values
                console.warn("City not found in mapping:", dataToUpdate.city_name);
                delete dataToUpdate.city_name;
            }
        }
        
        const { email, profile_image_url, user_id, wallet, ...finalData } = dataToUpdate;
        const filteredData = Object.fromEntries(Object.entries(finalData).filter(([key, value]) => value !== '' && value !== null && user[key] !== value));

        if (Object.keys(filteredData).length === 0) {
          setNotification({ message: "No changes to update.", type: 'error' });
          setLoading(false);
          return;
        }

        try {
            const res = await api.put("/api/admin/update-profile/", filteredData);
            setNotification({ message: res.data.message || "Profile updated successfully!", type: 'success' });
            if (onProfileUpdate) onProfileUpdate();
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Failed to update profile.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!localUser) {
        return <div className="flex justify-center items-center h-full"><LoadingIndicator /></div>
    }

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('profile')}</h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border dark:border-gray-700 max-w-2xl mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <img 
                            src={localUser.profile_image_url || `https://ui-avatars.com/api/?name=${localUser.first_name}+${localUser.last_name}&background=0D47A1&color=fff&size=128`} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                        />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-1 right-1 rtl:right-auto rtl:left-1 bg-[#FFA726] w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all"
                            title="Change profile picture"
                        >
                            <CameraIcon />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0D47A1] dark:text-white mt-4">{localUser.first_name} {localUser.last_name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{localUser.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-start">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('first_name')}</label>
                            <input id="first_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="text" name="first_name" value={localUser.first_name || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('last_name')}</label>
                            <input id="last_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="text" name="last_name" value={localUser.last_name || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number')}</label>
                        <input dir="ltr" id="phone_number" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="tel" name="phone_number" value={localUser.phone_number || ''} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('birth_date')}</label>
                            <input id="birth_date" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="date" name="birth_date" value={localUser.birth_date || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')}</label>
                            <select id="city_name" name="city_name" value={localUser.city_name || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg">
                                <option value="">Select a city</option>
                                {cities.map((city) => (
                                    <option key={city.city_id} value={city.city_name}>{city.city_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button className="w-full bg-accent-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90" type="submit" disabled={loading}>
                            {loading ? t('loading') : t('save_changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminProfile;