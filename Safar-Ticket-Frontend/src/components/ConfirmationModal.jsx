import React from 'react';

const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

function ConfirmationModal({ isOpen, onClose, onConfirm, title, children, confirmText = "Confirm", loading = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                    <AlertIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
                
                <div className="text-gray-600 dark:text-gray-300 mt-2 mb-6 min-h-[80px]">
                    {children}
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading || !children} className="w-full py-2 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;