
import React, { useState, useEffect } from 'react';
import type { TourPackage, GeoLocation } from '../types';
import { dummyTourData } from '../data/dummyTourData';

// --- Booking Confirmation Modal (New Component) ---
const BookingConfirmationModal: React.FC<{ packageTitle: string; onClose: () => void }> = ({ packageTitle, onClose }) => (
    <div
        className="fixed inset-0 z-[70] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        role="dialog"
        aria-modal="true"
    >
        <div
            className="glass-pane w-full max-w-md text-center p-8"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold text-primary">Booking Requested!</h2>
            <p className="mt-2 text-secondary">
                Your request for the "{packageTitle}" tour has been received. The agency will contact you shortly to finalize the details.
            </p>
            <button
                onClick={onClose}
                className="mt-6 w-full px-5 py-3 glass-button-primary"
            >
                Done
            </button>
        </div>
    </div>
);

// --- Booking Form Modal (New Component) ---
const BookingFormModal: React.FC<{
    packageInfo: TourPackage;
    location: GeoLocation | null;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ packageInfo, location, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        people: '1',
        pickupLocation: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (location) {
            setFormData(prev => ({ ...prev, pickupLocation: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` }));
        }
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, email, phone, pickupLocation, people } = formData;
        if (!fullName || !email || !phone || !pickupLocation || !people) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        console.log('Booking submitted:', { package: packageInfo.title, ...formData });
        onConfirm();
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
                    <h2 className="text-xl font-bold text-primary">Book: {packageInfo.title}</h2>
                    <p className="text-sm text-secondary">Complete your details below.</p>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-secondary">Full Name</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-secondary">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="people" className="block text-sm font-medium text-secondary">Number of People</label>
                        <input type="number" name="people" id="people" value={formData.people} onChange={handleChange} min="1" required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>
                     <div>
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-secondary">Pickup Location</label>
                        <textarea name="pickupLocation" id="pickupLocation" value={formData.pickupLocation} onChange={handleChange} rows={2} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary"></textarea>
                        <p className="mt-1 text-xs text-secondary">Your current coordinates are pre-filled. You can also enter an address.</p>
                    </div>
                </form>
                 <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 glass-button-secondary">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-5 py-2 glass-button-primary">Confirm Booking</button>
                </div>
            </div>
        </div>
    );
};

// --- Details Modal (Updated Component) ---
const TourPackageDetailsModal: React.FC<{ 
    packageInfo: TourPackage; 
    onClose: () => void;
    onBookNow: () => void;
}> = ({ packageInfo, onClose, onBookNow }) => (
    <div
        className="fixed inset-0 z-[60] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
    >
        <div
            className="glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <img src={packageInfo.imageUrl} alt={`Image of ${packageInfo.title}`} className="w-full h-64 object-cover bg-black/10" />
            <div className="p-6 flex-grow overflow-y-auto">
                <h2 id="details-modal-title" className="text-2xl font-bold text-primary">{packageInfo.title}</h2>
                <p className="text-lg font-bold text-[color:var(--accent-color)] mt-1">PKR {packageInfo.price.toLocaleString()}</p>
                <p className="text-sm text-secondary mb-4">with {packageInfo.agency}</p>
                
                <h4 className="font-semibold text-primary mb-2">What's Included:</h4>
                <ul className="list-disc list-inside space-y-2 text-secondary">
                    {packageInfo.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                    ))}
                </ul>
            </div>
            <div className="p-4 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                 <button
                    onClick={onBookNow}
                    className="w-full sm:w-auto px-5 py-3 glass-button-primary"
                >
                    Book Now
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

// --- Reusable Components ---
const FacilityTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block bg-[color:var(--accent-color)]/10 text-[color:var(--accent-color)] text-xs font-semibold mr-2 mb-2 px-2.5 py-1 rounded-full">
        {children}
    </span>
);

const TourPackageCard: React.FC<{ packageInfo: TourPackage; onCardClick: () => void; }> = ({ packageInfo, onCardClick }) => (
    <button
        onClick={onCardClick}
        className="glass-pane overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl text-left w-full"
    >
        <img src={packageInfo.imageUrl} alt={`Image of ${packageInfo.title}`} className="w-full h-48 object-cover bg-black/10" />
        <div className="p-4">
            <h3 className="text-xl font-bold text-primary">{packageInfo.title}</h3>
            <p className="text-sm text-secondary mb-3">{packageInfo.agency}</p>
            
            <div className="mb-4">
                {packageInfo.facilities.map(facility => <FacilityTag key={facility}>{facility}</FacilityTag>)}
            </div>

            <div className="flex justify-between items-center">
                <p className="text-2xl font-extrabold text-[color:var(--accent-color)]">
                    PKR {packageInfo.price.toLocaleString()}
                    <span className="text-sm font-normal text-secondary">/person</span>
                </p>
            </div>
        </div>
    </button>
);


// --- Main Modal Component (Updated with booking flow logic) ---
interface TourPackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeoLocation | null;
  onTourBooked: (tour: TourPackage) => void;
}

const TourPackagesModal: React.FC<TourPackagesModalProps> = ({ isOpen, onClose, location, onTourBooked }) => {
    const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
    const [bookingPackage, setBookingPackage] = useState<TourPackage | null>(null);
    const [isConfirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmedPackageTitle, setConfirmedPackageTitle] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSelectedPackage(null);
                setBookingPackage(null);
                setConfirmationVisible(false);
                setConfirmedPackageTitle('');
            }, 300);
        }
    }, [isOpen]);
    
    const handleSelectPackage = (pkg: TourPackage) => {
        setSelectedPackage(pkg);
    };

    const handleStartBooking = () => {
        if (selectedPackage) {
            setBookingPackage(selectedPackage);
            setSelectedPackage(null);
        }
    };
    
    const handleBookingConfirmed = () => {
        if (bookingPackage) {
            onTourBooked(bookingPackage);
            setConfirmedPackageTitle(bookingPackage.title);
            setBookingPackage(null);
            setConfirmationVisible(true);
        }
    };
    
    const handleFinishBookingFlow = () => {
        setConfirmationVisible(false);
        setConfirmedPackageTitle('');
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex justify-center items-center p-4 modal-overlay animate-overlay-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tours-modal-title"
            >
                <div
                    className="bg-app/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                        <h2 id="tours-modal-title" className="text-xl font-bold text-primary">Explore Tour Packages</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dummyTourData.map(pkg => (
                                <TourPackageCard key={pkg.id} packageInfo={pkg} onCardClick={() => handleSelectPackage(pkg)} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
            
            {selectedPackage && (
                <TourPackageDetailsModal 
                    packageInfo={selectedPackage} 
                    onClose={() => setSelectedPackage(null)} 
                    onBookNow={handleStartBooking}
                />
            )}
            
            {bookingPackage && (
                <BookingFormModal
                    packageInfo={bookingPackage}
                    location={location}
                    onClose={() => setBookingPackage(null)}
                    onConfirm={handleBookingConfirmed}
                />
            )}
            
            {isConfirmationVisible && (
                <BookingConfirmationModal
                    packageTitle={confirmedPackageTitle}
                    onClose={handleFinishBookingFlow}
                />
            )}
        </>
    );
};

export default TourPackagesModal;