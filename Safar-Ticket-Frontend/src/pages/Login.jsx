import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "../components/LoadingIndicator";
import AuthFormContainer from "../components/AuthFormContainer";

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

function Login() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const from = location.state?.from?.pathname || "/";
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/login/", { username, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      window.location.href = from;
    } catch (error) {
      setError(error.response?.data?.detail || error.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer title={t('login_to_account')}>
      {successMessage && <p className="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 p-3 rounded-lg mb-6 text-center font-semibold">{successMessage}</p>}
      <form onSubmit={handleSubmit} className="space-y-6" dir={i18n.language === 'fa' ? 'rtl' : 'ltr'}>
        <div className="text-start">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email_address')}</label>
          <input id="email" dir="ltr" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition text-gray-900 dark:text-white" type="email" value={username} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
        </div>
        <div className="text-start">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('password')}</label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary-blue hover:underline">{t('forgot_password')}</Link>
          </div>
          <div className="relative flex items-center">
            <input id="password" dir="ltr" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-secondary-blue focus:outline-none transition text-gray-900 dark:text-white pr-10" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility" className="absolute right-0 p-3 flex items-center text-gray-500 hover:text-primary-blue">
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        
        {loading && <LoadingIndicator />}
        {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
        
        <button className="w-full bg-primary-blue text-white py-3 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:bg-gray-400" type="submit" disabled={loading}>
          {t('login')}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('dont_have_account')}{" "}
          <Link to="/register" className="font-semibold text-accent-orange hover:underline">{t('register')}</Link>
        </p>
      </form>
    </AuthFormContainer>
  );
}

export default Login;