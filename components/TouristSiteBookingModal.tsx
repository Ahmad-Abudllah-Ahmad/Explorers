import React, { useState, useEffect } from 'react';
import type { Place } from '../types';
import QRCode from 'qrcode';

interface TouristSiteBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Place | null;
  onBookingConfirmed: (booking: any) => void;
  onBookCab?: (destination: string) => void; // Add this prop to handle cab booking
}

const TouristSiteBookingModal: React.FC<TouristSiteBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  site,
  onBookingConfirmed,
  onBookCab // Add this prop
}) => {
  const [isRendering, setIsRendering] = useState(isOpen);
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Form state - updated to match required fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '', // Changed from CNIC to phone number
    adults: 1,
    kids: 0,
    visitDate: '',
    visitTime: '', // Added time field
    specialRequests: '',
    bookCab: false // Add book cab checkbox
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
      // Reset form when modal opens
      setStep('form');
      setFormData({
        fullName: '',
        phone: '',
        adults: 1,
        kids: 0,
        visitDate: '',
        visitTime: '',
        specialRequests: ''
      });
      setErrors({});
    } else {
      setTimeout(() => setIsRendering(false), 400); // Match animation duration
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'kids' ? parseInt(value) || 0 : value
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
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.adults < 1) {
      newErrors.adults = 'At least one adult is required';
    }
    
    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }
    
    if (!formData.visitTime) {
      newErrors.visitTime = 'Visit time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate QR code data
      const bookingData = {
        siteName: site?.title || 'Unknown Site',
        visitorName: formData.fullName,
        phone: formData.phone,
        adults: formData.adults,
        kids: formData.kids,
        visitDate: formData.visitDate,
        visitTime: formData.visitTime,
        bookingId: `SITE-${Date.now()}`,
        timestamp: Date.now()
      };
      
      const qrDataString = JSON.stringify(bookingData);
      
      // Generate QR code
      QRCode.toDataURL(qrDataString, { width: 200 })
        .then(url => {
          setQrCodeUrl(url);
          setStep('confirmation');
          
          // Create booking object
          const booking = {
            id: Date.now(),
            siteName: site?.title || 'Unknown Site',
            visitorName: formData.fullName,
            phone: formData.phone,
            adults: formData.adults,
            kids: formData.kids,
            visitDate: formData.visitDate,
            visitTime: formData.visitTime,
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed'
          };
          
          // If book cab is checked, trigger cab booking
          if (formData.bookCab && onBookCab && site) {
            onBookCab(site.title);
          }
          
          onBookingConfirmed(booking);
        })
        .catch(err => {
          console.error('Error generating QR code:', err);
          // Still proceed with confirmation even if QR code fails
          setStep('confirmation');
          
          const booking = {
            id: Date.now(),
            siteName: site?.title || 'Unknown Site',
            visitorName: formData.fullName,
            phone: formData.phone,
            adults: formData.adults,
            kids: formData.kids,
            visitDate: formData.visitDate,
            visitTime: formData.visitTime,
            specialRequests: formData.specialRequests,
            bookingTimestamp: Date.now(),
            status: 'confirmed'
          };
          
          // If book cab is checked, trigger cab booking
          if (formData.bookCab && onBookCab && site) {
            onBookCab(site.title);
          }
          
          onBookingConfirmed(booking);
        });
    }
  };

  if (!isRendering || !site) return null;

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
            {step === 'form' ? 'Book Your Visit' : 'Booking Confirmed!'}
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
              <h3 className="font-semibold text-lg text-primary">{site.title}</h3>
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
                required
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
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
                required
              />
              <p className="mt-1 text-xs text-secondary">Format: 03001234567</p>
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="adults" className="block text-sm font-medium text-secondary mb-1">
                  Number of Adults *
                </label>
                <input
                  type="number"
                  id="adults"
                  name="adults"
                  min="1"
                  value={formData.adults}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.adults ? 'border-red-500' : ''}`}
                  required
                />
                {errors.adults && <p className="mt-1 text-sm text-red-500">{errors.adults}</p>}
              </div>
              
              <div>
                <label htmlFor="kids" className="block text-sm font-medium text-secondary mb-1">
                  Number of Kids
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="visitDate" className="block text-sm font-medium text-secondary mb-1">
                  Visit Date *
                </label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.visitDate ? 'border-red-500' : ''}`}
                  required
                />
                {errors.visitDate && <p className="mt-1 text-sm text-red-500">{errors.visitDate}</p>}
              </div>
              
              <div>
                <label htmlFor="visitTime" className="block text-sm font-medium text-secondary mb-1">
                  Visit Time *
                </label>
                <input
                  type="time"
                  id="visitTime"
                  name="visitTime"
                  value={formData.visitTime}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 ${errors.visitTime ? 'border-red-500' : ''}`}
                  required
                />
                {errors.visitTime && <p className="mt-1 text-sm text-red-500">{errors.visitTime}</p>}
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
                name="bookCab"
                id="bookCab"
                checked={formData.bookCab}
                onChange={(e) => setFormData(prev => ({ ...prev, bookCab: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="bookCab" className="ml-2 block text-sm text-secondary">
                Book a Cab to the tourist site
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
                Show this QR code at the entrance for entry
              </p>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-blue-400 mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-secondary">Site:</span> {site.title}</p>
                <p><span className="text-secondary">Visitor:</span> {formData.fullName}</p>
                <p><span className="text-secondary">Phone:</span> {formData.phone}</p>
                <p><span className="text-secondary">Visit Date:</span> {new Date(formData.visitDate).toLocaleDateString()}</p>
                <p><span className="text-secondary">Visit Time:</span> {formData.visitTime}</p>
                <p><span className="text-secondary">Visitors:</span> {formData.adults} Adult{formData.adults !== 1 ? 's' : ''}{formData.kids > 0 ? `, ${formData.kids} Kid${formData.kids !== 1 ? 's' : ''}` : ''}</p>
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

export default TouristSiteBookingModal;