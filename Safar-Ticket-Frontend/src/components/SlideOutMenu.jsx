import React from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TicketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

function SlideOutMenu({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Profile', icon: <UserCircleIcon />, path: '/profile' },
    { name: 'My Bookings', icon: <TicketIcon />, path: '/bookings' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      
      {/* Menu */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6">
            <div className="text-center pb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-light-bg rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-primary-blue">
                     <UserCircleIcon />
                </div>
                <h2 className="font-bold text-xl text-dark-text">{user.first_name} {user.last_name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <nav className="space-y-2 flex-grow mt-6">
                {menuItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => { navigate(item.path); onClose(); }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-gray-600 hover:bg-light-bg hover:text-primary-blue transition-colors duration-200"
                    >
                        {item.icon}
                        <span className="font-semibold">{item.name}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                    onClick={() => { navigate('/logout'); onClose(); }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-lg text-red-500 hover:bg-red-50 transition-colors duration-200"
                >
                    <LogoutIcon />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </div>
      </aside>
    </>
  );
}

export default SlideOutMenu;