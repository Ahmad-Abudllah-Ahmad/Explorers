import type { KomootRoute } from '../types';

// Mock implementation to prevent errors
export const APIFY_TOKEN_AVAILABLE = false;

// Mock function that returns an empty array to prevent errors
export const fetchKomootRoutes = async (locationName: string): Promise<KomootRoute[]> => {
    console.warn("Apify service is not available. Returning empty results.");
    return [];
};