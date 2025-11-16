
import React from 'react';

interface LocationPermissionPromptProps {
  onGrant: () => void;
  isLoading: boolean;
  error?: string | null;
}

const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({ onGrant, isLoading, error }) => {
  return (
    <div className="text-center flex flex-col items-center justify-center">
      {error && (
        <div className="mb-4 text-sm bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl relative" role="alert">
            {error}
        </div>
      )}
      <button
        onClick={onGrant}
        disabled={isLoading}
        className="glass-pane text-primary font-semibold px-6 py-3 flex items-center justify-center min-w-[200px] transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching...
          </>
        ) : (
          'Enable GPS Location'
        )}
      </button>
    </div>
  );
};

export default LocationPermissionPrompt;
