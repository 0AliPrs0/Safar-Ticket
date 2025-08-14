import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import SlideOutMenu from '../components/SlideOutMenu';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import Header from '../components/Header';
import { faToEn } from '../i18n';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

function Profile() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
        const lang = i18n.language.startsWith('fa') ? 'fa' : 'en';
        try {
          const profileRes = await api.get("/api/profile/");
          const citiesRes = await api.get(`/api/cities/?lang=${lang}`);
          const bookingsRes = await api.get('/api/user-booking/');

          const profileData = profileRes.data;
          if (profileData.birth_date) {
            profileData.birth_date = profileData.birth_date.split('T')[0];
          }
          setUser(profileData);
          setCities(citiesRes.data);
          
          const pending = bookingsRes.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date());
          setHasPendingPayment(pending);

        } catch (err) {
          setNotification({ message: "Failed to load profile data.", type: 'error' });
        } finally {
          setLoadingProfile(false);
        }
      };
    fetchProfileData();
  }, [i18n.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageFormData = new FormData();
    imageFormData.append('profile_image', file);
    
    setLoading(true);
    try {
        const res = await api.post('/api/upload-profile-image/', imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUser(prev => ({ ...prev, profile_image_url: res.data.profile_image_url }));
        setNotification({ message: "Profile image updated!", type: 'success' });
    } catch (err) {
        setNotification({ message: err.response?.data?.error || "Failed to upload image.", type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });
    
    // Create a mutable copy for modification
    let dataToUpdate = { ...user };

    // Reverse translate city name if in Persian mode
    if (i18n.language === 'fa' && dataToUpdate.city_name) {
        const cityInEnglish = faToEn.cities[dataToUpdate.city_name];
        if (cityInEnglish) {
            dataToUpdate.city_name = cityInEnglish;
        }
    }
    
    const { email, profile_image_url, user_id, wallet, allow_payment_reminders, ...finalData } = dataToUpdate;
    const filteredData = Object.fromEntries(Object.entries(finalData).filter(([_, value]) => value !== '' && value !== null));
    
    if (Object.keys(filteredData).length === 0) {
      setNotification({ message: "No changes to update.", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await api.put("/api/update-profile/", filteredData);
      setNotification({ message: res.data.message || "Profile updated successfully!", type: 'success' });
    } catch (err) {
      setNotification({ message: err.response?.data?.error || "Failed to update profile.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile || !user) {
    return <div className="flex justify-center items-center h-screen bg-[#F8F9FA] dark:bg-gray-900"><LoadingIndicator /></div>
  }

  return (
    <div className="min-h-screen">
      <Notification 
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: '' })}
      />
      <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={hasPendingPayment} />
      <Header onMenuClick={() => setIsMenuOpen(true)} user={user} isAuthenticated={true} hasPendingPayment={hasPendingPayment} />
      
      <main className="container mx-auto p-6 pb-24 pt-12">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
                <img 
                    src={user.profile_image_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=0D47A1&color=fff&size=128`} 
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
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                />
            </div>
            <h2 className="text-2xl font-bold text-[#0D47A1] dark:text-white mt-4">{user.first_name} {user.last_name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('first_name')}</label>
                <input id="first_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white" type="text" name="first_name" value={user.first_name} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('last_name')}</label>
                <input id="last_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white" type="text" name="last_name" value={user.last_name} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone_number')}</label>
              <input dir="ltr" id="phone_number" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white" type="tel" name="phone_number" value={user.phone_number} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('birth_date')}</label>
                <input id="birth_date" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white" type="date" name="birth_date" value={user.birth_date} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('city')}</label>
                <select id="city_name" name="city_name" value={user.city_name || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_name}>{city.city_name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <button className="w-full bg-[#FFA726] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:bg-gray-400" type="submit" disabled={loading}>
                {loading ? t('loading') : t('save_changes')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;