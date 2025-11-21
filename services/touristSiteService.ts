// Tourist site verification service
// This service verifies if a place is a tourist site or heritage site using an API key

// In a real implementation, you would set this in your .env.local file
declare const process: {
  env: {
    VITE_TOURIST_SITE_API_KEY?: string;
  };
};

const TOURIST_SITE_API_KEY = process.env.VITE_TOURIST_SITE_API_KEY || 'YOUR_TOURIST_SITE_API_KEY_HERE';

/**
 * Verify if a place is a tourist site or heritage site using an API key
 * @param placeName - Name of the place to verify
 * @returns Promise<boolean> - True if the place is verified as a tourist site
 */
export async function verifyTouristSite(placeName: string): Promise<boolean> {
  // If no API key is configured, fall back to keyword-based verification
  if (!TOURIST_SITE_API_KEY || TOURIST_SITE_API_KEY === 'YOUR_TOURIST_SITE_API_KEY_HERE') {
    console.warn('No tourist site API key configured. Using fallback keyword verification.');
    
    // Fallback to keyword-based verification
    const touristSiteKeywords = [
      'tourist', 'heritage', 'historic', 'landmark', 'attraction', 'monument', 
      'museum', 'fort', 'palace', 'castle', 'ruins', 'archaeological', 'cultural',
      'site', 'garden', 'park', 'zoo', 'aquarium', 'exhibition', 'gallery',
      'shrine', 'temple', 'mosque', 'church', 'synagogue', 'cathedral',
      'minar', 'tomb', 'mausoleum', 'memorial', 'statue', 'sculpture',
      'badshahi', 'lahore', 'shahi', 'qila', 'walled', 'masjid', 'bagh'
    ];
    
    const lowerPlaceName = placeName.toLowerCase();
    
    // Check if any tourist site keyword is in the place name
    return touristSiteKeywords.some(keyword => lowerPlaceName.includes(keyword));
  }
  
  // In a real implementation with a proper API, you would make an API call like:
  /*
  try {
    const response = await fetch(`https://tourist-site-verification-api.com/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOURIST_SITE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        placeName: placeName
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.isVerifiedTouristSite === true;
  } catch (error) {
    console.error('Error verifying tourist site:', error);
    // Fall back to keyword-based verification if API fails
    return isTouristSiteByKeywords(placeName);
  }
  */
  
  // For demonstration, we'll just return true for certain known tourist sites
  // In a real implementation, replace this with actual API verification
  const knownTouristSites = [
    'Badshahi Mosque',
    'Lahore Fort',
    'Shalimar Gardens',
    'Minar-e-Pakistan',
    'Walled City of Lahore',
    'Sheikhupura Fort',
    'Taxila Museum',
    'Rohtas Fort',
    'Hiran Minar',
    'Tomb of Jahangir',
    'Tomb of Nur Jahan',
    'Tomb of Asif Khan',
    'Tomb of Anarkali',
    'Tomb of Zeenat Mahal',
    'Tomb of Dai Anga',
    'Tomb of Sharif Un-Nissa',
    'Tomb of Muhammad Iqbal',
    'Tomb of Allama Iqbal',
    'Data Darbar',
    'Nankana Sahib',
    'Golden Temple',
    'Wagah Border',
    'Chauburji',
    'Naulakha Pavilion',
    'Moti Masjid',
    'Rang Mahal',
    'Diwan-e-Aam',
    'Diwan-e-Khas',
    'Nishan-e-Pakistan',
    'Jallianwala Bagh',
    'Gurdwara Dera Sahib',
    'Gurdwara Janam Asthan',
    'Katras Mosque',
    'Begum Shahi Mosque',
    'Chungi Amar Singh Haveli',
    'Lahore Museum',
    'Mayo School of Arts',
    'Model Town Park',
    'Race Course Park',
    'Zoo Lahore'
  ];
  
  return knownTouristSites.some(site => 
    placeName.toLowerCase().includes(site.toLowerCase()) ||
    site.toLowerCase().includes(placeName.toLowerCase())
  );
}

// Helper function for keyword-based verification (fallback)
function isTouristSiteByKeywords(placeName: string): boolean {
  const touristSiteKeywords = [
    'tourist', 'heritage', 'historic', 'landmark', 'attraction', 'monument', 
    'museum', 'fort', 'palace', 'castle', 'ruins', 'archaeological', 'cultural',
    'site', 'garden', 'park', 'zoo', 'aquarium', 'exhibition', 'gallery',
    'shrine', 'temple', 'mosque', 'church', 'synagogue', 'cathedral',
    'minar', 'tomb', 'mausoleum', 'memorial', 'statue', 'sculpture',
    'badshahi', 'lahore', 'shahi', 'qila', 'walled', 'masjid', 'bagh'
  ];
  
  const lowerPlaceName = placeName.toLowerCase();
  
  // Check if any tourist site keyword is in the place name
  return touristSiteKeywords.some(keyword => lowerPlaceName.includes(keyword));
}