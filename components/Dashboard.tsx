import React, { useState } from 'react';
import { User, UserRole, Listing } from '../types';
import QRCodeScannerModal from './QRCodeScannerModal';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    onScanQR: () => void;
    isEmbedded?: boolean;
    onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onScanQR, isEmbedded = false, onBack }) => {
    const isTourist = user.role === 'tourist';
    const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'profile'>(isTourist ? 'profile' : 'overview');

    // Listing State
    const [listings, setListings] = useState<Listing[]>([
        {
            id: 1,
            title: user.role === 'hotel_owner' ? 'Luxury Suite' : user.role === 'tour_operator' ? 'Northern Areas Expedition' : 'Family Feast Deal',
            description: user.role === 'hotel_owner' ? 'A spacious suite with city view and king-size bed.' : user.role === 'tour_operator' ? '5-day trip to Hunza and Skardu with all amenities included.' : '2 Large Pizzas, 1.5L Drink, and Garlic Bread.',
            price: user.role === 'hotel_owner' ? 25000 : user.role === 'tour_operator' ? 45000 : 3500,
            type: user.role === 'hotel_owner' ? 'hotel_room' : user.role === 'tour_operator' ? 'tour_package' : 'food_deal',
            imageUrl: user.role === 'hotel_owner' ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' : user.role === 'tour_operator' ? 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            amenities: user.role === 'hotel_owner' ? ['WiFi', 'Breakfast', 'AC', 'Pool'] : undefined,
            duration: user.role === 'tour_operator' ? '5 Days' : undefined,
            spots: user.role === 'tour_operator' ? 12 : undefined,
            dealType: user.role === 'restaurant_owner' ? 'Dinner' : undefined
        }
    ]);
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [formData, setFormData] = useState<Partial<Listing>>({});

    // Handlers
    const handleAddClick = () => {
        setEditingListing(null);
        setFormData({ type: user.role === 'hotel_owner' ? 'hotel_room' : user.role === 'tour_operator' ? 'tour_package' : 'food_deal' });
        setIsListingModalOpen(true);
    };

    const handleEditClick = (listing: Listing) => {
        setEditingListing(listing);
        setFormData(listing);
        setIsListingModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        if (confirm('Are you sure you want to delete this listing?')) {
            setListings(prev => prev.filter(l => l.id !== id));
        }
    };

    const handleSaveListing = () => {
        if (editingListing) {
            setListings(prev => prev.map(l => l.id === editingListing.id ? { ...l, ...formData } as Listing : l));
        } else {
            const newListing: Listing = {
                id: Date.now(),
                title: formData.title || 'New Listing',
                description: formData.description || '',
                price: formData.price || 0,
                type: formData.type as any,
                imageUrl: formData.imageUrl,
                amenities: formData.amenities,
                duration: formData.duration,
                spots: formData.spots,
                dealType: formData.dealType
            };
            setListings(prev => [...prev, newListing]);
        }
        setIsListingModalOpen(false);
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-pane p-4 rounded-xl">
                <h3 className="text-secondary text-sm">Total Bookings</h3>
                <p className="text-2xl font-bold text-primary">12</p>
            </div>
            <div className="glass-pane p-4 rounded-xl">
                <h3 className="text-secondary text-sm">Active Listings</h3>
                <p className="text-2xl font-bold text-primary">{listings.length}</p>
            </div>
            <div className="glass-pane p-4 rounded-xl">
                <h3 className="text-secondary text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold text-primary">PKR 45,000</p>
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">Recent Bookings</h3>
                <button
                    onClick={onScanQR}
                    className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Scan Booking QR
                </button>
            </div>
            {[1, 2, 3].map((booking) => (
                <div key={booking} className="glass-pane p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-primary">Booking #{booking}2345</h4>
                        <p className="text-sm text-secondary">Customer: John Doe</p>
                        <p className="text-xs text-secondary">Date: 2023-10-2{booking}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                            Confirmed
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListings = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">My Listings</h3>
                <button onClick={handleAddClick} className="px-4 py-2 glass-button-secondary text-sm">+ Add New</button>
            </div>

            {listings.map(listing => (
                <div key={listing.id} className="glass-pane p-4 rounded-xl">
                    <div className="flex justify-between items-start gap-4">
                        {listing.imageUrl && (
                            <img src={listing.imageUrl} alt={listing.title} className="w-24 h-24 object-cover rounded-lg bg-white/10" />
                        )}
                        <div className="flex-1">
                            <h4 className="font-bold text-primary text-lg">{listing.title}</h4>
                            <p className="text-sm text-secondary line-clamp-2">{listing.description}</p>
                            <p className="text-primary font-bold mt-1">PKR {listing.price.toLocaleString()}</p>

                            <div className="mt-2 flex gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg capitalize">{listing.type.replace('_', ' ')}</span>
                                {listing.duration && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">{listing.duration}</span>}
                                {listing.spots && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">{listing.spots} spots</span>}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <button onClick={() => handleEditClick(listing)} className="p-2 hover:bg-white/10 rounded-lg text-secondary hover:text-primary transition-colors" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onClick={() => handleDeleteClick(listing.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-secondary hover:text-red-400 transition-colors" title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {listings.length === 0 && (
                <div className="text-center py-10 text-secondary">
                    No listings yet. Click "Add New" to create one.
                </div>
            )}
        </div>
    );

    return (
        <div className={`${isEmbedded ? 'w-full min-h-screen bg-transparent' : 'fixed inset-0 z-[90] bg-black/90 overflow-y-auto animate-fade-in'}`}>
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {!isEmbedded && (
                    <header className="flex justify-between items-center mb-8 pt-4">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="Back"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                                <p className="text-secondary">Welcome back, {user.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 glass-button-secondary text-sm"
                        >
                            Logout
                        </button>
                    </header>
                )}

                {isEmbedded && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="Back"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                                <p className="text-secondary">Welcome back, {user.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <nav className="w-full md:w-64 space-y-2">
                        {!isTourist && (
                            <>
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'glass-button-primary' : 'hover:bg-white/5 text-secondary'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'glass-button-primary' : 'hover:bg-white/5 text-secondary'}`}
                                >
                                    Bookings
                                    <span className="float-right bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('listings')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'listings' ? 'glass-button-primary' : 'hover:bg-white/5 text-secondary'}`}
                                >
                                    My Listings
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'glass-button-primary' : 'hover:bg-white/5 text-secondary'}`}
                        >
                            Profile
                        </button>
                    </nav>

                    {/* Main Content */}
                    <main className="flex-1">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'bookings' && renderBookings()}
                        {activeTab === 'listings' && renderListings()}
                        {activeTab === 'profile' && (
                            <div className="glass-pane p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-primary mb-4">Profile Settings</h3>

                                {/* Profile Image Upload */}
                                <div className="mb-6 flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden mb-4 border-2 border-dashed border-white/30 hover:border-primary transition-colors relative group cursor-pointer">
                                        {user.profile?.avatarUrl ? (
                                            <img src={user.profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl text-white/50">{user.name.charAt(0)}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white">Change</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        console.log('Image uploaded:', reader.result);
                                                        alert("Image uploaded! (Mock)");
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-secondary">Drag & drop or click to upload</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-secondary mb-1">Full Name</label>
                                        <input type="text" value={user.name} readOnly className="glass-input w-full p-2 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-secondary mb-1">Email</label>
                                        <input type="text" value={user.email} readOnly className="glass-input w-full p-2 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-secondary mb-1">Role</label>
                                        <input type="text" value={user.role.replace('_', ' ')} readOnly className="glass-input w-full p-2 rounded-lg capitalize" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Add/Edit Listing Modal */}
            {isListingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-overlay-in" onClick={() => setIsListingModalOpen(false)}>
                    <div className="glass-pane w-full max-w-lg p-6 animate-slide-in" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-primary mb-4">{editingListing ? 'Edit Listing' : 'Add New Listing'}</h2>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Image Upload for Listing */}
                            <div className="w-full h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center relative cursor-pointer hover:border-primary transition-colors">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-secondary">Upload Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-secondary mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="glass-input w-full p-2 rounded-lg"
                                    placeholder={user.role === 'restaurant_owner' ? 'Deal Name' : user.role === 'hotel_owner' ? 'Room Type' : 'Package Name'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-secondary mb-1">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="glass-input w-full p-2 rounded-lg h-24 resize-none"
                                    placeholder="Describe your offering..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-secondary mb-1">Price (PKR)</label>
                                <input
                                    type="number"
                                    value={formData.price || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                    className="glass-input w-full p-2 rounded-lg"
                                />
                            </div>

                            {/* Role Specific Fields */}
                            {user.role === 'tour_operator' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-secondary mb-1">Duration</label>
                                        <input
                                            type="text"
                                            value={formData.duration || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                            className="glass-input w-full p-2 rounded-lg"
                                            placeholder="e.g. 3 Days"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-secondary mb-1">Total Spots</label>
                                        <input
                                            type="number"
                                            value={formData.spots || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, spots: parseInt(e.target.value) || 0 }))}
                                            className="glass-input w-full p-2 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {user.role === 'hotel_owner' && (
                                <div>
                                    <label className="block text-sm text-secondary mb-1">Amenities (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.amenities?.join(', ') || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, amenities: e.target.value.split(',').map(s => s.trim()) }))}
                                        className="glass-input w-full p-2 rounded-lg"
                                        placeholder="WiFi, AC, Breakfast..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsListingModalOpen(false)} className="flex-1 py-2 glass-button-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSaveListing} className="flex-1 py-2 glass-button-primary rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
