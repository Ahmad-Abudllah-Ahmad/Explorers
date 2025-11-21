import React, { useState, useEffect } from 'react';
import type { Place, HotelBooking, GeoLocation } from '../types';
import QRCode from 'qrcode';

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Place | null;
  onBookingConfirmed: (booking: HotelBooking) => void;
  userLocation: GeoLocation | null; // Add user location prop
  onBookCab?: (destination: string, guestName: string, phone: string) => void; // Update cab booking handler
}

const HotelBookingModal: React.FC<HotelBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  hotel,
  onBookingConfirmed,
  userLocation,
  onBookCab
}) => {
  const [isRendering, setIsRendering] = useState(isOpen);
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null); // Add distance state
  const [bookCab, setBookCab] = useState<boolean>(false); // Add cab booking state
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    phone: '',
    adults: 1,
    kids: 0,
    roomType: 'standard',
    bedType: 'single',
    serviceType: 'economy',
    foodIncluded: false,
    checkInDate: '',
    checkOutDate: '',
    specialRequests: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate distance when hotel or user location changes
  useEffect(() => {
    if (hotel && userLocation && hotel.uri) {
      // Extract coordinates from uri if available
      // This is a simplified approach - in a real app, you'd get coordinates from a proper geocoding service
      try {
        // Example format: "https://www.google.com/maps/place/.../@31.5497,74.3432,15z/..."
        const match = hotel.uri.match(/@([0-9.]+),([0-9.]+)/);
        if (match && match[1] && match[2]) {
          const hotelLat = parseFloat(match[1]);
          const hotelLon = parseFloat(match[2]);
          const dist = calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            hotelLat, 
            hotelLon
          );
          setDistance(Math.round(dist * 10) / 10); // Round to 1 decimal place
        }
      } catch (e) {
        console.log('Could not calculate distance');
      }
    }
  }, [hotel, userLocation]);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
      // Reset form when modal opens
      setStep('form');
      setFormData({
        fullName: '',
        cnic: '',
        phone: '',
        adults: 1,
        kids: 0,
        roomType: 'standard',
        bedType: 'single',
        serviceType: 'economy',
        foodIncluded: false,
        checkInDate: '',
        checkOutDate: '',
        specialRequests: ''
      });
      setErrors({});
      setBookCab(false);
    } else {
      setTimeout(() => setIsRendering(false), 400); // Match animation duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'kids' ? parseInt(value) || 0 : val
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.cnic.trim()) {
      newErrors.cnic = 'CNIC is required';
    } else if (!/^\d{5}-\d{7}-\d$/.test(formData.cnic) && !/^\d{13}$/.test(formData.cnic)) {
      newErrors.cnic = 'Please enter a valid CNIC (e.g., 12345-1234567-1 or 1234512345671)';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (formData.adults < 1) {
      newErrors.adults = 'At least one adult is required';
    }
    
    if (!formData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    }
    
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate QR code data
      const bookingData = {
        hotelName: hotel?.title || 'Unknown Hotel',
        guestName: formData.fullName,
        cnic: formData.cnic,
        phone: formData.phone,
        adults: formData.adults,
        kids: formData.kids,
        roomType: formData.roomType,
        bedType: formData.bedType,
        serviceType: formData.serviceType,
        foodIncluded: formData.foodIncluded,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        bookingId: `HOTEL-${Date.now()}`,
        timestamp: Date.now()
      };
      
      const qrDataString = JSON.stringify(bookingData);
      
      // Generate QR code
      QRCode.toDataURL(qrDataString, { width: 200 })
        .then(url => {
          setQrCodeUrl(url);
          setStep('confirmation');
          
          // Create booking object
          const booking: HotelBooking = {
            id: Date.now(),
            hotelName: hotel?.title || 'Unknown Hotel',
            guestName: formData.fullName,
            cnic: formData.cnic,
            adults: formData.adults,
            kids: formData.kids,
            roomType: formData.roomType,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed'
          };
          
          // If user wants to book a cab, trigger the cab booking with guest details
          if (bookCab && onBookCab && hotel?.title) {
            onBookCab(hotel.title, formData.fullName, formData.phone);
          }
          
          onBookingConfirmed(booking);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          // Still proceed with confirmation even if QR code fails
          setStep('confirmation');
          
          const booking: HotelBooking = {
            id: Date.now(),
            hotelName: hotel?.title || 'Unknown Hotel',
            guestName: formData.fullName,
            cnic: formData.cnic,
            adults: formData.adults,
            kids: formData.kids,
            roomType: formData.roomType,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed'
          };
          
          // If user wants to book a cab, trigger the cab booking with guest details
          if (bookCab && onBookCab && hotel?.title) {
            onBookCab(hotel.title, formData.fullName, formData.phone);
          }
          
          onBookingConfirmed(booking);
        });
    }
  };

  if (!isRendering || !hotel) return null;

  return (
    <div 
      className={`fixed inset-0 z-[70] flex justify-center items-center p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`glass-pane w-full max-w-md p-6 relative animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            {step === 'form' ? 'Book Your Stay' : 'Booking Confirmed!'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-2">
              <h3 className="font-semibold text-lg text-primary">{hotel.title}</h3>
              {distance !== null && (
                <p className="text-sm text-secondary">Distance: {distance} km from your location</p>
              )}
              <p className="text-sm text-secondary">Complete your booking details below</p>
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`glass-input w-full px-4 py-2 ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cnic" className="block text-sm font-medium text-secondary mb-1">
                  CNIC Number *
                </label>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.cnic ? 'border-red-500' : ''}`}
                  placeholder="e.g., 12345-1234567-1"
                />
                <p className="mt-1 text-xs text-secondary">Format: 12345-1234567-1 or 1234512345671</p>
                {errors.cnic && <p className="mt-1 text-sm text-red-500">{errors.cnic}</p>}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="e.g., 03001234567"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="adults" className="block text-sm font-medium text-secondary mb-1">
                  Adults *
                </label>
                <input
                  type="number"
                  id="adults"
                  name="adults"
                  min="1"
                  value={formData.adults}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.adults ? 'border-red-500' : ''}`}
                />
                {errors.adults && <p className="mt-1 text-sm text-red-500">{errors.adults}</p>}
              </div>
              
              <div>
                <label htmlFor="kids" className="block text-sm font-medium text-secondary mb-1">
                  Kids
                </label>
                <input
                  type="number"
                  id="kids"
                  name="kids"
                  min="0"
                  value={formData.kids}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-secondary mb-1">
                  Room Type
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2"
                >
                  <option value="standard">Standard Room</option>
                  <option value="deluxe">Deluxe Room</option>
                  <option value="luxury">Luxury Suite</option>
                  <option value="family">Family Room</option>
                  <option value="executive">Executive Suite</option>
                  <option value="honeymoon">Honeymoon Suite</option>
                  <option value="corporate">Corporate Room</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bedType" className="block text-sm font-medium text-secondary mb-1">
                  Bed Type
                </label>
                <select
                  id="bedType"
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleChange}
                  className="glass-input w-full px-4 py-2"
                >
                  <option value="single">Single Bed</option>
                  <option value="double">Double Bed</option>
                  <option value="twin">Twin Beds</option>
                  <option value="queen">Queen Size</option>
                  <option value="king">King Size</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-secondary mb-1">
                Service Type
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2"
              >
                <option value="economy">Economy</option>
                <option value="luxury">Luxury</option>
                <option value="deluxe">Deluxe</option>
                <option value="corporate">Corporate</option>
                <option value="honeymoon">Honeymoon</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="foodIncluded"
                name="foodIncluded"
                checked={formData.foodIncluded}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="foodIncluded" className="ml-2 block text-sm text-secondary">
                Include Food Service
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkInDate" className="block text-sm font-medium text-secondary mb-1">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.checkInDate ? 'border-red-500' : ''}`}
                />
                {errors.checkInDate && <p className="mt-1 text-sm text-red-500">{errors.checkInDate}</p>}
              </div>
              
              <div>
                <label htmlFor="checkOutDate" className="block text-sm font-medium text-secondary mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.checkOutDate ? 'border-red-500' : ''}`}
                />
                {errors.checkOutDate && <p className="mt-1 text-sm text-red-500">{errors.checkOutDate}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={3}
                className="glass-input w-full px-4 py-2"
                placeholder="Any special requests or requirements..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bookCab"
                name="bookCab"
                checked={bookCab}
                onChange={(e) => setBookCab(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="bookCab" className="ml-2 block text-sm text-secondary">
                Book a Cab to Hotel (Using details above)
              </label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 glass-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 glass-button-primary"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center p-4">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Booking QR Code" className="w-40 h-40" />
                ) : (
                  <div className="text-center">
                    <div className="inline-block w-32 h-32 bg-white mb-2 grid grid-cols-10 gap-0.5 p-2">
                      {[...Array(100)].map((_, i) => (
                        <div key={i} className="bg-black rounded-sm" style={{ opacity: Math.random() > 0.5 ? 1 : 0 }} />
                      ))}
                    </div>
                    <p className="text-sm text-secondary">Generating QR code...</p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-secondary">
                Show this QR code at the hotel reception for check-in
              </p>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-400 mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-secondary">Hotel:</span> {hotel.title}</p>
                <p><span className="text-secondary">Guest:</span> {formData.fullName}</p>
                <p><span className="text-secondary">Phone:</span> {formData.phone}</p>
                <p><span className="text-secondary">Room Type:</span> {formData.roomType.charAt(0).toUpperCase() + formData.roomType.slice(1)}</p>
                <p><span className="text-secondary">Bed Type:</span> {formData.bedType.charAt(0).toUpperCase() + formData.bedType.slice(1)}</p>
                <p><span className="text-secondary">Service Type:</span> {formData.serviceType.charAt(0).toUpperCase() + formData.serviceType.slice(1)}</p>
                <p><span className="text-secondary">Food Included:</span> {formData.foodIncluded ? 'Yes' : 'No'}</p>
                <p><span className="text-secondary">Check-in:</span> {new Date(formData.checkInDate).toLocaleDateString()}</p>
                <p><span className="text-secondary">Check-out:</span> {new Date(formData.checkOutDate).toLocaleDateString()}</p>
                <p><span className="text-secondary">Guests:</span> {formData.adults} Adult{formData.adults !== 1 ? 's' : ''}{formData.kids > 0 ? `, ${formData.kids} Kid${formData.kids !== 1 ? 's' : ''}` : ''}</p>
                {bookCab && (
                  <p className="text-green-500 font-semibold">✓ Cab booking requested with your details</p>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 glass-button-primary w-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelBookingModal;