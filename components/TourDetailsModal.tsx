import React from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';

interface TourPackage {
  id: number;
  title: string;
  agency: string;
  price: number;
  imageUrl?: string;
  features: string[];
  description?: string;
  itinerary?: string[];
  rating?: number;
  reviews?: number;
}

interface TourDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourPackage: TourPackage;
  onBookNow: () => void;
  onAskAI?: (tour: TourPackage) => void;
  position?: { top: number; left: number; width: number; height: number } | null;
  currentUser?: User | null;
  onAuthRequired?: () => void;
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
  isOpen,
  onClose,
  tourPackage,
  onBookNow,
  onAskAI,
  position,
  currentUser,
  onAuthRequired
}) => {
  if (!isOpen) return null;

  const modalStyle = position ? (() => {
    const modalWidth = Math.min(window.innerWidth * 0.9, 672); // 90vw or 42rem (672px)
    const modalMaxHeight = window.innerHeight * 0.85; // 85vh
    const cardCenterX = position.left + position.width / 2;
    const cardCenterY = position.top + position.height / 2;

    // Calculate desired left position (card center - half modal width)
    let leftPosition = cardCenterX - modalWidth / 2;

    // Clamp horizontally to viewport with 16px padding on each side
    const padding = 16;
    leftPosition = Math.max(padding, Math.min(leftPosition, window.innerWidth - modalWidth - padding));

    // Calculate desired top position (card center - half modal height estimate)
    // Using maxHeight as estimate since actual height depends on content
    let topPosition = cardCenterY - modalMaxHeight / 2;

    // Clamp vertically to viewport with padding
    topPosition = Math.max(padding, Math.min(topPosition, window.innerHeight - modalMaxHeight - padding));

    return {
      position: 'fixed' as const,
      top: `${topPosition}px`,
      left: `${leftPosition}px`,
      transform: 'none',
      width: '90vw',
      maxWidth: '42rem',
      maxHeight: '85vh',
      margin: 0
    };
  })() : {};

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex ${position ? '' : 'justify-center items-center'} p-4 modal-overlay animate-overlay-in`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-pane w-full max-w-2xl p-6 relative animate-slide-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={modalStyle}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            {tourPackage.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {tourPackage.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden h-64 w-full">
            <img
              src={tourPackage.imageUrl}
              alt={tourPackage.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">About this Tour</h3>
            <p className="text-secondary leading-relaxed">
              {tourPackage.description || "Experience the best of what this location has to offer with our expertly guided tour. Perfect for families, couples, and solo travelers alike."}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Itinerary</h3>
            <div className="space-y-3">
              {(tourPackage.itinerary || [
                "Start with a visit to the main attraction",
                "Explore traditional markets and food stalls",
                "Sample authentic local cuisine",
                "Visit historical landmarks",
                "Return to pickup point"
              ]).map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Included Features</h3>
            <div className="flex flex-wrap gap-2">
              {tourPackage.features.map((feature, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.floor(tourPackage.rating || 4.5) ? 'fill-current' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm text-secondary">
                {tourPackage.rating || 4.8} ({tourPackage.reviews || 120} reviews)
              </span>
            </div>
            <p className="mt-2 text-secondary text-sm">
              Verified Company: This tour operator is verified by LahoreHub with transparent pricing and excellent customer service.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => {
                // Auth guard: require login for booking
                if (!currentUser) {
                  onAuthRequired?.();
                  return;
                }
                onBookNow();
              }}
              className="flex-1 px-4 py-3 glass-button-primary font-semibold flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Now - PKR {tourPackage.price.toLocaleString()}
            </button>

            {onAskAI && (
              <button
                onClick={() => onAskAI(tourPackage)}
                className="px-6 py-3 glass-button-secondary flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Ask AI
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TourDetailsModal;