import { useState, useEffect, useRef, useCallback } from 'react';
import type { GeoLocation } from '../types';
import { reverseGeocode } from '../services/geminiService';

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = useRef(true);
  const locationFetchedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSuccess = (position: GeolocationPosition) => {
    if (!isMountedRef.current) return;

    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    
    setLocation(newLocation);
    setError(null);
    if (isLoading) {
      setIsLoading(false);
    }

    if (!locationFetchedRef.current) {
        locationFetchedRef.current = true;
        reverseGeocode(newLocation)
          .then(addr => {
            if (isMountedRef.current) {
              setAddress(addr);
            }
          })
          .catch(err => {
            console.error("Reverse geocoding failed", err);
          });
    }
  };

  const handleError = (posError: GeolocationPositionError) => {
    if (!isMountedRef.current) return;
    setIsLoading(false);
     switch (posError.code) {
        case posError.PERMISSION_DENIED:
            setError("Location permission denied. Please enable it in your browser settings to use this app.");
            break;
        case posError.POSITION_UNAVAILABLE:
            setError("Location information is unavailable. Could not get a GPS fix.");
            break;
        case posError.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
        default:
            setError("An unknown error occurred while fetching location.");
            break;
    }
  };
  
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (isMountedRef.current) {
        setError('Geolocation is not supported by your browser.');
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      }
    );
  }, []);


  return { location, address, error, isLoading, requestLocation };
};