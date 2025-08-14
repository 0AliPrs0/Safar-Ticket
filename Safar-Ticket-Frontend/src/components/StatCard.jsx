import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, linkTo, colorClass = 'bg-blue-500' }) => {
    const cardContent = (
        <div className={`p-6 rounded-lg shadow-lg text-white transition-transform hover:scale-105 ${colorClass}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="text-4xl font-extrabold">{value}</p>
                </div>
                <div className="text-4xl opacity-80">
                    {icon}
                </div>
            </div>
        </div>
    );

    return linkTo ? <Link to={linkTo}>{cardContent}</Link> : <div>{cardContent}</div>;
};

export default StatCard;