import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';
import OtpInput from '../components/OtpInput';

const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

function ChangePasswordForm({ setNotification }) {
    const { t } = useTranslation();
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="old_password" value={passwords.old_password} onChange={(e) => setPasswords(p => ({...p, old_password: e.target.value}))} placeholder={t('current_password')} required />
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="new_password" value={passwords.new_password} onChange={(e) => setPasswords(p => ({...p, new_password: e.target.value}))} placeholder={t('new_password')} required />
            <input className="w-full text-start ltr:text-left rtl:text-right px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg" type="password" name="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirm_new_password')} required />
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

    const handleClose = () => {
        setStep(1);
        setNewEmail('');
        setOtp('');
        setError('');
        onClose();
    };

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
            handleClose();
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
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('change_email_prompt')}</p>
                        <input dir="ltr" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new-email@example.com" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg mb-4" />
                        <button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-lg bg-primary-blue text-white font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? t('loading') : t('send_otp')}
                        </button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('otp_prompt', { email: newEmail })}</p>
                        <OtpInput value={otp} onChange={setOtp} />
                        <button type="submit" disabled={loading} className="mt-6 w-full py-2 px-4 rounded-lg bg-primary-blue text-white font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? t('loading') : t('verify_email')}
                        </button>
                    </form>
                )}
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <button onClick={handleClose} className="mt-4 w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    {t('cancel')}
                </button>
            </div>
        </div>
    );
}

function AdminSettings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isChangeEmailModalOpen, setChangeEmailModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('settings')}</h1>
            <div className="space-y-8">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-primary-blue dark:text-secondary-blue mb-4">{t('account')}</h2>
                    <div className="divide-y dark:divide-gray-700">
                        <details className="p-4 group">
                            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                                {t('change_password')}
                                <span className="transition-transform transform group-open:rotate-180 rtl:group-open:-rotate-180">▼</span>
                            </summary>
                            <ChangePasswordForm setNotification={setNotification} />
                        </details>
                        <button onClick={() => setChangeEmailModalOpen(true)} className="w-full text-start p-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">{t('change_email')}</button>
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-primary-blue dark:text-secondary-blue mb-4">{t('appearance')}</h2>
                    <div className="flex justify-between items-center p-4">
                        <span className="font-semibold">{t('theme')}</span>
                        <ThemeToggle />
                    </div>
                    <div className="flex justify-between items-center p-4">
                        <span className="font-semibold">{t('language')}</span>
                        <LanguageSwitcher />
                    </div>
                </div>
                <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-4 px-4 py-3 rounded-lg text-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
                    >
                        <LogoutIcon />
                        <span className="font-semibold">{t('logout')}</span>
                    </button>
                </div>
            </div>
            <ChangeEmailModal 
                isOpen={isChangeEmailModalOpen} 
                onClose={() => setChangeEmailModalOpen(false)} 
                setNotification={setNotification} 
            />
        </div>
    );
}

export default AdminSettings;