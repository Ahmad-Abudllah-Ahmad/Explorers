import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchNearbyPlaces } from './services/geminiService';
import { fetchKomootRoutes } from './services/apifyService';
import type { GeoLocation, GroundingChunk, Place, ActiveCabRide, TourPackage, VehicleType, PermitRequest, KomootRoute, SpotifyTrack } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { useDebounce } from './hooks/useDebounce';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import CategoryButtons from './components/CategoryButtons';
import RadiusSlider from './components/RadiusSlider';
import DetailsModal from './components/DetailsModal';
import QRCodeScannerModal from './components/QRCodeScannerModal';
import CommunityChatModal from './components/CommunityChatModal';
import ChatbotModal from './components/ChatbotModal';
import ChatbotFAB from './components/ChatbotFAB';
import TranslatorModal from './components/TranslatorModal';
import TourPackagesModal from './components/TourPackagesModal';
import CabBookingModal from './components/CabBookingModal';
import MyActivityModal from './components/MyActivityModal';
import LocationPermissionPrompt from './components/LocationPermissionPrompt';
import ProhibitedPermitModal from './components/ProhibitedPermitModal';
import HikingTrailsModal from './components/HikingTrailsModal';

const RiderArrivedModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [isRendering, setIsRendering] = useState(isOpen);

  useEffect(() => {
      if (isOpen) {
          setIsRendering(true);
      } else {
          setTimeout(() => setIsRendering(false), 400); // Match animation duration
      }
  }, [isOpen]);

  if (!isRendering) return null;
  
  return (
    <div
      className={`fixed inset-0 z-[70] flex justify-center items-center p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`glass-pane w-full max-w-md text-center p-8 animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary">Rider has Arrived!</h2>
        <p className="mt-2 text-secondary">
          Your ride is waiting for you outside.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-3 glass-button-primary"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// New Ride Arrived Popup Component
const RideArrivedPopup: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [isRendering, setIsRendering] = useState(isOpen);

  useEffect(() => {
      if (isOpen) {
          setIsRendering(true);
      } else {
          setTimeout(() => setIsRendering(false), 400); // Match animation duration
      }
  }, [isOpen]);

  if (!isRendering) return null;
  
  return (
    <div
      className={`fixed inset-0 z-[100] flex justify-center items-center p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`glass-pane w-full max-w-md text-center p-8 animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary">Rider has Arrived!</h2>
        <p className="mt-2 text-secondary">
          Your ride is waiting for you outside.
        </p>
        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-3 glass-button-primary"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

const AppHeader: React.FC = () => (
    <header className="mb-8 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
        Explorers
        </h1>
        <p className="mt-2 text-lg text-white/80 drop-shadow-md">
        Your guide to the world around you.
        </p>
    </header>
);

const AppFooter: React.FC = () => (
    <footer className="text-center mt-8 text-sm text-white/70">
        <p>Developed by AAAhmad AI ENG</p>
    </footer>
);

// Persistent Music Player Component
const PersistentMusicPlayer: React.FC<{ 
  playerUrl: string | null; 
  onClose: () => void;
  currentTrack: SpotifyTrack | null;
}> = ({ playerUrl, onClose, currentTrack }) => {
  if (!playerUrl) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 bg-black/80 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          {currentTrack?.album?.images?.[0]?.url && (
            <img 
              src={currentTrack.album.images[0].url} 
              alt="Now playing" 
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="min-w-0 flex-grow">
            <p className="text-white font-semibold truncate text-sm">
              {currentTrack?.name || 'Now Playing'}
            </p>
            <p className="text-white/70 text-xs truncate">
              {currentTrack?.artists?.map(a => a.name).join(', ') || 'Spotify'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close player"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-2">
        <iframe 
          src={playerUrl} 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          className="rounded-lg"
        ></iframe>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(4);
  const [showMainApp, setShowMainApp] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);


  // Modals state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotContext, setChatbotContext] = useState<Place | null>(null);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState<boolean>(false);
  const [isTourPackagesOpen, setIsTourPackagesOpen] = useState<boolean>(false);
  const [isCabBookingOpen, setIsCabBookingOpen] = useState<boolean>(false);
  const [cabDestination, setCabDestination] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState<boolean>(false);
  const [isRiderArrivedModalOpen, setIsRiderArrivedModalOpen] = useState<boolean>(false);
  const [isPermitModalOpen, setIsPermitModalOpen] = useState<boolean>(false);
  const [isHikingModalOpen, setIsHikingModalOpen] = useState<boolean>(false);


  // Activity State
  const [activeCabRide, setActiveCabRide] = useState<ActiveCabRide | null>(null);
  const [activeTourPackage, setActiveTourPackage] = useState<TourPackage | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [permitRequests, setPermitRequests] = useState<PermitRequest[]>([]);

  // Hiking Trails State
  const [hikingRoutes, setHikingRoutes] = useState<KomootRoute[]>([]);
  const [isHikingLoading, setIsHikingLoading] = useState<boolean>(false);

  // Ride Arrival State
  const [isRideArrivedPopupOpen, setIsRideArrivedPopupOpen] = useState<boolean>(false);
  const hasArrived = useRef(false);

  // Persistent Music Player State
  const [persistentPlayerUrl, setPersistentPlayerUrl] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const { location, address, error: locationError, isLoading: isLocationLoading, requestLocation } = useGeolocation();
  const initialSearchPerformed = useRef(false);

  const isAnyModalOpen = isModalOpen || isScannerOpen || isCommunityChatOpen || isChatbotOpen || isTranslatorOpen || isTourPackagesOpen || isCabBookingOpen || isActivityModalOpen || isRiderArrivedModalOpen || isPermitModalOpen || isHikingModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => {
        document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Ride arrival timer effect - runs in the background regardless of which screen user is on
  useEffect(() => {
    if (!activeCabRide || !activeCabRide.bookingTimestamp) {
      hasArrived.current = false;
      return;
    }

    const calculateRemainingSeconds = () => {
      const totalDurationSeconds = activeCabRide.etaMinutes * 60;
      const elapsedSeconds = (Date.now() - activeCabRide.bookingTimestamp) / 1000;
      return Math.max(0, totalDurationSeconds - elapsedSeconds);
    };

    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds();

      if (remaining === 0 && !hasArrived.current) {
        hasArrived.current = true;
        // Trigger ride arrival on the main app level
        handleRiderArrived();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCabRide]);

  const handleSearch = useCallback(async (searchOverride?: string) => {
    const activeQuery = typeof searchOverride === 'string' ? searchOverride : query;
    if (!activeQuery.trim()) {
      setError('Please enter a query or select a category.');
      return;
    }

    if (!location) {
      setError(locationError || 'Could not determine your location. Please enable location services.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setGroundingChunks([]);

    try {
      const fullQuery = `${activeQuery} within a ${radius} kilometer radius`;
      const result = await fetchNearbyPlaces(fullQuery, location);
      setResponse(result.text);
      setGroundingChunks(result.groundingChunks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [query, location, locationError, radius]);

  useEffect(() => {
    if (location && !showMainApp) {
      setShowMainApp(true);
    }
  }, [location, showMainApp]);

  // This effect now triggers the initial search when location becomes available for the first time.
  useEffect(() => {
    if (location && !initialSearchPerformed.current) {
      initialSearchPerformed.current = true;
      handleSearch("popular and interesting places nearby");
    }
  }, [location, handleSearch]);
  
  const handleCabBooking = useCallback((destination: string | null = null) => {
    setCabDestination(destination);
    setIsCabBookingOpen(true);
  }, []);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };
  
  const openScanner = () => {
    setIsModalOpen(false); // Close details if open
    setIsScannerOpen(true);
  };

  const handleQRScanSuccess = (decodedText: string) => {
    setIsScannerOpen(false);
    const qrQuery = `Tell me about the monument or place: "${decodedText}". Provide a detailed description, its history, and what it's known for.`;
    setQuery('');
    handleSearch(qrQuery);
  };

  const handleOpenChatbot = (place?: Place) => {
    setChatbotContext(place || null);
    setIsChatbotOpen(true);
  };
  
  const handleBookCabForPlace = (place: Place) => {
    setIsModalOpen(false);
    setTimeout(() => handleCabBooking(place.title), 350);
  };

  const handleRideBooked = (rideDetails: Omit<ActiveCabRide, 'bookingTimestamp'>) => {
    setActiveCabRide({
      ...rideDetails,
      bookingTimestamp: Date.now(),
    });
    setIsCabBookingOpen(true); // Keep it open for tracking view
  };

  const handleCancelRide = () => {
    setActiveCabRide(null);
    setIsCabBookingOpen(false); // Close modal on cancel
  };
  
  // Function to handle when rider arrives
  const handleRiderArrived = useCallback(() => {
    if (activeCabRide) {
        setActiveCabRide(null); // The ride is over
        setIsRiderArrivedModalOpen(true); // Show the arrival modal
        setIsRideArrivedPopupOpen(true); // Show the popup on main screen
    }
  }, [activeCabRide]);
  
  const handleTourBooked = (tour: TourPackage) => {
    setActiveTourPackage(tour);
  };

  const handleMarkAsVisited = (placeTitle: string) => {
    setVisitedPlaces(prev => {
        if (prev.includes(placeTitle)) {
            return prev.filter(p => p !== placeTitle); // Allow un-marking
        }
        return [...prev, placeTitle];
    });
};

const handleSubmitPermitRequest = (data: Omit<PermitRequest, 'id' | 'status' | 'submissionTimestamp'>) => {
    const newRequest: PermitRequest = {
        id: Date.now(),
        ...data,
        status: 'pending',
        submissionTimestamp: Date.now(),
    };
    setPermitRequests(prev => [newRequest, ...prev]);
    setIsPermitModalOpen(false);
};

const handleCancelPermitRequest = (id: number) => {
    setPermitRequests(prev => prev.filter(req => req.id !== id));
};

const handleFetchHikingRoutes = async () => {
    if (!address) {
        setError("Your address is not available yet. Please wait a moment.");
        return;
    }
    setIsHikingModalOpen(true);
    setIsHikingLoading(true);
    setHikingRoutes([]);
    try {
        const routes = await fetchKomootRoutes(address);
        setHikingRoutes(routes);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not fetch hiking trails.');
        // Don't close the modal on error, let the modal display the error
    } finally {
        setIsHikingLoading(false);
    }
};

  const performSearch = (searchOverride?: string) => {
    setActiveCategory(null);
    handleSearch(searchOverride);
  }

  const handleViewResults = () => {
    // Keep the banner active after scrolling
    setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // A slight delay for a smoother feel
  };

  // Function to handle when a track is played in any music player
  const handleTrackPlay = (track: SpotifyTrack, embedUrl: string) => {
    setCurrentTrack(track);
    setPersistentPlayerUrl(embedUrl);
  };

  return (
    <div className="min-h-screen font-sans antialiased">
        <div className="video-overlay"></div>
        <video id="video-bg" autoPlay loop muted playsInline>
            <source src="/382d18caee7450cf.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div 
          className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.65,0.05,0.36,1)] ${!showMainApp ? 'min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center' : 'max-w-3xl mx-auto'}`}
        >
          <AppHeader />
          
          {/* Persistent Music Player - Placed between title and dashboard */}
          <PersistentMusicPlayer 
            playerUrl={persistentPlayerUrl} 
            onClose={() => setPersistentPlayerUrl(null)}
            currentTrack={currentTrack}
          />
          
          <div className={`transition-opacity duration-500 ease-out ${!showMainApp ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <div className="my-8">
              <LocationPermissionPrompt onGrant={requestLocation} isLoading={isLocationLoading} error={locationError} />
            </div>
          </div>

          {showMainApp && (
            <div className="w-full animate-fade-slide-in-content">
              <div className="glass-pane overflow-hidden">
                  <div className="p-4 sm:p-6">
                      <SearchBar 
                          query={query} 
                          setQuery={setQuery} 
                          onSubmit={() => performSearch()} 
                          isLoading={isLoading}
                          location={location}
                      />
                      <RadiusSlider radius={radius} setRadius={setRadius} disabled={isLoading} />
                      <CategoryButtons 
                          onSearch={handleSearch} 
                          onCabBooking={() => handleCabBooking()}
                          onScanRequest={openScanner}
                          onCommunityChatRequest={() => setIsCommunityChatOpen(true)}
                          onTranslatorRequest={() => setIsTranslatorOpen(true)}
                          onTourPackagesRequest={() => setIsTourPackagesOpen(true)}
                          onActivityRequest={() => setIsActivityModalOpen(true)}
                          onPermitRequest={() => setIsPermitModalOpen(true)}
                          onHikingRequest={handleFetchHikingRoutes}
                          disabled={isLoading || !location}
                          activeCabRide={activeCabRide}
                          visitedPlacesCount={visitedPlaces.length}
                          permitRequestsCount={permitRequests.length}
                          activeCategory={activeCategory}
                          setActiveCategory={setActiveCategory}
                          onViewResults={handleViewResults}
                      />
                  </div>

                  <div ref={resultsRef} className="px-4 sm:px-6 pb-6 pt-1">
                      {isLoading && (
                          <div className="flex flex-col items-center justify-center text-center p-8">
                          <LoadingSpinner />
                          <p className="mt-4 text-2xl">✨🔮🗺️</p>
                          <p className="mt-2 text-secondary">Consulting the cosmos...</p>
                          </div>
                      )}
                      {error && (
                          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl relative" role="alert">
                          <strong className="font-bold">Error: </strong>
                          <span className="block sm:inline">{error}</span>
                          </div>
                      )}
                      {response && !isLoading && (
                          <ResultsDisplay 
                              response={response} 
                              groundingChunks={groundingChunks} 
                              location={location}
                              onPlaceSelect={handlePlaceSelect}
                              onChatRequest={handleOpenChatbot}
                              visitedPlaces={visitedPlaces}
                          />
                      )}
                  </div>
              </div>
            </div>
          )}

          <AppFooter />
        </div>
        
        {/* Ride Arrived Popup - Shows on main screen when ride arrives */}
        <RideArrivedPopup 
          isOpen={isRideArrivedPopupOpen} 
          onClose={() => setIsRideArrivedPopupOpen(false)} 
        />
      </main>
      
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        place={selectedPlace}
        location={location}
        onScanRequest={openScanner}
        onChatRequest={handleOpenChatbot}
        onBookCab={handleBookCabForPlace}
        onMarkAsVisited={handleMarkAsVisited}
        isVisited={visitedPlaces.includes(selectedPlace?.title ?? '')}
      />
      <QRCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
      <CommunityChatModal
        isOpen={isCommunityChatOpen}
        onClose={() => setIsCommunityChatOpen(false)}
        radius={radius}
      />
       <TranslatorModal
        isOpen={isTranslatorOpen}
        onClose={() => setIsTranslatorOpen(false)}
      />
       <TourPackagesModal
        isOpen={isTourPackagesOpen}
        onClose={() => setIsTourPackagesOpen(false)}
        location={location}
        onTourBooked={handleTourBooked}
      />
      <CabBookingModal
        isOpen={isCabBookingOpen}
        onClose={() => setIsCabBookingOpen(false)}
        onCancelRide={handleCancelRide}
        userLocation={location}
        initialDestination={cabDestination}
        onRideBooked={handleRideBooked}
        activeRide={activeCabRide}
        onRideArrived={handleRiderArrived}
        onTrackPlay={handleTrackPlay}
      />
       <MyActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        activeCabRide={activeCabRide}
        activeTourPackage={activeTourPackage}
        visitedPlaces={visitedPlaces}
        permitRequests={permitRequests}
        onCancelRide={handleCancelRide}
        onRideArrived={handleRiderArrived}
        onCancelPermitRequest={handleCancelPermitRequest}
        onTrackPlay={handleTrackPlay}
      />
       <RiderArrivedModal 
        isOpen={isRiderArrivedModalOpen}
        onClose={() => setIsRiderArrivedModalOpen(false)}
      />
       <ProhibitedPermitModal
        isOpen={isPermitModalOpen}
        onClose={() => setIsPermitModalOpen(false)}
        onSubmit={handleSubmitPermitRequest}
      />
       <HikingTrailsModal
        isOpen={isHikingModalOpen}
        onClose={() => setIsHikingModalOpen(false)}
        routes={hikingRoutes}
        isLoading={isHikingLoading}
        error={error}
        clearError={() => setError(null)}
       />
      <ChatbotFAB onClick={() => handleOpenChatbot()} />
      <ChatbotModal 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        contextPlace={chatbotContext}
        location={location}
        address={address}
      />
    </div>
  );
};

export default App;