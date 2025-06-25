import React from 'react';

function AuthFormContainer({ title, children }) {
  return (
    <div className="min-h-screen bg-light-bg flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue">
            ✈️ SafarTicket
          </h1>
          <p className="text-xl text-gray-600 mt-2">{title}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthFormContainer;