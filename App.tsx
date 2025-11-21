import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchNearbyPlaces } from './services/geminiService';
import { fetchKomootRoutes } from './services/apifyService';
import type { GeoLocation, GroundingChunk, Place, ActiveCabRide, TourPackage, VehicleType, PermitRequest, KomootRoute, SpotifyTrack, CustomTourRequest, HotelBooking, RestaurantBooking, User } from './types';
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
import CabBookingModal from './components/CabBookingModal';
import MyActivityModal from './components/MyActivityModal';
import LocationPermissionPrompt from './components/LocationPermissionPrompt';
import ProhibitedPermitModal from './components/ProhibitedPermitModal';
import HikingTrailsModal from './components/HikingTrailsModal';
import LahoreHubModal from './components/LahoreHubModal';
import EnhancedTourPackagesModal from './components/EnhancedTourPackagesModal';
import RestaurantBookingModal from './components/RestaurantBookingModal';
import Footer from './components/Footer';
import LahoreHubTourModal from './components/LahoreHubTourModal'; // Import the new LahoreHubTourModal
import HotelBookingModal from './components/HotelBookingModal';
import TouristSiteBookingModal from './components/TouristSiteBookingModal';
import TourPackagesSection from './components/TourPackagesSection';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

// Define SVG icons for LahoreHub modal
const RestaurantIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.002a3 3 0 01-3 3v.004a3 3 0 01-3-3V15a3 3 0 116 0v.002zM5 16v.002a3 3 0 01-3 3v.004a3 3 0 01-3-3V16a3 3 0 116 0zm16-8V6a4 4 0 10-8 0v2h8zM5 8V6a4 4 0 10-8 0v2h8z" />
  </svg>
);

const TourPackagesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

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
  <header className="mb-8 text-center text-white relative z-10">
    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
      Explorers
    </h1>
    <p className="mt-2 text-lg text-white/80 drop-shadow-md">
      Your guide to the world around you.
    </p>
  </header>
);

