import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";

// ایمپورت کردن مستقیم فایل‌های انیمیشن از پوشه src/assets/animations
import planeAnimationData from '../assets/animations/plane.json';
import trainAnimationData from '../assets/animations/train.json';
import busAnimationData from '../assets/animations/bus.json';


// --- آیکون‌ها ---
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 2"/></svg>;

const ExpandedTicket = ({ ticket, onReserve }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const formatTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A';
    
    // تابعی برای برگرداندن دیتای انیمیشن ایمپورت شده
    const getAnimationData = (transportType) => {
        switch (transportType) {
            case 'plane':
                return planeAnimationData;
            case 'train':
                return trainAnimationData;
            case 'bus':
                return busAnimationData;
            default:
                return planeAnimationData; 
        }
    };
    
    const facilitiesList = ticket.facilities ? Object.entries(ticket.facilities)
        .map(([key, value]) => {
            if (value === true) return key.replace(/_/g, ' ');
            if (typeof value === 'string' && value.toLowerCase() !== 'none') return `${key.replace(/_/g, ' ')}: ${value}`;
            return null;
        }).filter(Boolean) : [];

    return (
        <div className="bg-gradient-to-br from-primary-blue to-blue-700 text-white rounded-xl shadow-2xl overflow-hidden my-4 border-t-4 border-accent-orange">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-2xl font-bold">{ticket.transport_company_name}</p>
                        <p className="text-sm opacity-80">{ticket.transport_type ? ticket.transport_type.charAt(0).toUpperCase() + ticket.transport_type.slice(1) : ''}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-extrabold">${ticket.price}</p>
                        <p className="text-xs opacity-70">Per Person</p>
                    </div>
                </div>

                <div className="grid grid-cols-5 items-center text-center my-8">
                    <div className="col-span-2 flex flex-col items-center">
                        <p className="text-3xl font-bold">{ticket.departure_city}</p>
                        <p className="text-lg text-secondary-blue font-semibold mt-1">Departure</p>
                        <div className="mt-4 space-y-2 text-left">
                            <div className="flex items-center gap-2"><CalendarIcon /><p>{formatDate(ticket.departure_time)}</p></div>
                            <div className="flex items-center gap-2 mt-2"><ClockIcon /><p className="font-mono text-xl">{formatTime(ticket.departure_time)}</p></div>
                        </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                        {/* استفاده از کامپوننت جدید Lottie */}
                        <Lottie 
                            animationData={getAnimationData(ticket.transport_type)}
                            loop={true}
                            style={{ width: '150px', height: '150px' }}
                        />
                    </div>
                    <div className="col-span-2 flex flex-col items-center">
                        <p className="text-3xl font-bold">{ticket.destination_city}</p>
                        <p className="text-lg text-secondary-blue font-semibold mt-1">Arrival</p>
                        <div className="mt-4 space-y-2 text-left">
                            <div className="flex items-center gap-2"><CalendarIcon /><p>{formatDate(ticket.arrival_time)}</p></div>
                            <div className="flex items-center gap-2 mt-2"><ClockIcon /><p className="font-mono text-xl">{formatTime(ticket.arrival_time)}</p></div>
                        </div>
                    </div>
                </div>

                {ticket.is_round_trip && ticket.return_time ? (
                    <div className="bg-white/10 p-4 rounded-lg mt-4 text-center">
                        <p className="font-bold text-lg text-secondary-blue">Return Date</p>
                        <p className="text-2xl mt-2">{formatDate(ticket.return_time)}</p>
                    </div>
                ) : null}
                
                {facilitiesList.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/20">
                        <h4 className="font-bold text-secondary-blue mb-3">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                            {facilitiesList.map(facility => (
                                <span key={facility} className="bg-white/20 text-white text-xs font-semibold capitalize px-3 py-1 rounded-full flex items-center gap-1">
                                    <TagIcon />
                                    {facility}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-black/20 p-4 flex justify-end">
                <button 
                    onClick={() => onReserve(ticket.travel_id)}
                    className="bg-accent-orange text-white py-3 px-8 rounded-lg text-lg font-bold hover:bg-opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/30"
                >
                    Reserve Now
                </button>
            </div>
        </div>
    );
};

export default ExpandedTicket;