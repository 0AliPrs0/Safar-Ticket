import React from 'react';
import ThemeToggle from './ThemeToggle';

function AuthFormContainer({ title, children }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0D47A1] dark:text-white">
            ✈️ SafarTicket
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">{title}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthFormContainer;