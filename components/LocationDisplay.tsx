import React from 'react';
import type { GeoLocation } from '../types';

interface LocationDisplayProps {
  location: GeoLocation | null;
  address: string | null;
  error: string | null;
  isLoading: boolean;
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({ location, address, error, isLoading }) => {
  const Icon = ({ path, className }: { path: string; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
      <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
  );

  let content;

  if (isLoading) {
    content = (
      <>
        <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zM10 2a6 6 0 100 12 6 6 0 000-12z" className="animate-pulse" />
        <span className="ml-2">Acquiring your location...</span>
      </>
    );
  } else if (error) {
    content = (
      <>
        <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        <span className="ml-2">{error}</span>
      </>
    );
  } else if (location) {
    content = (
      <>
        <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        <span className="ml-2 font-medium">
          {address || `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}
        </span>
      </>
    );
  } else {
    content = <span>Location not available.</span>;
  }

  const baseClasses = "flex items-center justify-center text-sm px-4 py-2 rounded-full mb-4 ";
  const colorClasses = isLoading
    ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
    : error
    ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
    : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";

  return <div className={`${baseClasses} ${colorClasses}`}>{content}</div>;
};

export default LocationDisplay;
