import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import AuthFormContainer from '../components/AuthFormContainer';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setNotification({ message: "Passwords do not match.", type: 'error' });
            return;
        }
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const res = await api.post('/api/reset-password/', { token, new_password: newPassword });
            setNotification({ message: res.data.message, type: 'success' });
            setTimeout(() => {
                navigate('/login', { state: { message: "Password reset successfully! You can now log in." } });
            }, 2000);
        } catch (err) {
            setNotification({ message: err.response?.data?.error || "An error occurred.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Notification 
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            <AuthFormContainer title="Set a New Password">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                            id="new-password" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition" 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                            id="confirm-password" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>
                    
                    {loading && <LoadingIndicator />}
                    
                    <button 
                        className="w-full bg-primary-blue text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:bg-gray-400" 
                        type="submit" 
                        disabled={loading}
                    >
                        Reset Password
                    </button>
                </form>
            </AuthFormContainer>
        </>
    );
}

export default ResetPassword;
