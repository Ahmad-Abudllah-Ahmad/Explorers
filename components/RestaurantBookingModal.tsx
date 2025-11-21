import React, { useState, useEffect } from 'react';
import type { Place, GeoLocation, RestaurantBooking } from '../types';
import QRCode from 'qrcode';

// --- QR Code Display Modal for Restaurant Booking ---
const RestaurantQRCodeModal: React.FC<{ 
  restaurantName: string; 
  onClose: () => void;
  qrCodeData: string;
}> = ({ restaurantName, onClose, qrCodeData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Parse the QR code data to display booking information
    try {
      const parsedData = JSON.parse(qrCodeData);
      setBookingData(parsedData);
    } catch (e) {
      console.error('Error parsing QR code data:', e);
    }
    
    // Generate QR code as data URL
    QRCode.toDataURL(qrCodeData, { width: 200 })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
  }, [qrCodeData]);

  return (
    <div
        className="fixed inset-0 z-[70] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        role="dialog"
        aria-modal="true"
    >
        <div
            className="glass-pane w-full max-w-md text-center p-8"
        >
            <div className="mx-auto mb-4 w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                {/* QR Code Display */}
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Reservation QR Code" className="w-32 h-32" />
                ) : (
                  <div className="text-center">
                    <div className="inline-block w-32 h-32 bg-white mb-2 grid grid-cols-10 gap-0.5 p-2">
                      {[...Array(100)].map((_, index) => (
                        <div 
                          key={index} 
                          className={Math.random() > 0.5 ? 'bg-black' : 'bg-white'}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Generating QR Code...</p>
                  </div>
                )}
            </div>
            <h2 className="text-2xl font-bold text-primary">Reservation Confirmed!</h2>
            <p className="mt-2 text-secondary">
                Your table reservation at "{restaurantName}" has been confirmed. Please show this QR code to the host upon arrival.
            </p>
            
            {bookingData && (
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-left">
                <h3 className="font-bold text-blue-400 mb-2">Booking Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-secondary">Guest:</span> {bookingData.guestName}</p>
                  <p><span className="text-secondary">Phone:</span> {bookingData.phone}</p>
                  <p><span className="text-secondary">Date:</span> {bookingData.date}</p>
                  <p><span className="text-secondary">Time:</span> {bookingData.time}</p>
                  {bookingData.mealType && (
                    <p><span className="text-secondary">Meal Type:</span> {bookingData.mealType.charAt(0).toUpperCase() + bookingData.mealType.slice(1)}</p>
                  )}
                  <p><span className="text-secondary">Guests:</span> {bookingData.adults} Adult{bookingData.adults !== 1 ? 's' : ''}{bookingData.children > 0 ? `, ${bookingData.children} Child${bookingData.children !== 1 ? 'ren' : ''}` : ''}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm font-mono break-words">{qrCodeData}</p>
            </div>
            <button
                onClick={onClose}
                className="mt-6 w-full px-5 py-3 glass-button-primary"
            >
                Done
            </button>
        </div>
    </div>
  );
};

// --- Restaurant Booking Form Modal ---
const RestaurantBookingForm: React.FC<{
    restaurant: Place;
    location: GeoLocation | null;
    onClose: () => void;
    onConfirm: (bookingData: any) => void;
}> = ({ restaurant, location, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        adults: '2',
        children: '0',
        mealType: 'dinner',
        date: '',
        time: '',
        specialRequests: '',
        bookCab: false // Add book cab checkbox
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set default date to today
    useState(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, date: today }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, phone, date, time } = formData;
        if (!fullName || !phone || !date || !time) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            onConfirm(formData);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="glass-pane w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-xl font-bold text-primary">Book a Table at {restaurant.title}</h2>
                    <p className="text-sm text-secondary">Complete your reservation details below.</p>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-secondary">Full Name *</label>
                                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-secondary">Phone Number *</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Reservation Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="adults" className="block text-sm font-medium text-secondary">Adults *</label>
                                    <input type="number" name="adults" id="adults" value={formData.adults} onChange={handleChange} min="1" required className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                                </div>
                                <div>
                                    <label htmlFor="children" className="block text-sm font-medium text-secondary">Children</label>
                                    <input type="number" name="children" id="children" value={formData.children} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="mealType" className="block text-sm font-medium text-secondary">Meal Type *</label>
                                <select name="mealType" id="mealType" value={formData.mealType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 glass-input text-primary">
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-secondary">Date *</label>
                                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                            </div>
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-secondary">Time *</label>
                                <input type="time" name="time" id="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Additional Information</h3>
                        <div>
                            <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary">Special Requests</label>
                            <textarea name="specialRequests" id="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="e.g., Birthday celebration, dietary restrictions, high chair needed"></textarea>
                        </div>
                    </div>
                    
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="bookCab"
                            id="bookCab"
                            checked={formData.bookCab}
                            onChange={(e) => setFormData(prev => ({ ...prev, bookCab: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="bookCab" className="ml-2 block text-sm text-secondary">
                            Book a Cab to the restaurant
                        </label>
                    </div>
                </form>
                 <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 glass-button-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-5 py-2 glass-button-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Restaurant Details Modal ---
const RestaurantDetailsModal: React.FC<{ 
    restaurant: Place; 
    onClose: () => void;
    onBookTable: () => void;
}> = ({ restaurant, onClose, onBookTable }) => (
    <div
        className="fixed inset-0 z-[60] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restaurant-details-modal-title"
    >
        <div
            className="glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            {restaurant.imageUrl && (
                <img src={restaurant.imageUrl} alt={`Image of ${restaurant.title}`} className="w-full h-64 object-cover bg-black/10" />
            )}
            <div className="p-6 flex-grow overflow-y-auto">
                <h2 id="restaurant-details-modal-title" className="text-2xl font-bold text-primary">{restaurant.title}</h2>
                <p className="text-sm text-secondary mb-4">{restaurant.description}</p>
                
                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Menu Highlights</h4>
                    <p className="text-secondary">Traditional Lahori cuisine with modern twists. Signature dishes include butter chicken, biryani, and kulfi.</p>
                </div>
                
                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Operating Hours</h4>
                    <p className="text-secondary">Monday - Sunday: 11:00 AM - 11:00 PM</p>
                </div>
                
                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Facilities</h4>
                    <div className="flex flex-wrap">
                        <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
                            Air Conditioning
                        </span>
                        <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
                            Family Friendly
                        </span>
                        <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
                            Parking Available
                        </span>
                        <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
                            WiFi
                        </span>
                    </div>
                </div>
                
                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Reviews & Ratings</h4>
                    <div className="flex items-center">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-secondary">4.6 (89 reviews)</span>
                    </div>
                    <div className="mt-2 p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm">
                            <span className="font-semibold">Verified Restaurant:</span> This restaurant is verified by LahoreHub with authentic reviews and transparent pricing.
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                 <button
                    onClick={onBookTable}
                    className="w-full sm:w-auto px-5 py-3 glass-button-primary"
                >
                    Book a Table
                </button>
                 <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2 glass-button-secondary"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

// --- Restaurant Card Component ---
const RestaurantCard: React.FC<{ restaurant: Place; onCardClick: () => void; }> = ({ restaurant, onCardClick }) => (
    <button
        onClick={onCardClick}
        className="glass-pane overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl text-left w-full"
    >
        {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={`Image of ${restaurant.title}`} className="w-full h-48 object-cover bg-black/10" />
        ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">{restaurant.title.charAt(0)}</span>
            </div>
        )}
        <div className="p-4">
            <h3 className="text-xl font-bold text-primary">{restaurant.title}</h3>
            <p className="text-sm text-secondary mb-3 line-clamp-2">{restaurant.description}</p>
            
            <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <span className="ml-1 text-xs text-secondary">4.6</span>
                <span className="mx-2 text-secondary">•</span>
                <span className="text-xs text-secondary">89 reviews</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
                <span className="inline-block bg-blue-500/10 text-blue-500 text-xs font-semibold px-2 py-1 rounded-full">
                    Lahori Cuisine
                </span>
                <span className="inline-block bg-green-500/10 text-green-500 text-xs font-semibold px-2 py-1 rounded-full">
                    $$$
                </span>
            </div>
            
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-xs text-green-500">Verified</span>
            </div>
        </div>
    </button>
);

// --- Main Modal Component ---
interface RestaurantBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeoLocation | null;
  restaurants: Place[];
  onRestaurantSelect: (restaurant: Place) => void;
  onBookingConfirmed: (booking: RestaurantBooking) => void;
  selectedRestaurant?: Place; // Add this prop to handle a pre-selected restaurant
  onBookCab?: (destination: string) => void; // Add this prop to handle cab booking
}

const RestaurantBookingModal: React.FC<RestaurantBookingModalProps> = ({ isOpen, onClose, location, restaurants, onRestaurantSelect, onBookingConfirmed, selectedRestaurant, onBookCab }) => {
    const [selectedRestaurantState, setSelectedRestaurantState] = useState<Place | null>(selectedRestaurant || null);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');

    // Update selected restaurant when prop changes
    useEffect(() => {
        if (selectedRestaurant) {
            setSelectedRestaurantState(selectedRestaurant);
            // If a restaurant is pre-selected, open the booking form directly
            setIsBookingFormOpen(true);
        }
    }, [selectedRestaurant]);

    const handleSelectRestaurant = (restaurant: Place) => {
        setSelectedRestaurantState(restaurant);
    };

    const handleBookTable = () => {
        if (selectedRestaurantState) {
            setIsBookingFormOpen(true);
        }
    };
    
    const handleBookingConfirmed = (bookingData: any) => {
        if (selectedRestaurantState) {
          // Create a proper RestaurantBooking object
          const booking: RestaurantBooking = {
            id: Date.now(),
            restaurantName: selectedRestaurantState.title,
            guestName: bookingData.fullName,
            email: '', // Not collecting email anymore
            phone: bookingData.phone,
            adults: parseInt(bookingData.adults),
            children: parseInt(bookingData.children),
            date: bookingData.date,
            time: bookingData.time,
            specialRequests: bookingData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed',
            mealType: bookingData.mealType // Add meal type
          };
          
          // Call the passed in handler
          onBookingConfirmed(booking);
          
          // If book cab is checked, trigger cab booking
          if (bookingData.bookCab && location && onBookCab) {
            onBookCab(selectedRestaurantState.title);
          }
          
          // Generate QR code data including meal type
          const qrData = JSON.stringify(booking);
          setQrCodeData(qrData);
          setIsBookingFormOpen(false);
          setIsQRCodeVisible(true);
        }
    };

    // Reset state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            // Only reset state if no restaurant was pre-selected
            if (!selectedRestaurant) {
                setSelectedRestaurantState(null);
            }
            setIsBookingFormOpen(false);
            setIsQRCodeVisible(false);
        }
    }, [isOpen, selectedRestaurant]);

    if (!isOpen) return null;

    // If a restaurant is pre-selected, show the booking form directly
    if (selectedRestaurant) {
        return (
            <>
                {!isQRCodeVisible ? (
                    <RestaurantBookingForm
                        restaurant={selectedRestaurant}
                        location={location}
                        onClose={() => {
                            onClose();
                        }}
                        onConfirm={handleBookingConfirmed}
                    />
                ) : (
                    <RestaurantQRCodeModal
                        restaurantName={selectedRestaurant.title}
                        qrCodeData={qrCodeData}
                        onClose={() => {
                            onClose();
                        }}
                    />
                )}
            </>
        );
    }

    // If showing the restaurant selection modal
    return (
        <>
            <div
                className="fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="restaurants-modal-title"
            >
                <div
                    className="bg-app/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 id="restaurants-modal-title" className="text-xl font-bold text-primary">Book a Table</h2>
                        <button
                            onClick={onClose}
                            aria-label="Close restaurants"
                            className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>

                    <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {restaurants.map(restaurant => (
                                <RestaurantCard 
                                    key={restaurant.title} 
                                    restaurant={restaurant} 
                                    onCardClick={() => handleSelectRestaurant(restaurant)} 
                                />
                            ))}
                        </div>
                        
                        <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <h3 className="font-bold text-blue-400 mb-2">Restaurant Booking Process</h3>
                            <ol className="text-sm space-y-1 text-secondary list-decimal list-inside">
                                <li>Select a restaurant from the list above</li>
                                <li>Review menu, facilities, and ratings</li>
                                <li>Complete reservation form with your details</li>
                                <li>Receive instant QR code confirmation</li>
                                <li>Show QR code to host upon arrival</li>
                            </ol>
                        </div>
                    </main>
                </div>
            </div>
            
            {selectedRestaurantState && (
                <RestaurantDetailsModal 
                    restaurant={selectedRestaurantState} 
                    onClose={() => setSelectedRestaurantState(null)} 
                    onBookTable={handleBookTable}
                />
            )}
            
            {isBookingFormOpen && selectedRestaurantState && (
                <RestaurantBookingForm
                    restaurant={selectedRestaurantState}
                    location={location}
                    onClose={() => setIsBookingFormOpen(false)}
                    onConfirm={handleBookingConfirmed}
                />
            )}
            
            {isQRCodeVisible && selectedRestaurantState && (
                <RestaurantQRCodeModal
                    restaurantName={selectedRestaurantState.title}
                    qrCodeData={qrCodeData}
                    onClose={() => setIsQRCodeVisible(false)}
                />
            )}
        </>
    );
};

export default RestaurantBookingModal;