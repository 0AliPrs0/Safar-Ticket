import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification';

// --- Icon Components ---
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><path d="M12 14v4"/><path d="M4 14h2.5"/><path d="M17.5 14H20"/><path d="M15 9.35a5 5 0 0 0-6 0"/></svg>;
const ReportIconHeader = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;


function AdminReports() {
    const { t, i18n } = useTranslation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/reports/');
            setReports(res.data);
        } catch (error) {
            setNotification({ message: 'Failed to fetch reports.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (selectedReport) {
            setResponseText(selectedReport.report_response || '');
        }
    }, [selectedReport]);
    
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/api/review-report/', {
                report_id: selectedReport.report_id,
                report_response: responseText
            });
            setNotification({ message: 'Response submitted successfully!', type: 'success' });
            setSelectedReport(null);
            setResponseText('');
            fetchReports();
        } catch (error) {
            setNotification({ message: 'Failed to submit response.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const ReportListItem = ({ report }) => {
        const isActive = selectedReport?.report_id === report.report_id;
        return (
            <div 
                onClick={() => setSelectedReport(report)} 
                className={`p-4 border-s-4 rounded-e-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                        ? 'bg-blue-50 dark:bg-gray-700 border-primary-blue' 
                        : `border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 ${report.status === 'pending' ? 'dark:bg-gray-800' : 'dark:bg-gray-800/50'}`
                }`}
            >
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{report.report_category.replace('_', ' ')}</p>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${report.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                        {report.status}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{report.user_email}</p>
            </div>
        );
    };

    return (
        <div>
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: '' })} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('manage_reports')}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1 md:border-e dark:border-gray-700 p-4 space-y-2">
                        {loading ? <LoadingIndicator /> : reports.map(report => <ReportListItem key={report.report_id} report={report} />)}
                    </div>
                    <div className="md:col-span-2 p-6">
                        {selectedReport ? (
                            <div className="text-start">
                                <div className="pb-4 border-b dark:border-gray-600 mb-4">
                                    <h3 className="text-xl font-semibold mb-1">{selectedReport.report_category.replace('_', ' ')}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('report_from')}: <span className="font-medium text-primary-blue dark:text-secondary-blue">{selectedReport.user_email}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t('reported_at')}: {new Date(selectedReport.report_time).toLocaleString(i18n.language.startsWith('fa') ? 'fa-IR' : 'en-US')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('user_report')}:</p>
                                    <p className="text-gray-800 dark:text-gray-200">{selectedReport.report_text}</p>
                                </div>
                                
                                {selectedReport.status === 'pending' ? (
                                    <form onSubmit={handleReviewSubmit}>
                                        <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">{t('your_response')}:</label>
                                        <textarea 
                                            value={responseText} 
                                            onChange={(e) => setResponseText(e.target.value)}
                                            rows="5"
                                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-blue"
                                            placeholder="Write your response here..."
                                            required
                                        />
                                        <button type="submit" disabled={isSubmitting} className="mt-4 w-full bg-primary-blue text-white py-2 rounded-lg font-semibold hover:bg-opacity-90">
                                            {isSubmitting ? t('loading') : t('submit_response')}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                        <p className="font-semibold text-green-800 dark:text-green-300">{t('response_sent')}:</p>
                                        <p className="text-gray-800 dark:text-gray-200 mt-1">{selectedReport.report_response}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <ReportIcon className="w-16 h-16 opacity-50 mb-4" />
                                <p>{t('select_report_prompt')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminReports;