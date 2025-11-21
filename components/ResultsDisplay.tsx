import React, { useMemo, useState, useEffect } from 'react';
import type { GroundingChunk, GeoLocation, Place } from '../types';
import StarRating from './StarRating';
import { verifyRestaurant } from '../services/restaurantService';
import { verifyTouristSite } from '../services/touristSiteService';

const UNSPLASH_ACCESS_KEY = 'TLtUZJ4w6ajfAfIRQavHQwOdl_kSKJyNArwLEmquhUQ';

async function fetchImageForPlace(query: string): Promise<string | null> {
    if (!UNSPLASH_ACCESS_KEY) {
        console.error('Unsplash Access Key is missing.');
        return null;
    }
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Unsplash API error: ${response.status} ${response.statusText}`, errorText);
            return null;
        }
        const data = await response.json();
        return data.results?.[0]?.urls?.regular ?? null;
    } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        return null;
    }
}

interface ResultsDisplayProps {
  response: string | null;
  groundingChunks: GroundingChunk[];
  location: GeoLocation | null;
  onPlaceSelect: (place: Place) => void;
  onChatRequest: (place: Place) => void;
  visitedPlaces: string[];
  isTourSearch?: boolean;
  isHotelSearch?: boolean;
  isRestaurantSearch?: boolean;
  isTouristSiteSearch?: boolean;
}

const ImagePlaceholder = () => (
  <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative border border-black/10 dark:border-white/10">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary opacity-30" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  </div>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.44 6.44 0 014.271.572 7.94 7.94 0 004.965 0 6.44 6.44 0 014.271-.572l1.657.348V2.75a.75.75 0 00-1.5 0v4.392l-1.657.348a6.44 6.44 0 01-4.271-.572 7.94 7.94 0 00-4.965 0 6.44 6.44 0 01-4.271.572L3.5 7.142V2.75z" />
    </svg>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  response, 
  groundingChunks, 
  location, 
  onPlaceSelect, 
  onChatRequest, 
  visitedPlaces, 
  isTourSearch = false, 
  isHotelSearch = false,
  isRestaurantSearch = false,
  isTouristSiteSearch = false
}) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});
  const [verifiedRestaurants, setVerifiedRestaurants] = useState<Record<string, boolean>>({});
  const [verifiedTouristSites, setVerifiedTouristSites] = useState<Record<string, boolean>>({});

  const parsedPlaces: Place[] = useMemo(() => {
    if (!response || groundingChunks.length === 0) return [];

    const parsedTextPlaces: { name: string; rating: number | null; imageUrl: string | null; description: string | null; }[] = [];
    const placeBlocks = response.split(/\n\s*(?=\d+\.\s*)/).filter(block => block.trim() !== '');

    for (const block of placeBlocks) {
      const nameMatch = block.match(/^\d+\.\s*(.*?)\n/);
      if (!nameMatch) continue;
      const name = nameMatch[1].trim();

      const ratingMatch = block.match(/Rating:\s*((\d(?:\.\d)?)|N\/A)/i);
      let rating: number | null = null;
      if (ratingMatch && ratingMatch[1]) {
        if (ratingMatch[1].toUpperCase() === 'N/A') {
          rating = null;
        } else {
          const parsedRating = parseFloat(ratingMatch[1]);
          if (!isNaN(parsedRating)) {
            rating = parsedRating;
          }
        }
      }

      const imageUrlMatch = block.match(/ImageURL:\s*(https?:\/\/[^\s]+)/i);
      const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null;

      const descriptionMatch = block.match(/Description:\s*(.*)/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : null;

      if (name) {
        parsedTextPlaces.push({ name, rating, imageUrl, description });
      }
    }

    return groundingChunks.map(chunk => {
      const title = chunk.maps.title;

      const matchedTextPlace = parsedTextPlaces.find(p =>
        title.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(title.toLowerCase())
      );

      return {
        title: title,
        uri: chunk.maps.uri,
        rating: matchedTextPlace?.rating ?? null,
        imageUrl: matchedTextPlace?.imageUrl ?? null,
        description: matchedTextPlace?.description ?? 'No description available.',
      };
    }).filter(place => place.title);
  }, [response, groundingChunks]);

  useEffect(() => {
    parsedPlaces.forEach(place => {
        // Check if the image has not been fetched yet
        if (imageUrls[place.title] === undefined) {
             // Set a placeholder value (null) to indicate fetching has started and prevent re-fetching
            setImageUrls(prev => ({ ...prev, [place.title]: null }));
            fetchImageForPlace(place.title).then(url => {
                if (url) {
                    setImageUrls(prev => ({ ...prev, [place.title]: url }));
                }
            });
        }
        
        // Check if restaurant verification has not been done yet
        if (verifiedRestaurants[place.title] === undefined && isRestaurantSearch) {
            // Set a placeholder value (false) to indicate verification has started
            setVerifiedRestaurants(prev => ({ ...prev, [place.title]: false }));
            verifyRestaurant(place.title).then(isVerified => {
                setVerifiedRestaurants(prev => ({ ...prev, [place.title]: isVerified }));
            });
        }
        
        // Check if tourist site verification has not been done yet
        if (verifiedTouristSites[place.title] === undefined && isTouristSiteSearch) {
            // Set a placeholder value (false) to indicate verification has started
            setVerifiedTouristSites(prev => ({ ...prev, [place.title]: false }));
            verifyTouristSite(place.title).then(isVerified => {
                setVerifiedTouristSites(prev => ({ ...prev, [place.title]: isVerified }));
            });
        }
    });
  }, [parsedPlaces, imageUrls, verifiedRestaurants, verifiedTouristSites, isRestaurantSearch, isTouristSiteSearch]);

  const getDirectionsUrl = (placeTitle: string) => {
    if (!location) return '#';
    const destination = encodeURIComponent(placeTitle);
    return `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${destination}`;
  };

  // Determine if this is a special booking search (restaurant, hotel, or tourist site)
  const isSpecialBookingSearch = isRestaurantSearch || isHotelSearch || isTouristSiteSearch;

  if (parsedPlaces.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold text-primary mb-4">Discoveries Near You</h3>
      <div className="space-y-4">
        {parsedPlaces.map((place, index) => {
          const isVisited = visitedPlaces.includes(place.title);
          const imageUrl = imageUrls[place.title];
          // Check if this place is a verified restaurant
          const isVerifiedRestaurant = verifiedRestaurants[place.title] ?? false;
          // Check if this place is a verified tourist site
          const isVerifiedTouristSite = verifiedTouristSites[place.title] ?? false;

          return (
            <div 
              key={place.uri} 
              className="relative p-4 glass-pane flex flex-col sm:flex-row gap-4 animate-item-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isVisited && (
                <div className="absolute top-3 right-3 text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full z-10 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Visited
                </div>
              )}
              {imageUrl ? (
                  <img 
                      src={imageUrl} 
                      alt={`Image of ${place.title}`} 
                      className="w-full sm:w-32 h-32 flex-shrink-0 object-cover rounded-2xl bg-black/10 dark:bg-white/10"
                  />
              ) : (
                  <ImagePlaceholder />
              )}
              
              <div className="flex-grow flex flex-col sm:justify-between">
                <div>
                  <button
                    onClick={() => onPlaceSelect(place)}
                    className="font-semibold text-primary hover:text-[color:var(--accent-color)] text-lg text-left"
                  >
                    {place.title}
                  </button>
                  {place.rating !== null && (
                    <div className="flex items-center mt-1">
                      <StarRating rating={place.rating} />
                      <span className="ml-2 text-sm text-secondary">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 sm:mt-0 flex flex-wrap gap-3">
                  {/* For special booking searches, show booking button instead of directions */}
                  {isSpecialBookingSearch ? (
                    <>
                      {/* Show Book Now button for all restaurants in restaurant search */}
                      {isRestaurantSearch && (
                        <button
                          onClick={() => onPlaceSelect(place)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </button>
                      )}
                      {/* Show Book Tickets button for all tourist sites in tourist site search */}
                      {isTouristSiteSearch && (
                        <button
                          onClick={() => onPlaceSelect(place)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Tickets
                        </button>
                      )}
                      {/* Show Book Hotel button for all hotels in hotel search */}
                      {isHotelSearch && (
                        <button
                          onClick={() => onPlaceSelect(place)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          Book Hotel
                        </button>
                      )}
                      {(isHotelSearch || isRestaurantSearch || isTouristSiteSearch) && (
                        <button
                          onClick={() => onPlaceSelect(place)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-secondary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25L9 5.25m3 3l1.5-3M4.5 8.25h15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Book a Cab
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <a
                        href={getDirectionsUrl(place.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Get directions to ${place.title}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-primary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Directions
                      </a>
                      <button
                        onClick={() => onPlaceSelect(place)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-secondary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 8.25L9 5.25m3 3l1.5-3M4.5 8.25h15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Book a Cab
                      </button>
                    </>
                  )}
                  <button
                      onClick={() => onChatRequest(place)}
                      aria-label={`Ask Explorer AI about ${place.title}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-secondary"
                  >
                      <ChatIcon />
                      Ask Explorer AI
                  </button>
                </div>
              </div>
            </div>
        )})}
      </div>
    </div>
  );
};

export default ResultsDisplay;