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
    
    const formRef = useRef(null); 
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    
    const email = location.state?.email || query.get('email');
    const otpExpiryKey = `otp_expiry_${email}`;

    useEffect(() => {
        const otpFromQuery = query.get('otp');
        if (otpFromQuery && otpFromQuery.length === 6) {
            setOtp(otpFromQuery);
            setTimeout(() => {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            }, 300);
        }
    }, [query]);

    useEffect(() => {
        const storedExpiry = localStorage.getItem(otpExpiryKey);
        let initialTime;

        if (storedExpiry) {
            const remainingTime = Math.round((parseInt(storedExpiry, 10) - Date.now()) / 1000);
            initialTime = remainingTime > 0 ? remainingTime : 0;
        } else {
            const newExpiry = Date.now() + 300000;
            localStorage.setItem(otpExpiryKey, newExpiry);
            initialTime = 300;
        }
        
        setTimer(initialTime);

    }, [email]);

    useEffect(() => {
        if (timer > 0) {
            setCanResend(false);
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
            localStorage.removeItem(otpExpiryKey);
        }
    }, [timer, email]);

    if (!email) {
        return (
            <AuthFormContainer title="Error">
                <p className="text-center text-red-500">
                    No email address provided. Please <Link to="/register" className="font-medium text-[#0D47A1] hover:underline">register</Link> again.
                </p>
            </AuthFormContainer>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess("");
        try {
            const res = await api.post("/api/verify-otp/", { email, otp });
            if (res.status === 200) {
                localStorage.removeItem(otpExpiryKey);
                navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
            }
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
            const newExpiry = Date.now() + 300000;
            localStorage.setItem(otpExpiryKey, newExpiry);
            setTimer(300);
            setCanResend(false);
            setSuccess("A new OTP has been sent.");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to resend OTP.");
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
            <div className="text-center text-gray-600 mb-8">
                <p>An OTP has been sent to <strong>{email}</strong>.</p>
                <p>Please enter the 6-digit code below.</p>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                <OtpInput value={otp} onChange={setOtp} />
                
                {loading && <LoadingIndicator />}
                {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center font-semibold">{success}</p>}
                
                <button className="w-full bg-[#FFA726] text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30 disabled:bg-gray-400 disabled:shadow-none" type="submit" disabled={loading || otp.length < 6}>
                    Verify Account
                </button>

                <div className="text-center text-sm text-gray-500">
                    {canResend ? (
                        <span>
                            Didn't receive the code?{' '}
                            <button type="button" onClick={handleResend} className="font-semibold text-[#0D47A1] hover:underline bg-transparent border-none p-0 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed" disabled={loading}>
                                Resend Code
                            </button>
                        </span>
                    ) : (
                        <span>
                            You can resend the code in <span className="font-bold text-[#0D47A1]">{formatTime(timer)}</span>
                        </span>
                    )}
                </div>
            </form>
        </AuthFormContainer>
    );
}

export default VerifyOTP;