const TopNav: React.FC<{
  user: User | null;
  onLoginClick: () => void;
  onDashboardClick: () => void;
  onLogoutClick: () => void;
  onActivityClick: () => void;
  hasActivity: boolean;
}> = ({ user, onLoginClick, onDashboardClick, onLogoutClick, onActivityClick, hasActivity }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="absolute top-4 right-1 z-50 flex gap-3 items-center">
      {user ? (
        <>
          {/* Bell Icon for Activity */}
          <button
            onClick={onActivityClick}
            className="relative p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/10 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasActivity && (
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black transform translate-x-1/4 -translate-y-1/4"></span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold text-sm border-2 border-white/20 shadow-lg overflow-hidden"
            >
              {user.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in origin-top-right">
                <div className="p-4 border-b border-white/10">
                  <p className="text-white font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onDashboardClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile & Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onActivityClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Past Visits
                  </button>
                  <div className="border-t border-white/10 my-1"></div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogoutClick();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={onLoginClick}
          className="px-2 py-1 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold transition-all text-white border border-white/10"
        >
          Login / Sign Up
        </button>
      )}
    </div>
  );
};

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
    <div className="w-full max-w-3xl mx-auto mb-6">
      <iframe
        src={playerUrl}
        width="100%"
        height="80"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Player"
        style={{ borderRadius: '12px' }}
      />
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
  const [isTourSearch, setIsTourSearch] = useState<boolean>(false);
  const [isHotelSearch, setIsHotelSearch] = useState<boolean>(false);
  const [isRestaurantSearch, setIsRestaurantSearch] = useState<boolean>(false);
  const [isTouristSiteSearch, setIsTouristSiteSearch] = useState<boolean>(false);

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
  const [isLahoreHubModalOpen, setIsLahoreHubModalOpen] = useState<boolean>(false);
  const [isPartnerDashboardModalOpen, setIsPartnerDashboardModalOpen] = useState<boolean>(false);
  const [isEnhancedTourPackagesOpen, setIsEnhancedTourPackagesOpen] = useState<boolean>(false);
  const [isRestaurantBookingOpen, setIsRestaurantBookingOpen] = useState<boolean>(false);
  const [isHotelBookingOpen, setIsHotelBookingOpen] = useState<boolean>(false);
  const [isTouristSiteBookingOpen, setIsTouristSiteBookingOpen] = useState<boolean>(false);
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [restaurantBookings, setRestaurantBookings] = useState<RestaurantBooking[]>([]);
  const [touristSiteBookings, setTouristSiteBookings] = useState<any[]>([]);

  // Activity State
  const [activeCabRide, setActiveCabRide] = useState<ActiveCabRide | null>(null);
  const [activeTourPackage, setActiveTourPackage] = useState<TourPackage | null>(null);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [permitRequests, setPermitRequests] = useState<PermitRequest[]>([]);
  const [customTourRequests, setCustomTourRequests] = useState<CustomTourRequest[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [tourBookings, setTourBookings] = useState<any[]>([]);

  // Hiking Trails State
  const [hikingRoutes, setHikingRoutes] = useState<KomootRoute[]>([]);
  const [isHikingLoading, setIsHikingLoading] = useState<boolean>(false);

  // Ride Arrival State
  const [isRideArrivedPopupOpen, setIsRideArrivedPopupOpen] = useState<boolean>(false);
  const hasArrived = useRef(false);

  // Persistent Music Player State
  const [persistentPlayerUrl, setPersistentPlayerUrl] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

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

    // Check if this is a tour search
    const isTourQuery = activeQuery.toLowerCase().includes('tour') || activeQuery.toLowerCase().includes('package') || activeQuery.toLowerCase().includes('lahore');
    setIsTourSearch(isTourQuery);

    // Check if this is a hotel search
    const isHotelQuery = activeQuery.toLowerCase().includes('hotel') || activeQuery.toLowerCase().includes('inn') || activeQuery.toLowerCase().includes('resort') || activeQuery.toLowerCase().includes('lodge');
    setIsHotelSearch(isHotelQuery);

    // Check if this is a restaurant search
    const isRestaurantQuery = activeQuery.toLowerCase().includes('restaurant') || activeQuery.toLowerCase().includes('dining') || activeQuery.toLowerCase().includes('food');
    setIsRestaurantSearch(isRestaurantQuery);

    // Check if this is a tourist site search
    const isTouristSiteQuery = activeQuery.toLowerCase().includes('tourist') || activeQuery.toLowerCase().includes('historic') || activeQuery.toLowerCase().includes('landmark') || activeQuery.toLowerCase().includes('attraction') || activeQuery.toLowerCase().includes('heritage') || activeQuery.toLowerCase().includes('monument') || activeQuery.toLowerCase().includes('museum') || activeQuery.toLowerCase().includes('fort');
    setIsTouristSiteSearch(isTouristSiteQuery);

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
      // Don't perform any initial search, just show the pre-made tours
    }
  }, [location, handleSearch]);

  const handleCabBooking = useCallback((destination: string | null = null, guestName?: string, phone?: string) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // If guest details are provided, we can use them in the cab booking
    // For now, we'll just set the destination as before
    // In a more complete implementation, you might want to pass guest details to the cab booking modal
    setCabDestination(destination);
    setIsCabBookingOpen(true);
  }, [currentUser]);

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

  // New handler to reset search and show default tour packages
  const handleResetSearch = () => {
    setResponse(null);
    setGroundingChunks([]);
    setIsTourSearch(false);
    setIsHotelSearch(false);
    setIsRestaurantSearch(false);
    setIsTouristSiteSearch(false);
    setActiveCategory(null);
  };

  // New handler for LahoreHub
  const handleLahoreHubRequest = () => {
    setIsLahoreHubModalOpen(true);
  };

  // Handler for partner dashboard
  const handlePartnerDashboardRequest = () => {
    setIsPartnerDashboardModalOpen(true);
  };

  // Handler for enhanced tour packages
  const handleEnhancedTourPackagesRequest = () => {
    setIsEnhancedTourPackagesOpen(true);
  };

  // Handler for restaurant booking
  const handleRestaurantBookingRequest = useCallback(async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch restaurants from the API
      const result = await fetchNearbyPlaces("Find popular restaurants in Lahore", location);

      // Parse the response to extract restaurant data
      // This is a simplified parsing - in a real app, you'd want more robust parsing
      const restaurantList: Place[] = [];
      if (result.text) {
        const lines = result.text.split('\n');
        let currentRestaurant: Partial<Place> | null = null;

        for (const line of lines) {
          if (line.startsWith('Rating:')) {
            if (currentRestaurant) {
              const ratingStr = line.replace('Rating:', '').trim();
              currentRestaurant.rating = ratingStr === 'N/A' ? null : parseFloat(ratingStr);
            }
          } else if (line.startsWith('ImageURL:')) {
            if (currentRestaurant) {
              currentRestaurant.imageUrl = line.replace('ImageURL:', '').trim();
            }
          } else if (line.startsWith('Description:')) {
            if (currentRestaurant) {
              currentRestaurant.description = line.replace('Description:', '').trim();
            }
          } else if (/^\d+\.\s/.test(line)) {
            // This is a new restaurant entry
            if (currentRestaurant && currentRestaurant.title) {
              restaurantList.push(currentRestaurant as Place);
            }
            currentRestaurant = {
              title: line.replace(/^\d+\.\s/, '').trim(),
              rating: null,
              imageUrl: null,
              description: null
            };
          }
        }

        // Add the last restaurant if it exists
        if (currentRestaurant && currentRestaurant.title) {
          restaurantList.push(currentRestaurant as Place);
        }
      }

      setRestaurants(restaurantList);
      setIsRestaurantBookingOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Handlers for LahoreHub features
  const handleTourSearch = () => {
    handleSearch("Find popular tour packages in Lahore");
  };

  const handleCustomTourRequest = () => {
    setIsEnhancedTourPackagesOpen(true);
  };

  const handleRestaurantSearch = () => {
    handleRestaurantBookingRequest();
  };

  // Function to handle when a track is played in any music player
  const handleTrackPlay = (track: SpotifyTrack, embedUrl: string) => {
    setCurrentTrack(track);
    setPersistentPlayerUrl(embedUrl);
  };

  // New handler for custom tour requests
  const handleCustomTourRequestSubmit = (requestData: any) => {
    const newRequest: CustomTourRequest = {
      id: Date.now(),
      fullName: requestData.fullName,
      email: requestData.email,
      phone: requestData.phone,
      preferredLocations: requestData.preferredLocations,
      transportMode: requestData.transportMode,
      adults: parseInt(requestData.adults),
      children: parseInt(requestData.children),
      tripType: requestData.tripType,
      meals: requestData.meals,
      addOnActivities: requestData.addOnActivities,
      packageTier: requestData.packageTier,
      specialRequests: requestData.specialRequests,
      status: 'pending',
      timestamp: Date.now(),
    };

    setCustomTourRequests(prev => [newRequest, ...prev]);
  };

  // New handler for tour booking
  const handleTourBooking = (place: Place) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // For now, we'll just open the enhanced tour packages modal
    // In a real implementation, this would open a specific booking form for the tour
    setIsModalOpen(false);
    setIsEnhancedTourPackagesOpen(true);
  };

  // New state for LahoreHub tour modal
  const [isLahoreHubTourModalOpen, setIsLahoreHubTourModalOpen] = useState<boolean>(false);

  // New handler for LahoreHub tour searches
  const handleLahoreHubTourSearch = () => {
    setIsLahoreHubTourModalOpen(true);
  };

  const [selectedHotel, setSelectedHotel] = useState<Place | null>(null);
  const [selectedTouristSite, setSelectedTouristSite] = useState<Place | null>(null);

  const handleHotelBooking = (hotel: Place) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedHotel(hotel);
    setIsHotelBookingOpen(true);
  };

  const handleHotelBookingConfirmed = (booking: HotelBooking) => {
    setHotelBookings(prev => [...prev, booking]);
  };

  const handleTouristSiteBooking = (site: Place) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedTouristSite(site);
    setIsTouristSiteBookingOpen(true);
  };

  const handleTouristSiteBookingConfirmed = (booking: any) => {
    setTouristSiteBookings(prev => [...prev, booking]);
  };

  const handleRestaurantBooking = (restaurant: Place) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    // Set the selected restaurant and open the booking modal
    setSelectedPlace(restaurant);
    setIsRestaurantBookingOpen(true);
  };

  const handleRestaurantBookingConfirmed = (booking: RestaurantBooking) => {
    setRestaurantBookings(prev => [...prev, booking]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsDashboardOpen(false);
  };

  return (
    <div className="min-h-screen text-primary">
      <div className="video-overlay"></div>
      {/* Fallback background in case video doesn't load */}
      <div className="fixed inset-0 z-[-3] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
      <video
        id="video-bg"
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto z-[-2] transform -translate-x-1/2 -translate-y-1/2 object-cover"
        onError={(e) => {
          console.error("Video error:", e);
          // Fallback to a solid color background if video fails to load
          const videoElement = e.target as HTMLVideoElement;
          videoElement.style.display = 'none';
          const overlay = document.querySelector('.video-overlay');
          if (overlay) {
            (overlay as HTMLElement).style.backgroundColor = 'rgba(79, 70, 229, 0.8)'; // Indigo color
          }
        }}
        onLoadedData={() => {
          console.log("Video loaded successfully");
        }}
      >
        <source src="/382d18caee7450cf.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <main className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Top Navigation Bar - Positioned absolutely relative to the main container or viewport */}
        <TopNav
          user={currentUser}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onDashboardClick={() => {
            // Only open modal dashboard for tourists, as providers have it as main view
            if (currentUser?.role === 'tourist') {
              setIsDashboardOpen(true);
            }
          }}
          onLogoutClick={handleLogout}
          onActivityClick={() => setIsActivityModalOpen(true)}
          hasActivity={visitedPlaces.length > 0 || tourBookings.length > 0 || hotelBookings.length > 0 || restaurantBookings.length > 0 || activeCabRide !== null}
        />

        {/* Service Provider View: Direct Dashboard Access */}
        {currentUser && currentUser.role !== 'tourist' ? (
          <div className="pt-20">
            <Dashboard
              user={currentUser}
              onLogout={handleLogout}
              onScanQR={() => {
                setIsScannerOpen(true);
              }}
              isEmbedded={true} // New prop to indicate it's embedded in the main view
            />
          </div>
        ) : (
          /* Tourist / Guest View: Main App Interface */
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
                      onTourPackagesRequest={() => setIsEnhancedTourPackagesOpen(true)} // Updated to use enhanced modal
                      onActivityRequest={() => setIsActivityModalOpen(true)}
                      onPermitRequest={() => setIsPermitModalOpen(true)}
                      onHikingRequest={handleFetchHikingRoutes}
                      onLahoreHubRequest={handleLahoreHubRequest}
                      disabled={isLoading || !location}
                      activeCabRide={activeCabRide}
                      visitedPlacesCount={visitedPlaces.length}
                      permitRequestsCount={permitRequests.length}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      onViewResults={handleViewResults}
                      onResetSearch={handleResetSearch}
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
                      <>
                        <ResultsDisplay
                          response={response}
                          groundingChunks={groundingChunks}
                          location={location}
                          onPlaceSelect={handlePlaceSelect}
                          onChatRequest={handleOpenChatbot}
                          visitedPlaces={visitedPlaces}
                          isTourSearch={isTourSearch} // Pass the isTourSearch prop
                          isHotelSearch={isHotelSearch} // Pass the isHotelSearch prop
                          isRestaurantSearch={isRestaurantSearch}
                          isTouristSiteSearch={isTouristSiteSearch}
                        />
                        {isTourSearch && <TourPackagesSection
                          location={location}
                          onBookingConfirmed={(booking) => setTourBookings(prev => [...prev, booking])}
                          onAskExplorerAI={(tour) => {
                            // Create a mock Place object for the tour
                            const tourPlace: Place = {
                              title: tour.title,
                              uri: `tour-${tour.id}`,
                              rating: tour.rating,
                              imageUrl: null,
                              description: `Tour package by ${tour.agency}. Features: ${tour.features.join(', ')}`
                            };
                            handleOpenChatbot(tourPlace);
                          }}
                          currentUser={currentUser}
                          onAuthRequired={() => setIsAuthModalOpen(true)}
                        />}
                      </>
                    )}
                    {/* Show tour packages in Discoveries Near You section when location is available and no specific search */}
                    {!response && !isLoading && location && (
                      <TourPackagesSection
                        location={location}
                        onBookingConfirmed={(booking) => setTourBookings(prev => [...prev, booking])}
                        onAskExplorerAI={(tour) => {
                          // Create a mock Place object for the tour
                          const tourPlace: Place = {
                            title: tour.title,
                            uri: `tour-${tour.id}`,
                            rating: tour.rating,
                            imageUrl: null,
                            description: `Tour package by ${tour.agency}. Features: ${tour.features.join(', ')}`
                          };
                          handleOpenChatbot(tourPlace);
                        }}
                        currentUser={currentUser}
                        onAuthRequired={() => setIsAuthModalOpen(true)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <Footer /> {/* Use the new Footer component */}
          </div>
        )}

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
        onBookTour={handleTourBooking}
        onBookHotel={handleHotelBooking}
        onBookTouristSite={handleTouristSiteBooking}
        onBookRestaurant={handleRestaurantBooking}
        onOpenLahoreHubTours={handleLahoreHubTourSearch}
        onMarkAsVisited={handleMarkAsVisited}
        isVisited={visitedPlaces.includes(selectedPlace?.title ?? '')}
        isTourPackage={isTourSearch}
        isTouristSiteSearch={isTouristSiteSearch}
        isHotelSearch={isHotelSearch}
        isRestaurantSearch={isRestaurantSearch}
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
        customTourRequests={customTourRequests}
        hotelBookings={hotelBookings}
        restaurantBookings={restaurantBookings}
        touristSiteBookings={touristSiteBookings}
        tourBookings={tourBookings}
        onCancelRide={handleCancelRide}
        onRideArrived={handleRiderArrived}
        onCancelPermitRequest={handleCancelPermitRequest}
        onTrackPlay={handleTrackPlay}
        userRole={currentUser?.role}
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

      {/* Use the updated LahoreHubModal component */}
      <LahoreHubModal
        isOpen={isLahoreHubModalOpen}
        onClose={() => setIsLahoreHubModalOpen(false)}
        onTourSearch={handleTourSearch}
        onCustomTourRequest={handleCustomTourRequest}
        currentUser={currentUser}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />

      {/* Enhanced Tour Packages Modal */}
      <EnhancedTourPackagesModal
        isOpen={isEnhancedTourPackagesOpen}
        onClose={() => setIsEnhancedTourPackagesOpen(false)}
        location={location}
        onTourBooked={handleTourBooked}
        onCustomTourRequest={handleCustomTourRequestSubmit} // Pass the custom tour request handler
      />

      {/* Restaurant Booking Modal */}
      <RestaurantBookingModal
        isOpen={isRestaurantBookingOpen}
        onClose={() => setIsRestaurantBookingOpen(false)}
        location={location}
        restaurants={restaurants}
        onRestaurantSelect={(restaurant) => {
          // Handle restaurant selection
          console.log('Selected restaurant:', restaurant);
        }}
        onBookingConfirmed={handleRestaurantBookingConfirmed}
        selectedRestaurant={selectedPlace}
        onBookCab={(destination) => handleCabBooking(destination)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Dashboard */}
      {currentUser && isDashboardOpen && (
        <Dashboard
          user={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            setIsDashboardOpen(false);
          }}
          onScanQR={() => {
            setIsDashboardOpen(false);
            setIsScannerOpen(true);
          }}
          onBack={() => setIsDashboardOpen(false)}
        />
      )}

      {/* Partner Dashboard Modal - Keeping for backward compatibility if needed, but Dashboard replaces it */}
      {isPartnerDashboardModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-overlay-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPartnerDashboardModalOpen(false)}
        >
          <div
            className="glass-pane w-full max-w-md p-6 animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-primary">Partner Dashboard</h2>
              <button
                onClick={() => setIsPartnerDashboardModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-secondary">
                Manage your tourism services and connect with customers in Lahore.
              </p>

              <div className="grid grid-cols-1 gap-3 mt-4">
                <button
                  className="glass-button-primary py-3 px-4 text-left rounded-xl"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="font-semibold">Upload Services/Packages</h3>
                      <p className="text-sm text-secondary">Add new tours, restaurants, or experiences</p>
                    </div>
                  </div>
                </button>

                <button
                  className="glass-button-primary py-3 px-4 text-left rounded-xl"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="font-semibold">Manage Bookings</h3>
                      <p className="text-sm text-secondary">View and update booking availability</p>
                    </div>
                  </div>
                </button>

                <button
                  className="glass-button-primary py-3 px-4 text-left rounded-xl"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="font-semibold">Respond to Requests</h3>
                      <p className="text-sm text-secondary">Handle custom tour requests from users</p>
                    </div>
                  </div>
                </button>

                <button
                  className="glass-button-primary py-3 px-4 text-left rounded-xl"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="font-semibold">Track Performance</h3>
                      <p className="text-sm text-secondary">View reviews, ratings, and analytics</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                <h3 className="font-bold text-green-400 mb-2">Partner Benefits</h3>
                <ul className="text-sm space-y-1 text-secondary">
                  <li>• Access to a growing customer base</li>
                  <li>• Secure payment processing</li>
                  <li>• Marketing and promotional support</li>
                  <li>• Real-time booking management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <LahoreHubTourModal
        isOpen={isLahoreHubTourModalOpen}
        onClose={() => setIsLahoreHubTourModalOpen(false)}
        onTourBooked={handleTourBooked}
      />

      <HotelBookingModal
        isOpen={isHotelBookingOpen}
        onClose={() => setIsHotelBookingOpen(false)}
        hotel={selectedHotel}
        onBookingConfirmed={handleHotelBookingConfirmed}
        userLocation={location}
        onBookCab={handleCabBooking}
      />

      <TouristSiteBookingModal
        isOpen={isTouristSiteBookingOpen}
        onClose={() => setIsTouristSiteBookingOpen(false)}
        site={selectedTouristSite}
        onBookingConfirmed={handleTouristSiteBookingConfirmed}
        onBookCab={(destination) => handleCabBooking(destination)}
      />

    </div>
  );
};

export default App;




