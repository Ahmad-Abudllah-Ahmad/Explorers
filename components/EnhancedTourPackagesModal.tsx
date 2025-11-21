import React, { useState, useEffect } from 'react';
import type { TourPackage, GeoLocation } from '../types';
import { dummyTourData } from '../data/dummyTourData';
import QRCode from 'qrcode';

// --- QR Code Display Modal ---
const QRCodeDisplayModal: React.FC<{
    packageTitle: string;
    onClose: () => void;
    qrCodeData: string;
}> = ({ packageTitle, onClose, qrCodeData }) => {
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
            className="fixed inset-0 z-[120] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
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
                    Your booking for "{packageTitle}" has been confirmed. Please show this QR code to the operator at the meeting point.
                </p>
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

// --- Custom Tour Request Form Modal ---
const CustomTourRequestModal: React.FC<{
    location: GeoLocation | null;
    onClose: () => void;
    onSubmit: (data: any) => void;
}> = ({ location, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        preferredLocations: '',
        transportMode: 'car',
        adults: '2',
        children: '0',
        tripType: 'guided',
        meals: 'lunch',
        addOnActivities: '',
        packageTier: 'basic',
        specialRequests: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, email, phone } = formData;
        if (!fullName || !email || !phone) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            onSubmit(formData);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-xl font-bold text-primary">Request a Custom Tour</h2>
                    <p className="text-sm text-secondary">Fill out the details below and we'll connect you with a tour provider</p>
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
                        <h3 className="font-semibold text-primary mb-2">Tour Preferences</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="preferredLocations" className="block text-sm font-medium text-secondary">Preferred Locations</label>
                                <textarea name="preferredLocations" id="preferredLocations" value={formData.preferredLocations} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="e.g., Badshahi Mosque, Lahore Fort, Anarkali Bazaar"></textarea>
                            </div>
                            <div>
                                <label htmlFor="transportMode" className="block text-sm font-medium text-secondary">Transport Mode</label>
                                <select name="transportMode" id="transportMode" value={formData.transportMode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 glass-input text-primary">
                                    <option value="car">Car</option>
                                    <option value="van">Van</option>
                                    <option value="bus">Bus</option>
                                    <option value="rickshaw">Rickshaw</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="adults" className="block text-sm font-medium text-secondary">Adults</label>
                                    <input type="number" name="adults" id="adults" value={formData.adults} onChange={handleChange} min="1" className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                                </div>
                                <div>
                                    <label htmlFor="children" className="block text-sm font-medium text-secondary">Children</label>
                                    <input type="number" name="children" id="children" value={formData.children} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 glass-input text-primary" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="tripType" className="block text-sm font-medium text-secondary">Trip Type</label>
                                <select name="tripType" id="tripType" value={formData.tripType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 glass-input text-primary">
                                    <option value="guided">Guided</option>
                                    <option value="self-guided">Self-Guided</option>
                                    <option value="multi-location">Multi-Location</option>
                                    <option value="peaceful">Peaceful/Relaxing</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="meals" className="block text-sm font-medium text-secondary">Meals</label>
                                <select name="meals" id="meals" value={formData.meals} onChange={handleChange} className="mt-1 block w-full px-3 py-2 glass-input text-primary">
                                    <option value="none">None</option>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="all">All Meals</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="packageTier" className="block text-sm font-medium text-secondary">Package Tier</label>
                                <select name="packageTier" id="packageTier" value={formData.packageTier} onChange={handleChange} className="mt-1 block w-full px-3 py-2 glass-input text-primary">
                                    <option value="basic">Basic</option>
                                    <option value="premium">Premium</option>
                                    <option value="deluxe">Deluxe</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-primary mb-2">Additional Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="addOnActivities" className="block text-sm font-medium text-secondary">Add-on Activities</label>
                                <textarea name="addOnActivities" id="addOnActivities" value={formData.addOnActivities} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="e.g., Shopping, Photography session, Cultural performance"></textarea>
                            </div>
                            <div>
                                <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary">Special Requests</label>
                                <textarea name="specialRequests" id="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="Any special requirements or preferences"></textarea>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-5 py-2 glass-button-secondary" disabled={isSubmitting}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-5 py-2 glass-button-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Custom Tour Confirmation Modal ---
const CustomTourConfirmationModal: React.FC<{
    onClose: () => void;
    requestData: any;
}> = ({ onClose, requestData }) => (
    <div
        className="fixed inset-0 z-[120] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        role="dialog"
        aria-modal="true"
    >
        <div
            className="glass-pane w-full max-w-md text-center p-8"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h2 className="text-2xl font-bold text-primary">Request Submitted!</h2>
            <p className="mt-2 text-secondary">
                Your custom tour request has been submitted. A tour provider will contact you within 24 hours to discuss details and provide a quote.
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-left">
                <h3 className="font-semibold text-blue-400 mb-1">Request Summary</h3>
                <p className="text-sm"><span className="font-medium">Group:</span> {requestData.adults} adults, {requestData.children} children</p>
                <p className="text-sm"><span className="font-medium">Transport:</span> {requestData.transportMode}</p>
                <p className="text-sm"><span className="font-medium">Package Tier:</span> {requestData.packageTier}</p>
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

// --- Booking Form Modal ---
const BookingFormModal: React.FC<{
    packageInfo: TourPackage;
    location: GeoLocation | null;
    onClose: () => void;
    onConfirm: (bookingData: any) => void;
}> = ({ packageInfo, location, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        people: '1',
        pickupLocation: '',
        specialRequests: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            onConfirm(formData);
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
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
                        <label htmlFor="fullName" className="block text-sm font-medium text-secondary">Full Name *</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary">Email Address *</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-secondary">Phone Number *</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="people" className="block text-sm font-medium text-secondary">Number of People *</label>
                        <input type="number" name="people" id="people" value={formData.people} onChange={handleChange} min="1" required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>
                    <div>
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-secondary">Pickup Location</label>
                        <textarea name="pickupLocation" id="pickupLocation" value={formData.pickupLocation} onChange={handleChange} rows={2} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary"></textarea>
                        <p className="mt-1 text-xs text-secondary">Your current coordinates are pre-filled. You can also enter an address.</p>
                    </div>
                    <div>
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary">Special Requests</label>
                        <textarea name="specialRequests" id="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" placeholder="Any special requirements or preferences"></textarea>
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

// --- Booking Confirmation Modal with QR Code ---
const BookingConfirmationModal: React.FC<{
    packageTitle: string;
    onClose: () => void;
    qrCodeData: string;
    bookingId: string;
}> = ({ packageTitle, onClose, qrCodeData, bookingId }) => (
    <div
        className="fixed inset-0 z-[120] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        role="dialog"
        aria-modal="true"
    >
        <div
            className="glass-pane w-full max-w-md text-center p-8"
        >
            <div className="mx-auto mb-4 w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                {/* QR Code Display */}
                <div className="text-center">
                    <div className="inline-block w-32 h-32 bg-black mb-2 flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-1">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className={`w-6 h-6 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}></div>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">QR Code</p>
                </div>
            </div>
            <h2 className="text-2xl font-bold text-primary">Booking Confirmed!</h2>
            <p className="mt-2 text-secondary">
                Your booking for "{packageTitle}" has been confirmed.
            </p>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm font-mono">Booking ID: {bookingId}</p>
                <p className="text-sm font-mono mt-1">QR Code: {qrCodeData.substring(0, 20)}...</p>
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

// --- Details Modal ---
const TourPackageDetailsModal: React.FC<{
    packageInfo: TourPackage;
    onClose: () => void;
    onBookNow: () => void;
}> = ({ packageInfo, onClose, onBookNow }) => (
    <div
        className="fixed inset-0 z-[110] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-modal-title"
    >
        <div
            className="glass-pane w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
        >
            <img src={packageInfo.imageUrl} alt={`Image of ${packageInfo.title}`} className="w-full h-64 object-cover bg-black/10" crossOrigin="anonymous" />
            <div className="p-6 flex-grow overflow-y-auto">
                <h2 id="details-modal-title" className="text-2xl font-bold text-primary">{packageInfo.title}</h2>
                <p className="text-lg font-bold text-[color:var(--accent-color)] mt-1">PKR {packageInfo.price.toLocaleString()}</p>
                <p className="text-sm text-secondary mb-4">with {packageInfo.agency}</p>

                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Itinerary</h4>
                    <ul className="list-disc list-inside space-y-2 text-secondary">
                        {packageInfo.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </div>

                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Transport Details</h4>
                    <p className="text-secondary">Air-conditioned vehicle with experienced driver</p>
                </div>

                <div className="mb-4">
                    <h4 className="font-semibold text-primary mb-2">Pickup/Drop-off Points</h4>
                    <p className="text-secondary">Hotel pickup and drop-off included</p>
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
                        <span className="ml-2 text-secondary">4.8 (127 reviews)</span>
                    </div>
                    <div className="mt-2 p-3 bg-green-500/10 rounded-lg">
                        <p className="text-sm">
                            <span className="font-semibold">Verified Company:</span> This tour operator is verified by LahoreHub with transparent pricing and excellent customer service.
                        </p>
                    </div>
                </div>
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
        <img src={packageInfo.imageUrl} alt={`Image of ${packageInfo.title}`} className="w-full h-48 object-cover bg-black/10" crossOrigin="anonymous" />
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

            <div className="mt-3 flex items-center">
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <span className="ml-1 text-xs text-secondary">4.8</span>
                <span className="mx-2 text-secondary">•</span>
                <span className="text-xs text-secondary">127 reviews</span>
            </div>

            <div className="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-xs text-green-500">Verified</span>
            </div>
        </div>
    </button>
);

// --- Main Modal Component ---
interface EnhancedTourPackagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: GeoLocation | null;
    onTourBooked: (tour: TourPackage) => void;
    onCustomTourRequest: (requestData: any) => void; // New prop for custom tour requests
}

const EnhancedTourPackagesModal: React.FC<EnhancedTourPackagesModalProps> = ({ isOpen, onClose, location, onTourBooked, onCustomTourRequest }) => {
    const [view, setView] = useState<'list' | 'custom'>('list'); // 'list' for pre-made tours, 'custom' for custom tour request
    const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
    const [bookingPackage, setBookingPackage] = useState<TourPackage | null>(null);
    const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
    const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
    const [qrCodeData, setQrCodeData] = useState('');
    const [isCustomRequestOpen, setIsCustomRequestOpen] = useState(false);
    const [isCustomConfirmationVisible, setIsCustomConfirmationVisible] = useState(false);
    const [customRequestData, setCustomRequestData] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setTimeout(() => {
                setView('list');
                setSelectedPackage(null);
                setBookingPackage(null);
                setIsBookingFormOpen(false);
                setIsQRCodeVisible(false);
                setQrCodeData('');
                setIsCustomRequestOpen(false);
                setIsCustomConfirmationVisible(false);
                setCustomRequestData(null);
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
            setIsBookingFormOpen(true);
        }
    };

    const handleBookingConfirmed = (bookingData: any) => {
        if (bookingPackage) {
            // In a real app, this would call an API to process the booking
            // For now, we'll simulate generating a QR code
            const qrData = `LahoreHub_Booking_${bookingPackage.id}_${Date.now()}`;
            setQrCodeData(qrData);
            setIsBookingFormOpen(false);
            setIsQRCodeVisible(true);
            onTourBooked(bookingPackage);
        }
    };

    const handleCustomTourRequest = () => {
        setView('custom');
    };

    const handleCustomTourSubmit = (data: any) => {
        setCustomRequestData(data);
        setIsCustomRequestOpen(false);
        setIsCustomConfirmationVisible(true);
        // Call the custom tour request handler
        onCustomTourRequest(data);
    };

    const handleCloseCustomConfirmation = () => {
        setIsCustomConfirmationVisible(false);
        setView('list'); // Return to tour list after custom tour request
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[100] flex justify-center items-center p-4 modal-overlay animate-overlay-in"
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
                        <h2 id="tours-modal-title" className="text-xl font-bold text-primary">
                            {view === 'list' ? 'Explore Tour Packages' : 'Request a Custom Tour'}
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

                    {view === 'list' ? (
                        <>
                            <div className="p-4 border-b border-black/10 dark:border-white/10">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setView('list')}
                                        className="px-4 py-2 rounded-full bg-[color:var(--accent-color)] text-white text-sm font-medium"
                                    >
                                        Pre-Made Tours
                                    </button>
                                    <button
                                        onClick={handleCustomTourRequest}
                                        className="px-4 py-2 rounded-full bg-white/10 text-primary text-sm font-medium hover:bg-white/20"
                                    >
                                        Custom/Private Tour
                                    </button>
                                </div>
                            </div>

                            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {dummyTourData.map(pkg => (
                                        <TourPackageCard key={pkg.id} packageInfo={pkg} onCardClick={() => handleSelectPackage(pkg)} />
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <h3 className="font-bold text-blue-400 mb-2">Booking Process</h3>
                                    <ol className="text-sm space-y-1 text-secondary list-decimal list-inside">
                                        <li>Select a tour package from the list above</li>
                                        <li>Review detailed itinerary, pricing, and company information</li>
                                        <li>Complete booking form with your details</li>
                                        <li>Receive instant QR code confirmation</li>
                                        <li>Show QR code to operator at meeting point</li>
                                    </ol>
                                </div>
                            </main>
                        </>
                    ) : (
                        <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-primary">Custom Tour Request</h3>
                                <p className="text-secondary mt-2">
                                    Tell us your preferences and we'll connect you with verified tour providers who can create a personalized experience.
                                </p>
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <button
                                    onClick={() => setIsCustomRequestOpen(true)}
                                    className="w-full glass-button-primary py-4 text-lg font-semibold"
                                >
                                    Start Custom Tour Request
                                </button>

                                <div className="mt-8 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <h3 className="font-bold text-green-400 mb-2">How Custom Tours Work</h3>
                                    <ol className="text-sm space-y-1 text-secondary list-decimal list-inside">
                                        <li>Fill out the detailed request form with your preferences</li>
                                        <li>Verified tour providers review your request</li>
                                        <li>Providers contact you with quotes and itinerary options</li>
                                        <li>Select your preferred provider and finalize details</li>
                                        <li>Receive QR code confirmation after payment</li>
                                    </ol>
                                </div>
                            </div>
                        </main>
                    )}
                </div>
            </div>

            {selectedPackage && (
                <TourPackageDetailsModal
                    packageInfo={selectedPackage}
                    onClose={() => setSelectedPackage(null)}
                    onBookNow={handleStartBooking}
                />
            )}

            {isBookingFormOpen && bookingPackage && (
                <BookingFormModal
                    packageInfo={bookingPackage}
                    location={location}
                    onClose={() => setIsBookingFormOpen(false)}
                    onConfirm={handleBookingConfirmed}
                />
            )}

            {isQRCodeVisible && (
                <QRCodeDisplayModal
                    packageTitle={bookingPackage?.title || ''}
                    qrCodeData={qrCodeData}
                    onClose={() => setIsQRCodeVisible(false)}
                />
            )}

            {isCustomRequestOpen && (
                <CustomTourRequestModal
                    location={location}
                    onClose={() => setIsCustomRequestOpen(false)}
                    onSubmit={handleCustomTourSubmit}
                />
            )}

            {isCustomConfirmationVisible && customRequestData && (
                <CustomTourConfirmationModal
                    requestData={customRequestData}
                    onClose={handleCloseCustomConfirmation}
                />
            )}
        </>
    );
};

export default EnhancedTourPackagesModal;