import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

const AdminHeader = ({ user }) => {
    const { t } = useTranslation();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md border-b dark:border-gray-700">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-primary-blue dark:text-white">
                    <Link to="/">✈️ SafarTicket</Link>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Link to="/admin/profile" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-blue">
                        <span className="font-semibold hidden sm:block">{user?.first_name} {user?.last_name}</span>
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                            <img
                                src={user?.profile_image_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=0D47A1&color=fff&size=128`}
                                alt="Admin Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;