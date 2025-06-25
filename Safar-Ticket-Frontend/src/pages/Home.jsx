import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/logout');
    };

    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-[#0D47A1]">
                    ✈️ SafarTicket
                </div>
                <div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
}

function Home() {
    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Header />
            <main className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Welcome to SafarTicket!</h1>
                <p className="text-lg text-gray-600 mb-8">You are successfully logged in. Start planning your next journey!</p>
                <div className="max-w-2xl mx-auto">
                    {/* در اینجا می‌توانید کامپوننت جستجو یا داشبورد کاربر را قرار دهید */}
                    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-semibold text-[#0D47A1] mb-6">Dashboard</h2>
                        <p className="text-gray-500">Your recent bookings and travel information will appear here.</p>
                        <button className="mt-6 bg-[#FFA726] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
                            Search for a New Trip
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
