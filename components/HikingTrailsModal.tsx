
import React, { useState, useEffect } from 'react';
import type { KomootRoute } from '../types';
import LoadingSpinner from './LoadingSpinner';

// --- Helper Functions ---
const formatDistance = (meters: number): string => {
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

// --- Details Modal ---
const TrailDetailsModal: React.FC<{
    trail: KomootRoute;
    onClose: () => void;
}> = ({ trail, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {trail.gallery && trail.gallery.length > 0 ? (
                    <div className="w-full h-64 bg-black/10 overflow-x-auto snap-x snap-mandatory flex-shrink-0 flex">
                        {trail.gallery.map((img, index) => (
                            <img key={index} src={img.src} alt={`View of ${trail.title}`} className="w-full h-full object-cover snap-center flex-shrink-0" />
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-64 bg-black/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
                <div className="p-6 flex-grow overflow-y-auto">
                    <h2 className="text-2xl font-bold text-primary">{trail.title}</h2>
                    <p className="mt-4 text-secondary">{trail.summary}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <a
                        href={trail.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-5 py-3 glass-button-primary"
                    >
                        View on Komoot
                    </a>
                    <button onClick={onClose} className="w-full sm:w-auto px-5 py-2 glass-button-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Trail Card ---
const TrailCard: React.FC<{ trail: KomootRoute, onClick: () => void }> = ({ trail, onClick }) => (
    <button onClick={onClick} className="glass-pane overflow-hidden text-left w-full transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <img src={trail.gallery?.[0]?.src || 'https://images.unsplash.com/photo-1454982523318-4b6396f39d3a?q=80&w=800&auto=format&fit=crop'} alt={trail.title} className="w-full h-48 object-cover bg-black/10"/>
        <div className="p-4">
            <h3 className="text-xl font-bold text-primary">{trail.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-secondary">
                <span className="font-semibold">Distance: <span className="text-primary">{formatDistance(trail.distance)}</span></span>
                <span className="font-semibold">Duration: <span className="text-primary">{formatDuration(trail.duration)}</span></span>
                <span className="font-semibold">Difficulty: <span className="text-primary capitalize">{trail.difficulty}</span></span>
            </div>
        </div>
    </button>
);


// --- Main Modal ---
interface HikingTrailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    routes: KomootRoute[];
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

const HikingTrailsModal: React.FC<HikingTrailsModalProps> = ({ isOpen, onClose, routes, isLoading, error, clearError }) => {
    const [selectedTrail, setSelectedTrail] = useState<KomootRoute | null>(null);

    // Reset local state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSelectedTrail(null);
                clearError();
            }, 300); // allow for animation
        }
    }, [isOpen, clearError]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="bg-app/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-primary">Nearby Hiking Trails</h2>
                        <button onClick={onClose} aria-label="Close" className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </header>
                    <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <LoadingSpinner />
                                <p className="mt-4 text-2xl">🌲⛰️🚴</p>
                                <p className="mt-2 text-secondary">Finding the best trails...</p>
                            </div>
                        )}
                        {error && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <p className="text-red-500 font-semibold">An Error Occurred</p>
                                <p className="text-secondary mt-2">{error}</p>
                                <button onClick={onClose} className="mt-6 glass-button-secondary px-6 py-2">Close</button>
                            </div>
                        )}
                        {!isLoading && !error && routes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <p className="text-lg font-semibold text-primary">No Trails Found</p>
                                <p className="text-secondary mt-2">Could not find any hiking trails in this area. Try searching in a different location.</p>
                            </div>
                        )}
                        {!isLoading && !error && routes.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {routes.map(route => (
                                    <TrailCard key={route.id} trail={route} onClick={() => setSelectedTrail(route)} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {selectedTrail && (
                <TrailDetailsModal
                    trail={selectedTrail}
                    onClose={() => setSelectedTrail(null)}
                />
            )}
        </>
    );
};

export default HikingTrailsModal;