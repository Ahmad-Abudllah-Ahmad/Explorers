

import React, { useState, useEffect } from 'react';
import type { Place, GeoLocation } from '../types';
import StarRating from './StarRating';

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


interface DetailsModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onScanRequest: () => void;
  onChatRequest: (place: Place) => void;
  onBookCab: (place: Place) => void;
  onMarkAsVisited: (placeTitle: string) => void;
  isVisited: boolean;
  location: GeoLocation | null;
}

const getDirectionsUrl = (placeTitle: string, location: GeoLocation | null) => {
    if (!location) return '#';
    const destination = encodeURIComponent(placeTitle);
    return `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${destination}`;
};

const CabIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25L9 5.25m3 3l1.5-3M4.5 8.25h15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const VisitedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const placeholderSvg = `data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a1a1aa'%3E%3Cpath fill-rule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clip-rule='evenodd' /%3E%3C/svg%3E`;

const DetailsModal: React.FC<DetailsModalProps> = ({ place, isOpen, onClose, onScanRequest, location, onChatRequest, onBookCab, onMarkAsVisited, isVisited }) => {
  const [isRendering, setIsRendering] = useState(isOpen);
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);

  useEffect(() => {
      if (isOpen) {
          setIsRendering(true);
      } else {
          setTimeout(() => setIsRendering(false), 400); // Match animation duration
      }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && place) {
        setDisplayImageUrl(null); // Show placeholder initially while fetching
        fetchImageForPlace(place.title).then(url => {
            setDisplayImageUrl(url);
        });
    }
  }, [isOpen, place]);


  if (!isRendering || !place) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-end p-0 sm:items-center sm:p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
            <img 
              src={displayImageUrl || placeholderSvg} 
              alt={`Image of ${place.title}`} 
              className="w-full h-64 object-cover bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
              onError={(e) => { e.currentTarget.src = placeholderSvg; }}
            />
            <button
                onClick={onClose}
                aria-label="Close details"
                className="absolute top-4 right-4 close-button-glass"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <h2 id="modal-title" className="text-2xl font-bold text-primary">{place.title}</h2>
          {place.rating !== null && (
            <div className="flex items-center mt-2">
              <StarRating rating={place.rating} />
              <span className="ml-2 text-sm text-secondary">{place.rating.toFixed(1)}</span>
            </div>
          )}
          <p className="mt-4 text-secondary">
            {place.description}
          </p>
        </div>
        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-3 justify-start items-center">
             <a
              href={getDirectionsUrl(place.title, location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 font-semibold glass-button-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Directions
            </a>
            <button
                onClick={() => onBookCab(place)}
                className="inline-flex items-center justify-center px-4 py-2 font-semibold text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 rounded-xl hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-colors duration-200"
            >
                <CabIcon />
                Book a Cab
            </button>
            <button
                onClick={() => onMarkAsVisited(place.title)}
                className={`inline-flex items-center justify-center px-4 py-2 font-semibold rounded-xl transition-colors duration-200 ${isVisited ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30'}`}
            >
                <VisitedIcon />
                {isVisited ? 'Visited' : 'Mark as Visited'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;