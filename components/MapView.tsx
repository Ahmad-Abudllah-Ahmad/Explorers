import React from 'react';
import type { GeoLocation } from '../types';

interface MapViewProps {
  apiKey: string;
  query: string;
  center: GeoLocation;
}

const MapView: React.FC<MapViewProps> = ({ apiKey, query, center }) => {
  const mapSrc = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&center=${center.latitude},${center.longitude}&zoom=14`;

  return (
    <div className="mt-6 animate-fade-in">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">Map View</h3>
        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
            <iframe
                title="Nearby Places Map"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    </div>
  );
};

export default MapView;
