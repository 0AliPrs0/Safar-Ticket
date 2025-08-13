import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import Header from '../components/Header';
import SlideOutMenu from '../components/SlideOutMenu';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import ConfirmationModal from '../components/ConfirmationModal';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OtpInput from '../components/OtpInput';

function ChangePasswordForm({ setNotification }) {
    const { t } = useTranslation();
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="old_password" value={passwords.old_password} onChange={handleChange} placeholder={t('current_password')} required />
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="new_password" value={passwords.new_password} onChange={handleChange} placeholder={t('new_password')} required />
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="confirm_password" value={confirmPassword} onChange={handleChange} placeholder={t('confirm_new_password')} required />
            <button className="w-full bg-[#0D47A1] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:bg-gray-400" type="submit" disabled={loading}>
                {loading ? t('loading') : t('update_password')}
            </button>
        </form>
    );
}

function ChangeEmailModal({ isOpen, onClose, setNotification }) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/settings/change-email-request/', { new_email: newEmail });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/settings/change-email-verify/', { otp });
            setNotification({ message: res.data.message, type: 'success' });
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('change_email')}</h3>
                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Enter your new email address. We'll send a verification code.</p>
                        <input dir="ltr" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new-email@example.com" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg mb-4" />
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-lg bg-primary-blue text-white font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? t('loading') : 'Send OTP'}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Enter the 6-digit code sent to {newEmail}.</p>
                        <OtpInput value={otp} onChange={setOtp} />
                        <button type="submit" disabled={loading} className="mt-6 w-full py-2 px-4 rounded-lg bg-primary-blue text-white font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? t('loading') : 'Verify & Change Email'}
                        </button>
                    </form>
                )}
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <button onClick={onClose} className="mt-4 w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
}

function Settings() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasPendingPayment, setHasPendingPayment] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const [allowReminders, setAllowReminders] = useState(true);
    const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [isChangeEmailModalOpen, setChangeEmailModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await api.get('/api/profile/');
                setUser(userRes.data);
                setAllowReminders(userRes.data.allow_payment_reminders);
                
                const bookingsRes = await api.get('/api/user-booking/');
                setHasPendingPayment(bookingsRes.data.some(b => b.status === 'reserved' && new Date(b.expiration_time) > new Date()));

            } catch (error) {
                setNotification({ message: 'Failed to load user data.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleToggleReminders = async (e) => {
        const isChecked = e.target.checked;
        setAllowReminders(isChecked);
        try {
            const res = await api.post('/api/settings/toggle-reminders/', { allow_reminders: isChecked });
            setNotification({ message: res.data.message, type: 'success' });
        } catch (error) {
            setNotification({ message: 'Failed to update settings.', type: 'error' });
            setAllowReminders(!isChecked);
        }
    };
    
    const handleDeactivateAccount = async () => {
        try {
            await api.post('/api/settings/deactivate-account/');
            localStorage.clear();
            navigate('/login', { state: { message: "Your account has been deactivated." } });
        } catch (error) {
            setNotification({ message: 'Failed to deactivate account.', type: 'error' });
            setDeactivateModalOpen(false);
        }
    };

    if (loading || !user) {
        return <div className="flex justify-center items-center h-screen"><LoadingIndicator /></div>
    }

    return (
        <div className="min-h-screen">
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <Header isAuthenticated={true} onMenuClick={() => setIsMenuOpen(true)} user={user} hasPendingPayment={hasPendingPayment} />
            <SlideOutMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} hasPendingPayment={hasPendingPayment} />
            
            <main className="container mx-auto p-6 pt-24">
                <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-8">{t('settings')}</h1>
                <div className="space-y-8">
                    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                        <h2 className="text-xl font-bold text-primary-blue dark:text-secondary-blue mb-4">Account</h2>
                        <div className="divide-y dark:divide-gray-700">
                            <details className="p-4 group">
                                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                                    {t('change_password')}
                                    <span className="transition-transform transform group-open:rotate-180">▼</span>
                                </summary>
                                <ChangePasswordForm setNotification={setNotification} />
                            </details>
                            <button onClick={() => setChangeEmailModalOpen(true)} className="w-full text-start p-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">{t('change_email')}</button>
                            <button onClick={() => setDeactivateModalOpen(true)} className="w-full text-start p-4 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">{t('deactivate_account')}</button>
                        </div>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                        <h2 className="text-xl font-bold text-primary-blue dark:text-secondary-blue mb-4">{t('notifications')}</h2>
                        <div className="flex justify-between items-center p-4">
                            <span className="font-semibold">{t('payment_reminders')}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={allowReminders} onChange={handleToggleReminders} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                        <h2 className="text-xl font-bold text-primary-blue dark:text-secondary-blue mb-4">{t('appearance')}</h2>
                        <div className="flex justify-between items-center p-4">
                            <span className="font-semibold">{t('theme')}</span>
                            <ThemeToggle />
                        </div>
                        <div className="flex justify-between items-center p-4">
                            <span className="font-semibold">{t('Language')}</span>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmationModal 
                isOpen={isDeactivateModalOpen} 
                onClose={() => setDeactivateModalOpen(false)} 
                onConfirm={handleDeactivateAccount} 
                title="Deactivate Account"
                confirmText="Yes, Deactivate"
            >
                <p>Are you sure you want to deactivate your account? You will be logged out.</p>
            </ConfirmationModal>
            
            <ChangeEmailModal 
                isOpen={isChangeEmailModalOpen} 
                onClose={() => setChangeEmailModalOpen(false)} 
                setNotification={setNotification} 
            />
        </div>
    );
}

export default Settings;