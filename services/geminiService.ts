import { GoogleGenAI, Type } from '@google/genai';
import type { GeoLocation, GroundingChunk } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleApiError = (error: unknown) => {
    console.error('Error with Gemini API:', error);
    let errorMessage = 'An unknown error occurred.';

    if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = String(error);
    }

    const jsonMatch = errorMessage.match(/{.*}/);
    if (jsonMatch) {
        try {
            const parsedError = JSON.parse(jsonMatch[0]);
            const message = parsedError?.error?.message;
            const status = parsedError?.error?.status;
            
            if ((message && message.toLowerCase().includes('quota')) || status === 'RESOURCE_EXHAUSTED') {
                throw new Error("You've exceeded your daily request limit for the Gemini API. Please check your plan and billing details, or try again tomorrow.");
            }
            if (message) {
                 throw new Error(`AI Error: ${message}`);
            }
        } catch (e) {
            // JSON parsing failed, fall back to string matching
        }
    }

    if (errorMessage.toLowerCase().includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
         throw new Error("You've exceeded your daily request limit for the Gemini API. Please check your plan and billing details, or try again tomorrow.");
    }
    
    throw new Error('Failed to get a response from the AI model. Please check your connection or API key.');
};

export async function fetchNearbyPlaces(query: string, location: GeoLocation) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          },
        },
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const mapChunks = groundingChunks.filter(chunk => chunk.maps && chunk.maps.uri && chunk.maps.title);
    
    return { text, groundingChunks: mapChunks as GroundingChunk[] };
  } catch (error) {
    handleApiError(error);
    // This line is unreachable because handleApiError throws, but it satisfies TypeScript's strict checks.
    throw error;
  }
}

export async function calculateDistance(origin: GeoLocation, destination: string): Promise<number | null> {
    if (!destination.trim()) return null;
    try {
        const prompt = `What is the driving distance in kilometers from latitude ${origin.latitude}, longitude ${origin.longitude} to "${destination}"? Respond with only the numerical value, no units. For example: 12.5`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const distanceText = response.text.trim();
        const distance = parseFloat(distanceText);

        if (!isNaN(distance) && distance > 0) {
            return distance;
        }
        return null;
    } catch (error) {
        handleApiError(error);
        return null;
    }
}

export async function reverseGeocode(location: GeoLocation): Promise<string | null> {
    if (!location) return null;
    try {
        const prompt = `Provide the most precise, pinpoint, human-readable address for the GPS coordinates latitude ${location.latitude}, longitude ${location.longitude}. Focus on the exact street, building name, or specific landmark at these coordinates. Avoid general areas or cities. Be concise. For example: "123 Main Street", "On Johar Town Road", "At the entrance of Emporium Mall".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim().replace(/\.$/, ''); // Remove trailing period
    } catch (error) {
        handleApiError(error);
        return null;
    }
}

export async function getAutocompleteSuggestions(query: string, location: GeoLocation): Promise<string[]> {
    if (!query.trim() || !location) return [];
    try {
        const prompt = `Provide a JSON object with a "suggestions" key, containing an array of up to 5 relevant, real-world place name suggestions for an autocomplete search. The user is near latitude ${location.latitude}, longitude ${location.longitude} and is typing "${query}".`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A single place name suggestion.'
                            },
                            description: 'An array of place name suggestions.'
                        }
                    },
                    required: ['suggestions']
                }
            }
        });

        const jsonStr = response.text.trim();
        const jsonResponse = JSON.parse(jsonStr);

        if (jsonResponse.suggestions && Array.isArray(jsonResponse.suggestions)) {
            return jsonResponse.suggestions.map(s => String(s));
        }
        return [];
    } catch (error) {
        handleApiError(error);
        return [];
    }
}