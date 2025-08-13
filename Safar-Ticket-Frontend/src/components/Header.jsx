import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>;


function Header({ isAuthenticated, onMenuClick, user, onChargeClick, hasPendingPayment }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <header className="bg-white/80 backdrop-blur-md dark:bg-gray-800/80 shadow-sm sticky top-0 left-0 right-0 z-30">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <button onClick={onMenuClick} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <MenuIcon />
                            {hasPendingPayment && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                        </button>
                    )}
                    <div className="text-2xl font-bold text-primary-blue dark:text-white cursor-pointer" onClick={() => navigate('/')}>✈️ SafarTicket</div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                <WalletIcon />
                                <span className="font-bold text-primary-blue dark:text-white">${user?.wallet?.toLocaleString() || '0'}</span>
                                {onChargeClick && (
                                    <button onClick={onChargeClick} className="ml-2 bg-primary-blue text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-opacity-90 transition-transform hover:scale-110">+</button>
                                )}
                            </div>
                            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-secondary-blue transition-all duration-200" title="My Account">
                                <img
                                    src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=0D47A1&color=fff&size=128`}
                                    alt="User Profile"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-blue transition-colors">{t('login')}</button>
                            <button onClick={() => navigate('/register')} className="bg-primary-blue text-white px-5 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">{t('register')}</button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Header;