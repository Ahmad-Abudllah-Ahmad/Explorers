import React, { useEffect, useState } from 'react';
import type { ActiveCabRide } from '../types';
// APIFY_TOKEN_AVAILABLE is no longer available

// --- ICONS ---
const RestaurantIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);
const HotelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h2.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);
const TouristIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
);
const CabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25L9 5.25m3 3l1.5-3M4.5 8.25h15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const QRIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 15.75h.008v.008h-.008v-.008zM15.75 15.75h.008v.008h-.008v-.008zM14.25 17.25h.008v.008h-.008v-.008zM15.75 17.25h.008v.008h-.008v-.008zM17.25 15.75h.008v.008h-.008v-.008zM18.75 15.75h.008v.008h-.008v-.008zM17.25 17.25h.008v.008h-.008v-.008zM18.75 17.25h.008v.008h-.008v-.008z" />
    </svg>
);
const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TranslatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.625M21 21l-5.25-11.625M3.75 5.25h16.5M4.5 12h15M5.25 12l-1.5-1.5m1.5 1.5l-1.5 1.5M18.75 12l1.5-1.5m-1.5 1.5l1.5 1.5" />
    </svg>
);
const TourPackagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.25c-2.59 1.9-3.72 5.03-3.72 8.25 0 3.22 1.13 6.35 3.72 8.25m5.84-2.58a14.923 14.923 0 01-5.84 2.58m5.84 0a14.923 14.923 0 00-5.84-2.58m5.84 0-7.08-4.248" />
    </svg>
);
const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M10.5 16.5h3m-6.38-3.37a4.5 4.5 0 116.76 0l-1.06-1.06a1.5 1.5 0 00-2.12 0l-1.06 1.06z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);
const HikingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21L5.25 12l-1.5 1.5L6 21m6-9l1.5-1.5-1.5-1.5-1.5 1.5 1.5 1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 6l-1.5 1.5-1.5-1.5 1.5-1.5 1.5 1.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 21v-3.5a1.5 1.5 0 00-1.5-1.5h-3a1.5 1.5 0 00-1.5 1.5V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2.071 0-4 1.929-4 4.5V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12c2.071 0 4 1.929 4 4.5V21" />
    </svg>
);

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);


// --- COMPONENTS ---

interface GridButtonProps {
    onClick: () => void;
    disabled: boolean;
    label: string;
    icon: React.ReactNode;
    imageUrl: string;
    notificationCount?: number;
    title?: string;
}

const GridButton: React.FC<GridButtonProps> = ({ onClick, disabled, label, icon, imageUrl, notificationCount, title }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !disabled && onClick() }}
        className={`relative aspect-square flex flex-col items-center justify-center p-2 text-center rounded-3xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-color)] focus:ring-offset-2 dark:focus:ring-offset-black 
            ${disabled 
                ? 'opacity-60 cursor-not-allowed saturate-50' 
                : 'cursor-pointer hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl'
            }`}
        title={title}
    >
        <div 
            className="absolute inset-0 bg-cover bg-center rounded-3xl -z-10"
            style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 rounded-3xl -z-10" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl -z-10" />
        
        <div className="text-white drop-shadow-lg">
            {icon}
        </div>
        <span className="text-sm font-semibold text-white mt-2 drop-shadow-lg">{label}</span>
        
        {notificationCount && notificationCount > 0 && (
            <span className={`absolute top-2 right-2 flex items-center justify-center h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white/50`} title={`${notificationCount} active items`}>
                {notificationCount}
            </span>
        )}
    </div>
);

