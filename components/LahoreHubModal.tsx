import React from 'react';
import { User } from '../types';

interface LahoreHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTourSearch: () => void;
  onCustomTourRequest: () => void;
  currentUser?: User | null;
  onAuthRequired?: () => void;
}

const LahoreHubModal: React.FC<LahoreHubModalProps> = ({
  isOpen,
  onClose,
  onTourSearch,
  onCustomTourRequest,
  currentUser,
  onAuthRequired
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-overlay-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="glass-pane w-full max-w-md p-6 animate-slide-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Make Custom Tour Creation</h2>
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

        <div className="space-y-4">
          <p className="text-secondary">
            Lahore's premier tourism platform connecting visitors with verified local service providers.
          </p>

          {/* User App Section */}
          <div className="mt-4">
            <h3 className="font-bold text-lg text-primary mb-2">User App</h3>
            <p className="text-sm text-secondary mb-3">Discover and book verified tourism experiences</p>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  // Auth guard: require login
                  if (!currentUser) {
                    onAuthRequired?.();
                    return;
                  }
                  onClose();
                  onTourSearch();
                }}
                className="glass-button-primary py-3 px-4 text-left rounded-xl"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="font-semibold">Pre-Made Tours</h3>
                    <p className="text-sm text-secondary">Browse verified tour packages</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  // Auth guard: require login
                  if (!currentUser) {
                    onAuthRequired?.();
                    return;
                  }
                  onClose();
                  onCustomTourRequest();
                }}
                className="glass-button-primary py-3 px-4 text-left rounded-xl"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="font-semibold">Custom Tours</h3>
                    <p className="text-sm text-secondary">Request personalized experiences</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <h3 className="font-bold text-blue-400 mb-2">LahoreHub Benefits</h3>
            <ul className="text-sm space-y-1 text-secondary">
              <li>• Verified companies with transparent pricing</li>
              <li>• QR-based booking confirmation for security</li>
              <li>• Performance tracking for partners</li>
              <li>• Smooth booking workflows for users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LahoreHubModal;