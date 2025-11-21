import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import QRCode from 'qrcode';

// --- Tour Package Data ---
const lahoreHubTours = [
  {
    id: 1,
    title: "Historic Lahore Tour",
    agency: "Lahore Heritage Tours",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1598965391050-50d4bcb3e9f2?q=80&w=800&auto=format&fit=crop",
    facilities: ["Guided Tour", "Transportation", "Lunch"],
    details: [
      "Visit Lahore Fort and Badshahi Mosque",
      "Explore Shalimar Gardens",
      "Traditional Pakistani lunch at Butt Karahi",
      "Shopping at Anarkali Bazaar",
      "Cultural performance at Naulakha Pavilion"
    ],
    rating: 4.8,
    reviews: 127
  },
  {
    id: 2,
    title: "Food Lover's Lahore Experience",
    agency: "Punjab Culinary Adventures",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1583255448430-17c5297043dd?q=80&w=800&auto=format&fit=crop",
    facilities: ["Food Tasting", "Transportation", "Guide"],
    details: [
      "Breakfast at Liberty Market",
      "Traditional Lahori breakfast at Butt Karahi",
      "Street food tour in Gawalmandi",
      "Lunch at Haveli Restaurant",
      "Dinner at Junaid Halal Restaurant"
    ],
    rating: 4.9,
    reviews: 98
  },
  {
    id: 3,
    title: "Mughal Heritage Tour",
    agency: "Royal Punjab Tours",
    price: 4500,
    imageUrl: "https://images.unsplash.com/photo-1598965431460-a0bc635b6059?q=80&w=800&auto=format&fit=crop",
    facilities: ["Guided Tour", "Transportation", "Entrance Fees", "Dinner"],
    details: [
      "Lahore Fort (UNESCO World Heritage Site)",
      "Badshahi Mosque",
      "Shalimar Gardens",
      "Wazir Khan Mosque",
      "Traditional Mughlai dinner"
    ],
    rating: 4.7,
    reviews: 86
  },
  {
    id: 4,
    title: "Modern Lahore City Tour",
    agency: "Urban Explorers Pakistan",
    price: 2800,
    imageUrl: "https://images.unsplash.com/photo-1598965431460-a0bc635b6059?q=80&w=800&auto=format&fit=crop",
    facilities: ["Guided Tour", "Transportation", "Coffee Break"],
    details: [
      "Visit Lahore Museum",
      "Explore Liberty Market",
      "Tour of Minar-e-Pakistan",
      "Visit Data Darbar Shrine",
      "Shopping at Defence Shopping Mall"
    ],
    rating: 4.6,
    reviews: 74
  }
];

