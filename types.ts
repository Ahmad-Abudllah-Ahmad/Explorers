export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  maps: {
    uri: string;
    title: string;
  };
}

export interface Place {
  title: string;
  uri: string;
  rating: number | null;
  imageUrl: string | null;
  description: string | null;
}

export interface ChatPost {
  id: number;
  author: string;
  avatarUrl: string;
  content: string;
  imageUrl?: string;
  placeRecommendation?: {
    name: string;
    rating: number;
  };
  distance: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface ConversationEntry {
  id: number;
  speaker: 'me' | 'them';
  original: string;
  translated: string;
  isFinal: boolean;
}

export interface TourPackage {
  id: number;
  title: string;
  agency: string;
  price: number;
  imageUrl: string;
  facilities: string[];
  details: string[];
}

export type VehicleType = 'bike' | 'rickshaw' | 'car' | 'ac_car';

export interface ActiveCabRide {
  destination: string;
  vehicle: VehicleType;
  fare: number;
  etaMinutes: number;
  bookingTimestamp: number;
}

export interface PermitRequest {
  id: number;
  siteName: string;
  fullName: string;
  idNumber: string; // CNIC or Passport
  nationality: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionTimestamp: number;
}

export interface KomootGalleryImage {
  src: string;
  type: string;
  src_original: string;
}

export interface KomootRoute {
  id: number;
  url: string;
  title: string;
  summary: string;
  distance: number;
  duration: number;
  difficulty: string;
  gallery: KomootGalleryImage[];
}

// FIX: Added missing properties to the SpotifyTrack interface to match the Spotify API response.
// The album object now includes a 'name', and each image object in the 'images' array
// now includes 'width' and 'height' properties. This resolves type errors in
// CabBookingModal.tsx where these properties were being accessed.
export interface SpotifyTrack {
  uri: string;
  id: string;
  type: 'track' | 'episode' | 'ad';
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number; }[];
  };
}
