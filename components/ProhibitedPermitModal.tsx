
import React, { useState, useEffect } from 'react';
import type { PermitRequest } from '../types';

interface ProhibitedPermitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PermitRequest, 'id' | 'status' | 'submissionTimestamp'>) => void;
}

const ProhibitedPermitModal: React.FC<ProhibitedPermitModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [isRendering, setIsRendering] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
        } else {
            setTimeout(() => setIsRendering(false), 400); // Match animation duration
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        siteName: '',
        fullName: '',
        idNumber: '',
        nationality: '',
        reason: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                siteName: '',
                fullName: '',
                idNumber: '',
                nationality: '',
                reason: '',
            });
            setError('');
        }
    }, [isOpen]);

    if (!isRendering) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { siteName, fullName, idNumber, nationality, reason } = formData;
        if (!siteName || !fullName || !idNumber || !nationality || !reason) {
            setError('All fields are required.');
            return;
        }
        setError('');
        onSubmit(formData);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`glass-pane w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`}
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-xl font-bold text-primary">Permit for Prohibited Sites</h2>
                    <p className="text-sm text-secondary">Application for Ministry of Tour and Travels, Pakistan</p>
                </header>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {error && <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-xl">{error}</p>}
                    
                    <div>
                        <label htmlFor="siteName" className="block text-sm font-medium text-secondary">Site/Area Name</label>
                        <input type="text" name="siteName" id="siteName" value={formData.siteName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>

                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-secondary">Full Name</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="idNumber" className="block text-sm font-medium text-secondary">CNIC / Passport No.</label>
                            <input type="text" name="idNumber" id="idNumber" value={formData.idNumber} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-secondary">Nationality</label>
                            <input type="text" name="nationality" id="nationality" value={formData.nationality} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary" />
                        </div>
                    </div>
                     
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-secondary">Reason for Visit</label>
                        <textarea name="reason" id="reason" value={formData.reason} onChange={handleChange} rows={3} required className="mt-1 block w-full px-3 py-2 glass-input text-primary placeholder:text-secondary"></textarea>
                    </div>
                </form>
                 <footer className="p-4 bg-black/5 dark:bg-white/5 flex justify-end gap-3 flex-shrink-0 border-t border-black/10 dark:border-white/10">
                    <button type="button" onClick={onClose} className="px-5 py-2 glass-button-secondary">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="px-5 py-2 glass-button-primary">Submit Request</button>
                </footer>
            </div>
        </div>
    );
};

export default ProhibitedPermitModal;