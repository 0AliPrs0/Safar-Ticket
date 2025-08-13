import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from './LoadingIndicator';

const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 14v4"/><path d="M4 14h2.5"/><path d="M17.5 14H20"/><path d="M15 9.35a5 5 0 0 0-6 0"/></svg>;
const ReportIconHeader = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

export function ReportModal({ isOpen, onClose, ticketId, onReportSubmitted }) {
    const { t } = useTranslation();
    const [category, setCategory] = useState('payment_issue');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/report-ticket/', {
                ticket_id: ticketId,
                report_category: category,
                report_text: text
            });
            onReportSubmitted();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to submit report.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <ReportIconHeader className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-primary-blue dark:text-white">{t('report_issue')}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 text-start">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-secondary-blue">
                            <option value="payment_issue">Payment Issue</option>
                            <option value="travel_delay">Travel Delay</option>
                            <option value="unexpected_cancellation">Unexpected Cancellation</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                        <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows="5" className="mt-1 w-full px-4 py-3 font-sans border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-secondary-blue" placeholder="Please describe the issue in detail..." required></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600">{t('cancel')}</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-primary-blue text-white font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                            {loading ? <LoadingIndicator small /> : t('submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function ViewReportModal({ isOpen, onClose, reportData }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary-blue dark:text-white">Report Details</h3>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-600">{t('cancel')}</button>
                </div>
                <div className="space-y-6 text-start">
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                            <p className="font-semibold">{reportData.report_category.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className={`px-3 py-1 text-sm font-bold rounded-full capitalize ${statusClasses[reportData.status.toLowerCase()] || ''}`}>{reportData.status}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><UserIcon className="text-gray-500 dark:text-gray-400" /></div>
                        <div className="flex-1 min-w-0">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="font-bold text-gray-800 dark:text-gray-200">Your Report</p>
                                <p className="text-gray-700 dark:text-gray-300 mt-1 break-words">{reportData.report_text}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{new Date(reportData.report_time).toLocaleString()}</p>
                        </div>
                    </div>

                    {reportData.status === 'reviewed' && (
                         <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0"><SupportIcon className="text-primary-blue" /></div>
                            <div className="flex-1 min-w-0">
                                <div className="bg-blue-50 dark:bg-gray-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <p className="font-bold text-primary-blue dark:text-secondary-blue">Support Response</p>
                                    <p className="text-gray-800 dark:text-gray-300 mt-1 break-words">{reportData.report_response || "No response text provided."}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}