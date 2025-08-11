import React from 'react';

const Seat = ({ seat, status, onSelect }) => {
    const isAvailable = status === 'available';
    const isSelected = status === 'selected';
    const isOccupied = status === 'occupied';

    const baseClasses = "w-10 h-10 rounded-t-lg flex items-center justify-center font-bold text-xs border-b-4 transition-all duration-200 relative";
    
    let statusClasses = "";
    if (isOccupied) {
        statusClasses = "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed";
    } else if (isSelected) {
        statusClasses = "bg-secondary-blue border-primary-blue text-white cursor-pointer shadow-lg transform scale-110";
    } else {
        statusClasses = "bg-green-200 border-green-400 text-green-800 cursor-pointer hover:bg-green-300";
    }

    return (
        <div 
            className={`${baseClasses} ${statusClasses}`} 
            onClick={() => (isAvailable || isSelected) && onSelect(seat.seat_number)}
            title={`Seat ${seat.seat_number}`}
        >
            <span className="z-10">{seat.seat_number}</span>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-black opacity-5 rounded-t-lg"></div>
        </div>
    );
};

export default Seat;