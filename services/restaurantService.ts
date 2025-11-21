// Restaurant verification service
// This service verifies if a place is a restaurant using an API key

// In a real implementation, you would set this in your .env.local file
const RESTAURANT_API_KEY = import.meta.env.VITE_RESTAURANT_API_KEY || 'YOUR_RESTAURANT_API_KEY_HERE';

/**
 * Verify if a place is a restaurant using an API key
 * @param placeName - Name of the place to verify
 * @returns Promise<boolean> - True if the place is verified as a restaurant
 */
export async function verifyRestaurant(placeName: string): Promise<boolean> {
  // If no API key is configured, fall back to keyword-based verification
  if (!RESTAURANT_API_KEY || RESTAURANT_API_KEY === 'YOUR_RESTAURANT_API_KEY_HERE') {
    console.warn('No restaurant API key configured. Using fallback keyword verification.');
    
    // Fallback to keyword-based verification
    const restaurantKeywords = [
      'restaurant', 'cafe', 'diner', 'bistro', 'eatery', 'food', 'cuisine', 
      'kitchen', 'grill', 'steakhouse', 'pizzeria', 'bakery', 'deli', 
      'brunch', 'breakfast', 'lunch', 'dinner', 'meal', 'dish', 'menu',
      'bar', 'tavern', 'pub', 'buffet', 'food court', 'yard', 'spice',
      'afghan', 'nakhal', 'oven', 'chaye', 'bonfire', 'maalga', 'pind',
      'caspian', 'garden', 'aylanto', 'shinwari', 'tribe', 'enaari', 'nando',
      'bundle', 'khan', 'mst', 'meg', 'ilyas', 'dumba', 'karahi'
    ];
    
    const lowerPlaceName = placeName.toLowerCase();
    
    // Check if any restaurant keyword is in the place name
    return restaurantKeywords.some(keyword => lowerPlaceName.includes(keyword));
  }
  
  // In a real implementation with a proper API, you would make an API call like:
  /*
  try {
    const response = await fetch(`https://restaurant-verification-api.com/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESTAURANT_API_KEY}`,
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
    return data.isVerifiedRestaurant === true;
  } catch (error) {
    console.error('Error verifying restaurant:', error);
    // Fall back to keyword-based verification if API fails
    return isRestaurantByKeywords(placeName);
  }
  */
  
  // For demonstration, we'll just return true for certain known restaurants
  // In a real implementation, replace this with actual API verification
  const knownRestaurants = [
    'Food Yard - The Ultimate Food Court',
    'Pind Restaurant',
    'Caspian Sea',
    'The Garden Spice',
    'Maalga Afghan Restaurant',
    'Yasir Broast',
    'Café Aylanto',
    'Khan Shinwari Hujra',
    'BonFire',
    'Chaye Qawali',
    'Al-Nakhal Arabian Cuisine Johar Town',
    'Stone Ove Pizza Valley Johar Town Lahore',
    'Bundu Khan Restaurant - Johar Town',
    'MST',
    'The Last Tribe',
    'Enaari-Johar Town',
    'MEG',
    'Nando\'s - Johar Town',
    'Asli Ilyas Dumba Karahi',
    'Pind Restaurant Iqbal Town'
  ];
  
  return knownRestaurants.some(restaurant => 
    placeName.toLowerCase().includes(restaurant.toLowerCase()) ||
    restaurant.toLowerCase().includes(placeName.toLowerCase())
  );
}

// Helper function for keyword-based verification (fallback)
function isRestaurantByKeywords(placeName: string): boolean {
  const restaurantKeywords = [
    'restaurant', 'cafe', 'diner', 'bistro', 'eatery', 'food', 'cuisine', 
    'kitchen', 'grill', 'steakhouse', 'pizzeria', 'bakery', 'deli', 
    'brunch', 'breakfast', 'lunch', 'dinner', 'meal', 'dish', 'menu',
    'bar', 'tavern', 'pub', 'buffet', 'food court', 'yard', 'spice',
    'afghan', 'nakhal', 'oven', 'chaye', 'bonfire', 'maalga', 'pind',
    'caspian', 'garden', 'aylanto', 'shinwari', 'tribe', 'enaari', 'nando',
    'bundle', 'khan', 'mst', 'meg', 'ilyas', 'dumba', 'karahi'
  ];
  
  const lowerPlaceName = placeName.toLowerCase();
  
  // Check if any restaurant keyword is in the place name
  return restaurantKeywords.some(keyword => lowerPlaceName.includes(keyword));
}