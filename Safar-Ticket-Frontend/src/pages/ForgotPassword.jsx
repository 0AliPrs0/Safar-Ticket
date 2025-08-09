import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthFormContainer from '../components/AuthFormContainer';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const res = await api.post('/api/forgot-password/', { email });
            setNotification({ message: res.data.message, type: 'success' });
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
            <AuthFormContainer title="Forgot Your Password?">
                <p className="text-center text-gray-600 mb-6">
                    No problem. Enter your email address below and we'll send you a link to reset it.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input 
                            id="email" 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="email@example.com" 
                            required 
                        />
                    </div>
                    
                    {loading && <LoadingIndicator />}
                    
                    <button 
                        className="w-full bg-primary-blue text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:bg-gray-400" 
                        type="submit" 
                        disabled={loading}
                    >
                        Send Reset Link
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Remember your password?{" "}
                        <Link to="/login" className="font-semibold text-accent-orange hover:underline">Back to Login</Link>
                    </p>
                </form>
            </AuthFormContainer>
        </>
    );
}

export default ForgotPassword;
