import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import AuthFormContainer from '../components/AuthFormContainer';
import OtpInput from '../components/OtpInput';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function VerifyOTP() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");
    const [timer, setTimer] = useState(300); 
    const [canResend, setCanResend] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    
    const email = location.state?.email || query.get('email');
    const hasAutoSubmitted = useRef(false);

    useEffect(() => {
        const otpFromQuery = query.get('otp');
        if (otpFromQuery && otpFromQuery.length === 6 && !hasAutoSubmitted.current) {
            hasAutoSubmitted.current = true;
            setOtp(otpFromQuery);
            handleAutoSubmit(otpFromQuery);
        }
    }, [query, email]);

    useEffect(() => {
        if (timer > 0) {
            setCanResend(false);
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    if (!email) {
        return (
            <AuthFormContainer title="Error">
                <p className="text-center text-red-500">
                    No email address provided. Please <Link to="/register" className="font-medium text-primary-blue hover:underline">register</Link> again.
                </p>
            </AuthFormContainer>
        );
    }

    const handleAutoSubmit = async (autoOtp) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/verify-otp/", { email, otp: autoOtp });
            navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
        } catch (err) {
            setError("Verification via link failed. Please enter the code manually.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/verify-otp/", { email, otp });
            navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLoading(true);
        setError(null);
        setSuccess("");
        try {
            await api.post("/api/resend-otp/", { email });
            setTimer(300); 
            setCanResend(false);
            setSuccess("A new OTP has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to resend OTP. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        <AuthFormContainer title="Verify Your Account">
            <div className="text-center text-gray-600 dark:text-gray-300 mb-8">
                <p>An OTP has been sent to <strong>{email}</strong>.</p>
                <p>Please enter the 6-digit code below.</p>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-8">
                <OtpInput value={otp} onChange={setOtp} />
                
                {loading && <LoadingIndicator />}
                {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center font-semibold">{success}</p>}
                
                <button 
                    className="w-full bg-accent-orange text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:shadow-none" 
                    type="submit" 
                    disabled={loading || otp.length < 6}
                >
                    Verify Account
                </button>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400 h-5">
                    {canResend ? (
                        <span>
                            Didn't receive the code?{' '}
                            <button 
                                type="button" 
                                onClick={handleResend} 
                                className="font-semibold text-primary-blue hover:underline bg-transparent border-none p-0 cursor-pointer disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed" 
                                disabled={loading}
                            >
                                Resend Code
                            </button>
                        </span>
                    ) : (
                        <span>
                            You can resend the code in <span className="font-bold text-primary-blue">{formatTime(timer)}</span>
                        </span>
                    )}
                </div>
            </form>
        </AuthFormContainer>
    );
}

export default VerifyOTP;