const ExpandedCategoryBanner = ({ category, onBack, onViewResults, isActive }: { category: any, onBack: () => void, onViewResults: () => void, isActive: boolean }) => {
    const isSearchCategory = ["Restaurants", "Hotels", "Tourist Sites"].includes(category.label);
    const actionLabel = isSearchCategory ? "View Results" : category.actionLabel;
    const actionHandler = isSearchCategory ? onViewResults : category.action;

    return (
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl overflow-hidden text-white text-center">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                    style={{ backgroundImage: `url(${category.imageUrl})`, transform: isActive ? 'scale(1)' : 'scale(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                
                <div className={`absolute top-4 left-4 z-10 transition-all duration-500 ease-out ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    <button onClick={onBack} aria-label="Go back" className="close-button-glass !w-10 !h-10">
                        <BackArrowIcon />
                    </button>
                </div>

                <div className={`relative z-10 transition-all duration-500 ease-out delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg">{category.icon}</div>
                    <h3 className="text-3xl md:text-4xl font-bold mt-4 drop-shadow-lg">{category.label}</h3>
                    <p className="mt-2 max-w-sm mx-auto text-white/90 drop-shadow-md">{category.description}</p>
                    <button onClick={actionHandler} className="mt-6 text-lg font-bold bg-white text-black px-10 py-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface CategoryButtonsProps {
  onSearch: (query: string) => void;
  onCabBooking: () => void;
  onScanRequest: () => void;
  onCommunityChatRequest: () => void;
  onTranslatorRequest: () => void;
  onTourPackagesRequest: () => void;
  onActivityRequest: () => void;
  onPermitRequest: () => void;
  onHikingRequest: () => void;
  disabled: boolean;
  onViewResults: () => void;
  activeCabRide: ActiveCabRide | null;
  visitedPlacesCount: number;
  permitRequestsCount: number;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({ onSearch, onCabBooking, onScanRequest, onCommunityChatRequest, onTranslatorRequest, onTourPackagesRequest, onActivityRequest, onPermitRequest, onHikingRequest, disabled, onViewResults, activeCabRide, visitedPlacesCount, permitRequestsCount, activeCategory, setActiveCategory }) => {
  const baseQuery = "List the top 10 places. For each place, use this exact format on separate lines:\\n1. [Place Name]\\nRating: [Rating out of 5, or 'N/A']\\nImageURL: [A publicly accessible, non-expiring URL to a high-quality, relevant photo of the place. Prioritize official sources, Wikimedia Commons, or Unsplash.]\\nDescription: [A brief, one to two-sentence description of the place.]";
  
  const activityCount = (activeCabRide ? 1 : 0) + visitedPlacesCount + permitRequestsCount;
  
  const categories = [
    { label: "Restaurants", icon: <RestaurantIcon />, action: () => onSearch(`Find popular restaurants. ${baseQuery}`), imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop", description: "Discover top-rated dining spots and culinary delights near you.", actionLabel: "Find Restaurants" },
    { label: "Hotels", icon: <HotelIcon />, action: () => onSearch(`Find highly-rated hotels. ${baseQuery}`), imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop", description: "Find the perfect place to stay, from luxury resorts to cozy inns.", actionLabel: "Search Hotels" },
    { label: "Tourist Sites", icon: <TouristIcon />, action: () => onSearch(`Show me historic and tourist places. ${baseQuery}`), imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800&auto=format&fit=crop", description: "Explore landmarks, historical sites, and popular attractions.", actionLabel: "Explore Sites" },
    { label: "Book a Cab", icon: <CabIcon />, action: onCabBooking, imageUrl: "https://images.unsplash.com/photo-1570027224439-2212d59046c0?q=80&w=800&auto=format&fit=crop", notificationCount: activeCabRide ? 1 : 0, description: "Get a ride quickly and easily to your next destination.", actionLabel: "Book a Ride" },
    { label: "Hiking Trails", icon: <HikingIcon />, action: onHikingRequest, imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop", description: "Discover scenic hiking trails and nature walks in the area.", actionLabel: "Find Trails" },
    { label: "Community", icon: <CommunityIcon />, action: onCommunityChatRequest, imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop", description: "Connect with other explorers and share tips in the local chat.", actionLabel: "Open Chat" },
    { label: "Scan QR", icon: <QRIcon />, action: onScanRequest, imageUrl: "https://images.unsplash.com/photo-1593431196853-f72834a3f365?q=80&w=800&auto=format&fit=crop", description: "Scan QR codes on landmarks to instantly learn about their history.", actionLabel: "Open Scanner" },
    { label: "Translator", icon: <TranslatorIcon />, action: onTranslatorRequest, imageUrl: "https://images.unsplash.com/photo-1528242621338-c523d40f8b3c?q=80&w=800&auto=format&fit=crop", description: "Communicate effortlessly with real-time voice translation.", actionLabel: "Start Translating" },
    { label: "Tours", icon: <TourPackagesIcon />, action: onTourPackagesRequest, imageUrl: "https://images.unsplash.com/photo-1542296332-9e5436955215?q=80&w=800&auto=format&fit=crop", description: "Browse and book curated tour packages for a memorable experience.", actionLabel: "View Tours" },
    { label: "Permits", icon: <ShieldIcon />, action: onPermitRequest, imageUrl: "https://images.unsplash.com/photo-1589211326463-548c7c7f4277?q=80&w=800&auto=format&fit=crop", notificationCount: permitRequestsCount, description: "Apply for permits to visit restricted or protected historical sites.", actionLabel: "Apply for Permit" },
    { label: "My Activity", icon: <ActivityIcon />, action: onActivityRequest, notificationCount: activityCount, imageUrl: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop", description: "View your active rides, booked tours, and visited places all in one spot.", actionLabel: "View Activity" },
  ];

  const activeCategoryData = categories.find(c => c.label === activeCategory);
  
  const handleGridButtonClick = (category: (typeof categories)[0]) => {
    setActiveCategory(category.label);
    const isSearchCategory = ["Restaurants", "Hotels", "Tourist Sites"].includes(category.label);
    if (isSearchCategory) {
        category.action();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
      <div className={`relative transition-all duration-500 ease-in-out ${activeCategory ? 'h-[45vh] min-h-[320px] md:h-[400px]' : 'min-h-[60vh] md:min-h-[400px]'}`}>
        {/* Grid View */}
        <div className={`transition-all duration-300 ease-in-out ${activeCategory ? 'opacity-0 scale-95 invisible' : 'opacity-100 scale-100 visible'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat) => {
              // Hiking trails feature is currently unavailable
              const isHikingUnavailable = cat.label === "Hiking Trails";
              return (
              <GridButton 
                key={cat.label}
                label={cat.label}
                icon={cat.icon}
                imageUrl={cat.imageUrl}
                onClick={() => handleGridButtonClick(cat)} 
                disabled={disabled || isHikingUnavailable}
                notificationCount={cat.notificationCount}
                title={isHikingUnavailable ? "Feature unavailable: Service not configured." : undefined}
              />
            )})}
          </div>
        </div>

        {/* Banner View */}
        {activeCategoryData && (
          <ExpandedCategoryBanner
              category={activeCategoryData}
              onBack={() => setActiveCategory(null)}
              onViewResults={onViewResults}
              isActive={!!activeCategory}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryButtons;