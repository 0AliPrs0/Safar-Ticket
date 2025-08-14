import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import AuthFormContainer from '../components/AuthFormContainer';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

function AdminForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const res = await api.post('/api/admin/forgot-password/', { email });
            setNotification({ message: res.data.message, type: 'success' });
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "An error occurred.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <AuthFormContainer title={t('forgot_password_title')}>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">{t('forgot_password_prompt')}</p>
                <form onSubmit={handleSubmit} className="space-y-6 text-start">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_address')}</label>
                        <input id="email" dir="ltr" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin-email@example.com" required />
                    </div>
                    {loading && <LoadingIndicator />}
                    <button className="w-full bg-primary-blue text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90" type="submit" disabled={loading}>
                        {t('send_reset_link')}
                    </button>
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('remember_password')}{" "}
                        <Link to="/admin/login" className="font-semibold text-accent-orange hover:underline">{t('login')}</Link>
                    </p>
                </form>
            </AuthFormContainer>
        </>
    );
}

export default AdminForgotPassword;