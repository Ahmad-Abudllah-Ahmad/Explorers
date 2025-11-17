import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ActiveCabRide, TourPackage, VehicleType, PermitRequest, SpotifyTrack } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';

// --- Vehicle data for display ---
const VEHICLE_RATES: Record<VehicleType, { name: string, rate: number, icon: React.ReactElement }> = {
    bike: { name: 'Bike', rate: 30, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM3 9a1 1 0 000 2h1.5a1 1 0 100-2H3zM7 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V3zM8.5 9a1 1 0 10-2 0v1a1 1 0 102 0V9zM12 5a1 1 0 10-2 0v1a1 1 0 102 0V5zM11 11a1 1 0 102 0v-1a1 1 0 10-2 0v1zM15 3a1 1 0 011-1h1.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1 1 0 01-1-1V3zM16.5 9a1 1 0 10-2 0v1a1 1 0 102 0V9z" /></svg> },
    rickshaw: { name: 'Rickshaw', rate: 50, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-1 0V3H6v1.5a.5.5 0 01-1 0v-2zM6.5 6A.5.5 0 006 6.5v2a.5.5 0 001 0V7h.5a.5.5 0 000-1H7v-.5A.5.5 0 006.5 6zM5 10.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zM7.5 14a.5.5 0 00-1 0v1.5a.5.5 0 001 0V14z" clipRule="evenodd" /><path d="M4.152 16.34a1.5 1.5 0 001.037.525h4.622a1.5 1.5 0 001.037-.525l2-2.333a1.5 1.5 0 000-2.335l-2-2.333a1.5 1.5 0 00-1.037-.525H5.189a1.5 1.5 0 00-1.037.525l-2 2.333a1.5 1.5 0 000 2.335l2 2.333zM5.56 14.58l-1.68-1.96a.5.5 0 010-.773l1.68-1.96a.5.5 0 01.346-.175h4.622a.5.5 0 01.346.175l1.68 1.96a.5.5 0 010 .773l-1.68 1.96a.5.5 0 01-.346-.175H5.905a.5.5 0 01-.346-.175z" /></svg> },
    car: { name: 'Car', rate: 70, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm1 2a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V6a1 1 0 00-1-1H6zm9-1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V6a1 1 0 011-1h1zM5 11a1 1 0 100 2h10a1 1 0 100-2H5z" clipRule="evenodd" /></svg> },
    ac_car: { name: 'AC Car', rate: 90, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M11.917 12.083c.354.12.72.188 1.083.188a3.75 3.75 0 003.75-3.75V8.5a.75.75 0 00-1.5 0v.188a2.25 2.25 0 01-2.25 2.25c-.363 0-.712-.068-1.038-.188a.75.75 0 00-.812 1.333zM8.083 12.083a.75.75 0 00-.812-1.333C6.917 10.63 6.568 10.562 6.25 10.562a2.25 2.25 0 01-2.25-2.25V8.5a.75.75 0 00-1.5 0v.188a3.75 3.75 0 003.75 3.75c.363 0 .729-.068 1.083-.188z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" /></svg> },
};

const SPOTIFY_CLIENT_ID = 'baf679cb590441a3a7a086bc54c5a1f4';
const SPOTIFY_CLIENT_SECRET = '7cd7345ee8b949da9d3ffda8df494a5c';

// --- Music Player Component ---
const MusicPlayer: React.FC<{ onBack: () => void, onTrackPlay?: (track: SpotifyTrack, embedUrl: string) => void }> = ({ onBack, onTrackPlay }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Ready to search.');
    const [playerUrl, setPlayerUrl] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchWithRetry = useCallback(async (url: string, options: RequestInit, maxRetries = 3) => {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10) * 1000;
                    setStatusMessage(`Rate limit hit. Retrying in ${retryAfter / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter));
                    continue;
                }
                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status}. Details: ${JSON.stringify(errorBody)}`);
                }
                return response;
            } catch (error) {
                lastError = error;
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        console.error("Max retries reached. Last error:", lastError);
        setStatusMessage(`Search failed: ${lastError instanceof Error ? lastError.message : "Unknown error."}`);
        throw lastError;
    }, []);

    const getSpotifyToken = useCallback(async () => {
        if (accessToken && Date.now() < tokenExpiry) {
            return accessToken;
        }

        setStatusMessage('Authenticating with Spotify...');
        const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials'
        };

        try {
            const response = await fetchWithRetry('https://accounts.spotify.com/api/token', options);
            const data = await response.json();

            if (data.access_token) {
                setAccessToken(data.access_token);
                setTokenExpiry(Date.now() + (data.expires_in * 1000) - 60000);
                setStatusMessage('Ready to search.');
                return data.access_token;
            } else {
                throw new Error('Failed to retrieve access token.');
            }
        } catch (error) {
            console.error('Token generation error:', error);
            setStatusMessage('Authentication failed. Check Client ID and Secret.');
            throw error;
        }
    }, [accessToken, tokenExpiry, fetchWithRetry]);

    const searchTracks = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoading(true);
        setStatusMessage(`Searching for "${query}"...`);
        try {
            const token = await getSpotifyToken();
            const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=30`;
            const options = {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            };
            const response = await fetchWithRetry(url, options);
            const data = await response.json();
            setSearchResults(data.tracks.items);
            setStatusMessage(`Found ${data.tracks.items.length} tracks for "${query}".`);
        } catch (error) {
            console.error('Search error:', error);
            setStatusMessage('Search failed. See console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [getSpotifyToken, fetchWithRetry]);
    
    useEffect(() => {
        searchTracks(debouncedSearch);
    }, [debouncedSearch, searchTracks]);

    useEffect(() => {
        getSpotifyToken().catch(e => {
            // Error is handled inside getSpotifyToken
        });
    }, [getSpotifyToken]);

    const loadTrackInPlayer = (track: SpotifyTrack) => {
        const artistNames = track.artists.map(artist => artist.name).join(', ');
        const embedUrl = `https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`;
        setPlayerUrl(embedUrl);
        setStatusMessage(`Now loaded: "${track.name}" by ${artistNames}.`);
        
        // Notify the persistent player
        if (onTrackPlay) {
            onTrackPlay(track, embedUrl);
        }
    };

    return (
        <div className="p-6 text-center flex flex-col justify-start items-center flex-grow min-h-0">
            <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
                <button onClick={onBack} className="p-2 glass-button-secondary !rounded-full !w-10 !h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <h3 className="text-lg font-bold text-primary">In-Ride Music</h3>
                <div className="w-10"></div>
            </div>

            <div className="mb-4 p-3 bg-red-800/50 border border-red-600 rounded-lg text-sm text-red-300">
                {/* Security alert removed as requested */}
            </div>

            {playerUrl && (
                <div className="w-full glass-pane p-2 rounded-xl mb-4">
                    <iframe id="dedicated-player-iframe" src={playerUrl} width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-lg"></iframe>
                </div>
            )}

            <div className="w-full glass-pane p-4 rounded-xl mb-4">
                <div className="flex gap-2">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search for a song or artist..."
                        className="w-full flex-grow px-4 py-2 glass-input text-primary placeholder:text-secondary !rounded-lg"
                    />
                </div>
                <p className="text-sm mt-2 text-secondary text-left">{statusMessage}</p>
            </div>
            
            <div className="w-full flex-grow overflow-y-auto space-y-2">
                {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {!isLoading && searchResults.length === 0 && (
                    <div className="text-center text-secondary pt-10">
                        <p>Use the search bar above to find your music!</p>
                    </div>
                )}
                {!isLoading && searchResults.map(track => {
                    const artistNames = track.artists.map(artist => artist.name).join(', ');
                    const albumArt = track.album.images.length > 0 ? track.album.images.reduce((a, b) => (Math.abs(a.width - 64) < Math.abs(b.width - 64) ? a : b)).url : '';

                    return (
                        <div key={track.id} onClick={() => loadTrackInPlayer(track)} className="p-3 rounded-lg flex items-center gap-4 cursor-pointer transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                            <img src={albumArt} alt={`${track.album.name} album art`} className="w-12 h-12 rounded object-cover bg-black/10" />
                            <div className="flex-grow min-w-0 text-left">
                                <p className="text-primary font-semibold truncate">{track.name}</p>
                                <p className="text-sm text-[#1DB954] truncate">{artistNames}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- New Ride Tracking Component ---
const ActiveRideDisplay: React.FC<{ ride: ActiveCabRide, onCancel: () => void, onRideArrived: () => void, onPlayMusic: () => void }> = ({ ride, onCancel, onRideArrived, onPlayMusic }) => {
    const calculateRemainingSeconds = useCallback(() => {
        const totalDurationSeconds = ride.etaMinutes * 60;
        if (!ride.bookingTimestamp) return totalDurationSeconds;
        const elapsedSeconds = (Date.now() - ride.bookingTimestamp) / 1000;
        return Math.max(0, totalDurationSeconds - elapsedSeconds);
    }, [ride.etaMinutes, ride.bookingTimestamp]);

    const [timeLeft, setTimeLeft] = useState(calculateRemainingSeconds);

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = calculateRemainingSeconds();
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(timer);
    }, [ride, calculateRemainingSeconds]);

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
            
            <div className="flex gap-2 mt-4">
                <button onClick={onPlayMusic} className="flex-1 px-3 py-2 font-semibold text-white bg-[color:var(--accent-color)] rounded-xl hover:opacity-90 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3s3-1.343 3-3V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 1.343-3 3s1.343 3 3 3s3-1.343 3-3V4a1 1 0 00-.804-.98z" /></svg>
                    Play Music
                </button>
                <button onClick={onCancel} className="flex-1 px-3 py-2 font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 transition-transform">
                    Cancel Ride
                </button>
            </div>
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
  onTrackPlay?: (track: SpotifyTrack, embedUrl: string) => void;
}

const MyActivityModal: React.FC<MyActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  activeCabRide, 
  activeTourPackage, 
  visitedPlaces, 
  permitRequests, 
  onCancelRide, 
  onRideArrived, 
  onCancelPermitRequest,
  onTrackPlay
}) => {
  const [isRendering, setIsRendering] = useState(isOpen);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

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
          <h2 id="activity-modal-title" className="text-xl font-bold text-primary">
            {showMusicPlayer ? 'In-Ride Music' : 'My Activity'}
          </h2>
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
          ) : showMusicPlayer ? (
            <MusicPlayer onBack={() => setShowMusicPlayer(false)} onTrackPlay={onTrackPlay} />
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
                      <ActiveRideDisplay 
                        ride={activeCabRide} 
                        onCancel={onCancelRide} 
                        onRideArrived={onRideArrived} 
                        onPlayMusic={() => setShowMusicPlayer(true)} 
                      />
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