// --- Booking Form Modal ---
const BookingFormModal: React.FC<{
    tour: typeof lahoreHubTours[0];
    onClose: () => void;
    onConfirm: (bookingData: any) => void;
}> = ({ tour, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        people: '2',
        date: '',
        specialRequests: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set default date to tomorrow
    useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setFormData(prev => ({ ...prev, date: tomorrow.toISOString().split('T')[0] }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, email, phone, date, people } = formData;
        if (!fullName || !email || !phone || !date || !people) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            onConfirm({ ...formData, tourId: tour.id });
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
                    <h2 className="text-xl font-bold text-primary">Book: {tour.title}</h2>
                    <p className="text-sm text-secondary">Complete your booking details below.</p>
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
                                <label htmlFor="email" className="block text-sm font-medium text-secondary">Email Address *</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-secondary">Phone Number *</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Tour Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="people" className="block text-sm font-medium text-secondary">Number of People *</label>
                                <input type="number" name="people" id="people" value={formData.people} onChange={handleChange} min="1" required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-secondary">Preferred Date *</label>
                                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-primary mb-2">Additional Information</h3>
                        <div>
                            <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary">Special Requests</label>
                            <textarea name="specialRequests" id="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="Any special requirements or preferences"></textarea>
                        </div>
                    </div>
                </form>
                 <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 glass-button-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-5 py-2 glass-button-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- QR Code Confirmation Modal ---
const QRCodeConfirmationModal: React.FC<{ 
  tour: typeof lahoreHubTours[0];
  bookingData: any;
  onClose: () => void;
}> = ({ tour, bookingData, onClose }) => {
    // Generate a more structured QR code data
    const qrCodeData = `LahoreHub_${tour.id}_${bookingData.fullName.replace(/\s+/g, '_')}_${bookingData.date}_${Date.now()}`;
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
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
                      <img src={qrCodeUrl} alt="Booking QR Code" className="w-32 h-32" />
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
                <h2 className="text-2xl font-bold text-primary">Booking Confirmed!</h2>
                <p className="mt-2 text-secondary">
                    Your booking for "{tour.title}" has been confirmed.
                </p>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-sm font-mono break-words">{qrCodeData.substring(0, 30)}...</p>
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

// --- Tour Package Card ---
const TourPackageCard: React.FC<{ 
    tour: typeof lahoreHubTours[0]; 
    onBook: (tour: typeof lahoreHubTours[0]) => void; 
}> = ({ tour, onBook }) => (
    <div className="glass-pane overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl text-left w-full">
        <img src={tour.imageUrl} alt={`Image of ${tour.title}`} className="w-full h-48 object-cover bg-black/10" />
        <div className="p-4">
            <h3 className="text-xl font-bold text-primary">{tour.title}</h3>
            <p className="text-sm text-secondary mb-3">{tour.agency}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
                {tour.facilities.map((facility, index) => (
                    <span key={index} className="inline-block bg-[color:var(--accent-color)]/10 text-[color:var(--accent-color)] text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
                        {facility}
                    </span>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <p className="text-2xl font-extrabold text-[color:var(--accent-color)]">
                    PKR {tour.price.toLocaleString()}
                    <span className="text-sm font-normal text-secondary">/person</span>
                </p>
            </div>
            
            <div className="mt-3 flex items-center">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <span className="ml-1 text-xs text-secondary">{tour.rating} ({tour.reviews} reviews)</span>
            </div>
            
            <button
                onClick={() => onBook(tour)}
                className="w-full mt-4 px-4 py-2 glass-button-primary text-center"
            >
                Book Now
            </button>
        </div>
    </div>
);

// --- Main Modal Component ---
interface LahoreHubTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTourBooked: (tour: any) => void;
}

const LahoreHubTourModal: React.FC<LahoreHubTourModalProps> = ({ isOpen, onClose, onTourBooked }) => {
    const [selectedTour, setSelectedTour] = useState<typeof lahoreHubTours[0] | null>(null);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);

    const handleBookTour = (tour: typeof lahoreHubTours[0]) => {
        setSelectedTour(tour);
        setIsBookingFormOpen(true);
    };

    const handleBookingConfirmed = (data: any) => {
        setBookingData(data);
        setIsBookingFormOpen(false);
        setIsConfirmationVisible(true);
        onTourBooked({ ...selectedTour, ...data });
    };

    const handleCloseConfirmation = () => {
        setIsConfirmationVisible(false);
        setBookingData(null);
        setSelectedTour(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lahorehub-tours-modal-title"
            >
                <div
                    className="bg-app/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 id="lahorehub-tours-modal-title" className="text-xl font-bold text-primary">
                            LahoreHub Tour Packages
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close tours"
                            className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>

                    <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {lahoreHubTours.map(tour => (
                                <TourPackageCard 
                                    key={tour.id} 
                                    tour={tour} 
                                    onBook={handleBookTour} 
                                />
                            ))}
                        </div>
                        
                        <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <h3 className="font-bold text-blue-400 mb-2">Why Book with LahoreHub?</h3>
                            <ul className="text-sm space-y-1 text-secondary list-disc list-inside">
                                <li>Verified local tour operators</li>
                                <li>Transparent pricing with no hidden fees</li>
                                <li>QR code confirmation for easy check-in</li>
                                <li>24/7 customer support</li>
                                <li>Secure payment processing</li>
                            </ul>
                        </div>
                    </main>
                </div>
            </div>
            
            {isBookingFormOpen && selectedTour && (
                <BookingFormModal
                    tour={selectedTour}
                    onClose={() => setIsBookingFormOpen(false)}
                    onConfirm={handleBookingConfirmed}
                />
            )}
            
            {isConfirmationVisible && selectedTour && bookingData && (
                <QRCodeConfirmationModal
                    tour={selectedTour}
                    bookingData={bookingData}
                    onClose={handleCloseConfirmation}
                />
            )}
        </>
    );
};

export default LahoreHubTourModal;