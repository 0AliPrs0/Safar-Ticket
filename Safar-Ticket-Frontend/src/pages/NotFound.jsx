import React from 'react';
import { Link } from 'react-router-dom';

const LostLuggageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#42A5F5] mx-auto mb-6">
        <path d="M22 18H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.5a1 1 0 0 0 .8-.4L8 2.3a1 1 0 0 1 1.6 0l2.7 3.3a1 1 0 0 0 .8.4H16a2 2 0 0 1 2 2v2"></path>
        <path d="M8 18V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"></path>
        <path d="M14 22v-2a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
        <path d="m19 20-3-3"></path>
        <path d="m16 20 3-3"></path>
    </svg>
);


function NotFound() {
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center text-center p-6">
            <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full">
                <LostLuggageIcon />
                <h1 className="text-6xl font-extrabold text-[#0D47A1] mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-[#212529] mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    Oops! It seems you've taken a wrong turn. The page you're looking for doesn't exist.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-[#FFA726] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Return to Homepage
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
