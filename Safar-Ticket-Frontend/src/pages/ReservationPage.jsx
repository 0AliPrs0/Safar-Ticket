import React from 'react';
import { useParams, Link } from 'react-router-dom';

function ReservationPage() {
    const { travelId } = useParams();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
            <div className="bg-white p-12 rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold text-primary-blue mb-4">Reservation Page</h1>
                <p className="text-lg text-gray-700">
                    This is the placeholder reservation page for Travel ID: <strong className="font-mono text-accent-orange bg-gray-100 px-2 py-1 rounded">{travelId}</strong>
                </p>
                <p className="mt-4 text-gray-500">
                    The actual reservation form will be implemented here.
                </p>
                <Link to="/" className="mt-8 inline-block bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default ReservationPage;