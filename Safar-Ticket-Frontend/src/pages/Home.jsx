import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);


function Header() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                <div 
                    className="text-2xl font-bold text-[#0D47A1] cursor-pointer"
                    onClick={() => handleNavigation('/')}
                >
                    ✈️ SafarTicket
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center gap-2 text-[#333] font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Edit Profile"
                    >
                        <UserIcon />
                        <span className="hidden md:inline">Profile</span>
                    </button>
                    <button 
                        onClick={() => handleNavigation('/logout')}
                        className="flex items-center gap-2 bg-red-50 text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Logout"
                    >
                        <LogoutIcon />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </nav>
        </header>
    );
}

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Header />
            <main className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-[#212529] mb-4">Welcome to SafarTicket!</h1>
                <p className="text-lg text-gray-600 mb-8">You are successfully logged in. Start planning your next journey!</p>
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-left">
                        <h2 className="text-2xl font-semibold text-[#0D47A1] mb-6">Your Dashboard</h2>
                        <p className="text-gray-500 mb-6">Your recent bookings and travel information will appear here. Ready to explore new destinations?</p>
                        <button 
                            onClick={() => alert("Search functionality to be implemented!")}
                            className="mt-2 bg-[#FFA726] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Search for a New Trip
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
