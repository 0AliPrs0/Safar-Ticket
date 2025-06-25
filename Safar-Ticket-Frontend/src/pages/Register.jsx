import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";
import AuthFormContainer from "../components/AuthFormContainer";

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await api.post("/api/signup/", {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
      });
      if (res.status === 200) {
        navigate("/verify-otp", { state: { email: email } });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Create a New Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
        </div>
        <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
        <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone Number" required />

        <div className="relative">
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </span>
        </div>
        <div className="relative">
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </span>
        </div>
        
        {loading && <LoadingIndicator />}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button className="w-full bg-[#FFA726] text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-400" type="submit" disabled={loading}>
          Register
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-[#0D47A1] hover:underline">Login</Link>
        </p>
      </form>
    </AuthFormContainer>
  );
}

export default Register;
