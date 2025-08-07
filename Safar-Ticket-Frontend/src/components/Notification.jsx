import React from 'react';

const SuccessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ErrorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

function Notification({ message, type, onClose }) {
    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
                </div>
                <h3 className={`text-xl font-bold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {isSuccess ? 'Success' : 'Error'}
                </h3>
                <p className="text-gray-600 mt-2 mb-6">{message}</p>
                <button 
                    onClick={onClose} 
                    className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition-colors ${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
}

export default Notification;
