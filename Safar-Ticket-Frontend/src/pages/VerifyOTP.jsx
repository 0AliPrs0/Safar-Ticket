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
    const formRef = useRef(null); 
    
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    
  
    const emailFromState = location.state?.email;
    const emailFromQuery = query.get('email');
    const email = emailFromState || emailFromQuery;
    
    
    useEffect(() => {
        const otpFromQuery = query.get('otp');
        if (otpFromQuery && otpFromQuery.length === 6) {
            setLoading(true);
            setTimeout(() => {
                setOtp(otpFromQuery);
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            }, 500);
        }
    }, [query]);

    if (!email) {
        return (
            <AuthFormContainer title="Error">
                <p className="text-center text-red-500">
                    No email address provided. Please <Link to="/register" className="font-medium text-primary-blue hover:underline">register</Link> again.
                </p>
            </AuthFormContainer>
        );
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post("/api/verify-otp/", { email, otp });
            if (res.status === 201 || res.status === 200) {
                navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
        } finally {
            setLoading(false);
        }
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
                
                <button 
                    className="w-full bg-accent-orange text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30 disabled:bg-gray-400 disabled:shadow-none" 
                    type="submit" 
                    disabled={loading || otp.length < 6}
                >
                    Verify Account
                </button>

                <p className="text-center text-sm text-gray-500">
                    Didn't receive the code? <button type="button" className="font-semibold text-primary-blue hover:underline bg-transparent border-none p-0 cursor-pointer">Resend Code</button>
                </p>
            </form>
        </AuthFormContainer>
    );
}

export default VerifyOTP;