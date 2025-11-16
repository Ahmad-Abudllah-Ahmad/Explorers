
import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { getAutocompleteSuggestions } from '../services/geminiService';
import type { GeoLocation } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  location: GeoLocation | null;
}

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);


const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSubmit, isLoading, location }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 2 && location) {
        setIsSuggestionsLoading(true);
        const result = await getAutocompleteSuggestions(debouncedQuery, location);
        setSuggestions(result);
        setIsSuggestionsLoading(false);
      } else {
        setSuggestions([]);
      }
    };

    if (showSuggestions) {
      fetchSuggestions();
    }
  }, [debouncedQuery, location, showSuggestions]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Trigger search immediately on suggestion click
    setTimeout(() => onSubmit(), 0);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if(!showSuggestions) {
          setShowSuggestions(true);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSubmit();
    }
  };
  
  const handleSearchClick = () => {
    setShowSuggestions(false);
    onSubmit();
  }

  return (
    <div className="relative">
      <div className="flex items-center group">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
          placeholder="Search for places..."
          disabled={isLoading}
          autoComplete="off"
          className="glass-input flex-grow w-full pl-5 pr-14 py-4 text-base text-primary placeholder:text-secondary rounded-full transition duration-200 disabled:opacity-50"
        />
        <button
          onClick={handleSearchClick}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex-shrink-0 w-11 h-11 flex items-center justify-center glass-button-primary rounded-full disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          aria-label="Search"
        >
          {isLoading ? <LoadingSpinner /> : <SearchIcon />}
        </button>
      </div>
      {showSuggestions && (suggestions.length > 0 || isSuggestionsLoading) && (
        <ul className="absolute z-10 w-full mt-2 glass-pane max-h-60 overflow-y-auto">
          {isSuggestionsLoading && <li className="px-4 py-3 text-sm text-secondary">Searching...</li>}
          {!isSuggestionsLoading && suggestions.map((s, i) => (
            <li 
              key={i} 
              onMouseDown={() => handleSuggestionClick(s)}
              className="px-4 py-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-primary"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;