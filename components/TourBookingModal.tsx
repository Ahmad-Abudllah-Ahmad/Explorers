import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';

interface TourBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourPackage: {
    id: number;
    title: string;
    agency: string;
    price: number;
  };
  onBookingConfirmed: (booking: any) => void;
  userLocation: { latitude: number; longitude: number } | null;
  position?: { top: number; left: number; width: number; height: number } | null;
}

const TourBookingModal: React.FC<TourBookingModalProps> = ({
  isOpen,
  onClose,
  tourPackage,
  onBookingConfirmed,
  userLocation,
  position
}) => {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numberOfPeople: '2',
    pickupLocation: '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.numberOfPeople || parseInt(formData.numberOfPeople) < 1) {
      newErrors.numberOfPeople = 'At least one person is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Generate booking data
      const bookingData = {
        tourId: tourPackage.id,
        tourName: tourPackage.title,
        agency: tourPackage.agency,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        numberOfPeople: parseInt(formData.numberOfPeople),
        pickupLocation: formData.pickupLocation || (userLocation ? `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}` : ''),
        specialRequests: formData.specialRequests,
        bookingId: `TOUR-${Date.now()}`,
        timestamp: Date.now()
      };

      // Generate QR code
      const qrDataString = JSON.stringify(bookingData);
      QRCode.toDataURL(qrDataString, { width: 200 })
        .then(url => {
          setQrCodeUrl(url);
          setStep('confirmation');

          // Create booking object
          const booking = {
            id: Date.now(),
            tourId: tourPackage.id,
            tourName: tourPackage.title,
            agency: tourPackage.agency,
            customerName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            numberOfPeople: parseInt(formData.numberOfPeople),
            pickupLocation: formData.pickupLocation || (userLocation ? `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}` : ''),
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed',
            price: tourPackage.price
          };

          onBookingConfirmed(booking);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          // Still proceed with confirmation even if QR code fails
          setStep('confirmation');

          const booking = {
            id: Date.now(),
            tourId: tourPackage.id,
            tourName: tourPackage.title,
            agency: tourPackage.agency,
            customerName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            numberOfPeople: parseInt(formData.numberOfPeople),
            pickupLocation: formData.pickupLocation || (userLocation ? `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}` : ''),
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed',
            price: tourPackage.price
          };

          onBookingConfirmed(booking);
        });
    }
  };

  const modalStyle = position ? (() => {
    const modalWidth = Math.min(window.innerWidth * 0.9, 448); // 90vw or 28rem (448px)
    const modalMaxHeight = window.innerHeight * 0.85; // 85vh
    const cardCenterX = position.left + position.width / 2;
    const cardCenterY = position.top + position.height / 2;

    // Calculate desired left position (card center - half modal width)
    let leftPosition = cardCenterX - modalWidth / 2;

    // Clamp horizontally to viewport with 16px padding on each side
    const padding = 16;
    leftPosition = Math.max(padding, Math.min(leftPosition, window.innerWidth - modalWidth - padding));

    // Calculate desired top position (card center - half modal height estimate)
    // Using maxHeight as estimate since actual height depends on content
    let topPosition = cardCenterY - modalMaxHeight / 2;

    // Clamp vertically to viewport with padding
    topPosition = Math.max(padding, Math.min(topPosition, window.innerHeight - modalMaxHeight - padding));

    return {
      position: 'fixed' as const,
      top: `${topPosition}px`,
      left: `${leftPosition}px`,
      transform: 'none',
      width: '90vw',
      maxWidth: '28rem',
      maxHeight: '85vh',
      margin: 0
    };
  })() : {};

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex ${position ? '' : 'justify-center items-center'} p-4 modal-overlay animate-overlay-in`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-pane w-full max-w-md p-6 relative animate-slide-in max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={modalStyle}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            {step === 'form' ? 'Book Tour' : 'Booking Confirmed!'}
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
              <h3 className="font-semibold text-lg text-primary">{tourPackage.title}</h3>
              <p className="text-sm text-secondary">Complete your details below.</p>
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`glass-input w-full px-4 py-2 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="numberOfPeople" className="block text-sm font-medium text-secondary mb-1">
                Number of People *
              </label>
              <input
                type="number"
                id="numberOfPeople"
                name="numberOfPeople"
                min="1"
                value={formData.numberOfPeople}
                onChange={handleChange}
                className={`glass-input w-full px-4 py-2 ${errors.numberOfPeople ? 'border-red-500' : ''}`}
              />
              {errors.numberOfPeople && <p className="mt-1 text-sm text-red-500">{errors.numberOfPeople}</p>}
            </div>

            <div>
              <label htmlFor="pickupLocation" className="block text-sm font-medium text-secondary mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="glass-input w-full px-4 py-2"
                placeholder="Enter pickup location"
              />
              {userLocation && (
                <p className="mt-1 text-xs text-secondary">
                  Your current coordinates are pre-filled. You can also enter an address.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-secondary mb-1">
                Special Requests
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
                Show this QR code at the pickup point
              </p>
            </div>

            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-400 mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-secondary">Tour:</span> {tourPackage.title}</p>
                <p><span className="text-secondary">Agency:</span> {tourPackage.agency}</p>
                <p><span className="text-secondary">Customer:</span> {formData.fullName}</p>
                <p><span className="text-secondary">Email:</span> {formData.email}</p>
                <p><span className="text-secondary">Phone:</span> {formData.phone}</p>
                <p><span className="text-secondary">People:</span> {formData.numberOfPeople}</p>
                <p><span className="text-secondary">Pickup:</span> {formData.pickupLocation || (userLocation ? `Lat: ${userLocation.latitude}, Lng: ${userLocation.longitude}` : 'Not specified')}</p>
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
    </div>,
    document.body
  );
};

export default TourBookingModal;