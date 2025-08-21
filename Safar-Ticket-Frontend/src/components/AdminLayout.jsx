import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import AdminHeader from './AdminHeader';

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const BookingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CreateTravelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


const AdminSidebar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const navLinkClasses = "flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-gray-300 hover:bg-blue-600 hover:text-white transition-colors";
    const activeLinkClasses = "bg-blue-700 text-white";

    const menuItems = [
        { name: t('admin_dashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
        { name: t('manage_users'), icon: <UsersIcon />, path: '/admin/users' },
        { name: t('manage_bookings'), icon: <BookingsIcon />, path: '/admin/bookings' },
        // --- ADDED THIS LINE ---
        { name: t('create_travel_menu'), icon: <CreateTravelIcon />, path: '/admin/create-travel' },
        { name: t('manage_cancellations'), icon: <CancelIcon />, path: '/admin/cancellations' }, 
        { name: t('profile'), icon: <ProfileIcon />, path: '/admin/profile' },
        { name: t('settings'), icon: <SettingsIcon />, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    return (
        <aside className="w-64 bg-primary-blue dark:bg-gray-800 text-white flex-shrink-0 flex flex-col p-4">
            <div className="text-xl font-bold text-center py-4 border-b border-blue-500/50">
                Admin Panel
            </div>
            <nav className="flex-grow mt-6 space-y-2">
                {menuItems.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/admin/dashboard'}
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        {item.icon}
                        <span className="font-semibold">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 mt-auto border-t border-blue-500/50">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-red-400 hover:bg-red-500/20 hover:text-white transition-colors duration-200"
                >
                    <LogoutIcon />
                    <span className="font-semibold">{t('logout')}</span>
                </button>
            </div>
        </aside>
    );
};

const AdminLayout = () => {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const res = await api.get('/api/profile/');
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch admin profile", error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);
    
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet context={{ user, onProfileUpdate: fetchUser }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;