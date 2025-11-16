
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ActiveCabRide, TourPackage, VehicleType, PermitRequest } from '../types';

// --- Vehicle data for display ---
const VEHICLE_RATES: Record<VehicleType, { name: string, rate: number, icon: React.ReactElement }> = {
    bike: { name: 'Bike', rate: 30, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM3 9a1 1 0 000 2h1.5a1 1 0 100-2H3zM7 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V3zM8.5 9a1 1 0 10-2 0v1a1 1 0 102 0V9zM12 5a1 1 0 10-2 0v1a1 1 0 102 0V5zM11 11a1 1 0 102 0v-1a1 1 0 10-2 0v1zM15 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1 1 0 01-1-1V3zM16.5 9a1 1 0 10-2 0v1a1 1 0 102 0V9z" /></svg> },
    rickshaw: { name: 'Rickshaw', rate: 50, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-1 0V3H6v1.5a.5.5 0 01-1 0v-2zM6.5 6A.5.5 0 006 6.5v2a.5.5 0 001 0V7h.5a.5.5 0 000-1H7v-.5A.5.5 0 006.5 6zM5 10.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM7.5 14a.5.5 0 00-1 0v1.5a.5.5 0 001 0V14z" clipRule="evenodd" /><path d="M4.152 16.34a1.5 1.5 0 001.037.525h4.622a1.5 1.5 0 001.037-.525l2-2.333a1.5 1.5 0 000-2.335l-2-2.333a1.5 1.5 0 00-1.037-.525H5.189a1.5 1.5 0 00-1.037.525l-2 2.333a1.5 1.5 0 000 2.335l2 2.333zM5.56 14.58l-1.68-1.96a.5.5 0 010-.773l1.68-1.96a.5.5 0 01.346-.175h4.622a.5.5 0 01.346.175l1.68 1.96a.5.5 0 010 .773l-1.68 1.96a.5.5 0 01-.346-.175H5.905a.5.5 0 01-.346-.175z" /></svg> },
    car: { name: 'Car', rate: 70, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm1 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 00-1-1H6zm9-1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V6a1 1 0 011-1h1zM5 11a1 1 0 100 2h10a1 1 0 100-2H5z" clipRule="evenodd" /></svg> },
    ac_car: { name: 'AC Car', rate: 90, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M11.917 12.083c.354.12.72.188 1.083.188a3.75 3.75 0 003.75-3.75V8.5a.75.75 0 00-1.5 0v.188a2.25 2.25 0 01-2.25 2.25c-.363 0-.712-.068-1.038-.188a.75.75 0 00-.812 1.333zM8.083 12.083a.75.75 0 00-.812-1.333C6.917 10.63 6.568 10.562 6.25 10.562a2.25 2.25 0 01-2.25-2.25V8.5a.75.75 0 00-1.5 0v.188a3.75 3.75 0 003.75 3.75c.363 0 .729-.068 1.083-.188z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" /></svg> },
};

// --- New Ride Tracking Component ---
const ActiveRideDisplay: React.FC<{ ride: ActiveCabRide, onCancel: () => void, onRideArrived: () => void }> = ({ ride, onCancel, onRideArrived }) => {
    const calculateRemainingSeconds = useCallback(() => {
        const totalDurationSeconds = ride.etaMinutes * 60;
        if (!ride.bookingTimestamp) return totalDurationSeconds;
        const elapsedSeconds = (Date.now() - ride.bookingTimestamp) / 1000;
        return Math.max(0, totalDurationSeconds - elapsedSeconds);
    }, [ride.etaMinutes, ride.bookingTimestamp]);

    const [timeLeft, setTimeLeft] = useState(calculateRemainingSeconds);
    const hasArrived = useRef(false);

    useEffect(() => {
        hasArrived.current = false; // Reset on new ride

        const timer = setInterval(() => {
            const remaining = calculateRemainingSeconds();
            setTimeLeft(remaining);

            if (remaining === 0 && !hasArrived.current && ride.bookingTimestamp) {
                hasArrived.current = true;
                onRideArrived();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [ride, calculateRemainingSeconds, onRideArrived]);


    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    const totalDurationSeconds = ride.etaMinutes * 60;
    const progress = totalDurationSeconds > 0 ? (1 - (timeLeft / totalDurationSeconds)) * 100 : 100;


    return (
        <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
            <p className="font-bold text-lg mb-4 text-primary">Your ride is on its way!</p>
            
            <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                    <p className="text-secondary text-sm">Arriving in</p>
                    <div className="text-3xl font-extrabold text-[color:var(--accent-color)]">
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </div>
                </div>

                <div className="w-full">
                    <div className="relative h-12">
                        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full -translate-y-1/2"></div>
                        <div style={{ width: `${progress}%` }} className="absolute top-1/2 left-0 h-1.5 bg-[color:var(--accent-color)] rounded-full -translate-y-1/2 transition-all duration-1000 ease-linear"></div>
                        <div className="absolute top-1/2 -translate-y-1/2 text-[color:var(--accent-color)]" style={{ left: `calc(${progress}% - 12px)` }}>
                            <div className="w-6 h-6">{VEHICLE_RATES[ride.vehicle].icon}</div>
                        </div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-sm space-y-2 mt-4">
                <div className="flex justify-between">
                    <span className="text-secondary">To:</span>
                    <span className="font-semibold truncate max-w-[70%]">{ride.destination}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-secondary">Fare:</span>
                    <span className="font-semibold">PKR {ride.fare.toLocaleString()}</span>
                </div>
            </div>
            
            <button onClick={onCancel} className="mt-4 w-full px-5 py-2 font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 transition-transform">
                Cancel Ride
            </button>
        </div>
    );
}

interface MyActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCabRide: ActiveCabRide | null;
  activeTourPackage: TourPackage | null;
  visitedPlaces: string[];
  permitRequests: PermitRequest[];
  onCancelRide: () => void;
  onRideArrived: () => void;
  onCancelPermitRequest: (id: number) => void;
}

const MyActivityModal: React.FC<MyActivityModalProps> = ({ isOpen, onClose, activeCabRide, activeTourPackage, visitedPlaces, permitRequests, onCancelRide, onRideArrived, onCancelPermitRequest }) => {
  const [isRendering, setIsRendering] = useState(isOpen);

  useEffect(() => {
      if (isOpen) {
          setIsRendering(true);
      } else {
          setTimeout(() => setIsRendering(false), 400);
      }
  }, [isOpen]);
  
  if (!isRendering) return null;
  
  const hasActivity = activeCabRide || activeTourPackage || visitedPlaces.length > 0 || permitRequests.length > 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
    >
      <div
        className={`glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
          <h2 id="activity-modal-title" className="text-xl font-bold text-primary">My Activity</h2>
          <button
            onClick={onClose}
            aria-label="Close activity"
            className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="flex-grow overflow-y-auto p-6 space-y-6">
          {!hasActivity ? (
             <div className="text-center py-10">
                <p className="text-secondary">You have no current activity.</p>
                <p className="text-sm text-secondary">Book a ride or mark a place as visited to see it here.</p>
            </div>
          ) : (
            <>
              {permitRequests.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-primary mb-3">Permit Requests</h3>
                    <ul className="space-y-3">
                        {permitRequests.map(req => (
                            <li key={req.id} className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl flex justify-between items-center gap-4">
                                <div>
                                    <p className="font-bold text-primary">{req.siteName}</p>
                                    <p className="text-sm text-yellow-500 font-semibold">Pending for Approval</p>
                                    <p className="text-xs text-secondary mt-1">
                                        Submitted: {new Date(req.submissionTimestamp).toLocaleString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => onCancelPermitRequest(req.id)}
                                    className="px-3 py-1 text-sm font-semibold text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 flex-shrink-0"
                                >
                                    Cancel
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
              )}
              {(activeCabRide || activeTourPackage) && (
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-3">Active Bookings</h3>
                  <div className="space-y-4">
                    {activeCabRide && (
                      <ActiveRideDisplay ride={activeCabRide} onCancel={onCancelRide} onRideArrived={onRideArrived} />
                    )}
                    {activeTourPackage && (
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                        <p className="font-bold">Booked Tour</p>
                        <p className="text-sm text-secondary">{activeTourPackage.title}</p>
                         <p className="text-sm text-secondary">with {activeTourPackage.agency}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
              
              {visitedPlaces.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-3">My Visited Places</h3>
                   <ul className="space-y-2">
                    {visitedPlaces.map(placeTitle => (
                      <li key={placeTitle} className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                         <span className="text-primary">{placeTitle}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>

        <footer className="p-4 bg-black/5 dark:bg-white/5 flex-shrink-0 flex justify-end">
            <button
                onClick={onClose}
                className="px-5 py-2 glass-button-secondary"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default MyActivityModal;
