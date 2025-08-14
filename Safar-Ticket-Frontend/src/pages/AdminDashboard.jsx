import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Icon Components ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const BookingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;

// --- StatCard Component (Professional Style) ---
const StatCard = ({ title, value, icon, linkTo, iconColorClass, borderColorClass }) => {
    return (
        <Link to={linkTo}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-s-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-gray-700 ${borderColorClass}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">{title}</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                    </div>
                    <div className={`text-4xl ${iconColorClass}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </Link>
    );
};

// --- SalesChart Component ---
const SalesChart = ({ chartData }) => {
    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Sales ($)',
                data: chartData.data,
                fill: true,
                backgroundColor: 'rgba(66, 165, 245, 0.2)',
                borderColor: '#42A5F5',
                tension: 0.4,
                pointBackgroundColor: '#42A5F5',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#42A5F5'
            },
        ],
    };
    const options = { responsive: true, maintainAspectRatio: false };
    return <div style={{height: '350px'}} dir="ltr"><Line data={data} options={options} /></div>;
};

// --- Main Dashboard Component ---
function AdminDashboard() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get('/api/admin/stats/'),
                    api.get('/api/admin/stats/sales-chart/')
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">{t('admin_dashboard')}</h1>
            
            {loading ? ( <LoadingIndicator /> ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <StatCard 
                            title={t('total_users')}
                            value={stats?.total_users ?? 0} 
                            icon={<UsersIcon />} 
                            linkTo="/admin/users"
                            iconColorClass="text-blue-500"
                            borderColorClass="border-blue-500"
                        />
                        <StatCard 
                            title={t('bookings_today')}
                            value={stats?.bookings_today ?? 0} 
                            icon={<BookingsIcon />} 
                            linkTo="/admin/bookings"
                            iconColorClass="text-green-500"
                            borderColorClass="border-green-500"
                        />
                        <StatCard 
                            title={t('pending_cancellations')}
                            value={stats?.pending_cancellations ?? 0} 
                            icon={<CancelIcon />} 
                            linkTo="/admin/cancellations"
                            iconColorClass="text-orange-500"
                            borderColorClass="border-orange-500"
                        />
                        <StatCard 
                            title={t('open_reports')}
                            value={stats?.open_reports ?? 0} 
                            icon={<ReportIcon />} 
                            linkTo="/admin/reports"
                            iconColorClass="text-red-500"
                            borderColorClass="border-red-500"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-4">{t('sales_chart_30_days')}</h3>
                        {chartData ? <SalesChart chartData={chartData} /> : <LoadingIndicator />}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;