import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import SlideOutMenu from '../components/SlideOutMenu';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import Header from '../components/Header';

const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

function ChangePasswordForm() {
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'confirm_password') {
            setConfirmPassword(value);
        } else {
            setPasswords(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== confirmPassword) {
            setNotification({ message: "New passwords do not match.", type: 'error' });
            return;
        }
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const res = await api.post("/api/change-password/", passwords);
            setNotification({ message: res.data.message, type: 'success' });
            setPasswords({ old_password: '', new_password: '' });
            setConfirmPassword('');
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "Failed to change password.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Notification 
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification({ message: '', type: '' })}
          />
          <h3 className="text-xl font-bold text-[#0D47A1] dark:text-white mb-6">Change Password</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
              <input className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="old_password" value={passwords.old_password} onChange={handleChange} placeholder="Current Password" required />
              <input className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="new_password" value={passwords.new_password} onChange={handleChange} placeholder="New Password" required />
              <input className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="confirm_password" value={confirmPassword} onChange={handleChange} placeholder="Confirm New Password" required />
              <button className="w-full bg-[#0D47A1] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:bg-gray-400" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Update Password"}
              </button>
          </form>
      </div>
  );
}


function Profile() {
  const [user, setUser] = useState({
    first_name: "", last_name: "", phone_number: "",
    birth_date: "", city_name: "", email: "", profile_image_url: ""
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
        try {
          const profileRes = await api.get("/api/profile/");
          const citiesRes = await api.get("/api/cities/");
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
  }, []);

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
    const { email, profile_image_url, user_id, wallet, ...dataToUpdate } = user;
    const filteredData = Object.fromEntries(Object.entries(dataToUpdate).filter(([_, value]) => value !== '' && value !== null));
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

  if (loadingProfile) {
    return <div className="flex justify-center items-center h-screen bg-[#F8F9FA]"><LoadingIndicator /></div>
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
                    className="absolute bottom-1 right-1 bg-[#FFA726] w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all"
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input id="first_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="text" name="first_name" value={user.first_name} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input id="last_name" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="text" name="last_name" value={user.last_name} onChange={handleChange} />
              </div>
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input id="phone_number" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="tel" name="phone_number" value={user.phone_number} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Birth Date</label>
                <input id="birth_date" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="date" name="birth_date" value={user.birth_date} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <select id="city_name" name="city_name" value={user.city_name || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg">
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_name}>{city.city_name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-4">
              <button className="w-full bg-[#FFA726] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:bg-gray-400" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </form>

          <ChangePasswordForm />
        </div>
      </main>
    </div>
  );
}

export default Profile;