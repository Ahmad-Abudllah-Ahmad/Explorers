import React, { useState } from 'react';
import { User, UserRole, UserProfile } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [role, setRole] = useState<UserRole>('tourist');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        location: '',
        cuisineType: '',
        licenseNumber: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock authentication logic
        const newUser: User = {
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            role: mode === 'login' ? 'tourist' : role, // Default to tourist for login mock
            profile: {
                businessName: formData.businessName,
                location: formData.location,
                cuisineType: formData.cuisineType,
                licenseNumber: formData.licenseNumber,
            }
        };

        // For login, we might want to simulate fetching the user's real role
        // But for this mock, we'll just pass the user through
        onLogin(newUser);
        onClose();
    };

    const renderRoleSpecificFields = () => {
        switch (role) {
            case 'restaurant_owner':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Restaurant Name"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.businessName}
                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Cuisine Type"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.cuisineType}
                            onChange={e => setFormData({ ...formData, cuisineType: e.target.value })}
                            required
                        />
                    </>
                );
            case 'hotel_owner':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Hotel Name"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.businessName}
                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </>
                );
            case 'tour_operator':
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Agency Name"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.businessName}
                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="License Number"
                            className="glass-input w-full p-3 rounded-xl mb-3"
                            value={formData.licenseNumber}
                            onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                            required
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex justify-center items-center p-4 modal-overlay animate-overlay-in">
            <div className="glass-pane w-full max-w-md p-6 animate-slide-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                    {mode === 'login' ? 'Welcome Back' : 'Join Explorers'}
                </h2>

                <div className="flex mb-6 bg-white/5 rounded-lg p-1">
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${mode === 'login' ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        onClick={() => setMode('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md transition-all ${mode === 'signup' ? 'bg-primary text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        onClick={() => setMode('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="mb-4">
                            <label className="block text-secondary text-sm mb-2">I am a:</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['tourist', 'restaurant_owner', 'hotel_owner', 'tour_operator'] as UserRole[]).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`p-2 text-xs rounded-lg border transition-all ${role === r
                                            ? 'border-primary bg-primary/20 text-primary'
                                            : 'border-white/10 text-secondary hover:bg-white/5'
                                            }`}
                                    >
                                        {r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Full Name"
                        className="glass-input w-full p-3 rounded-xl mb-3"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        className="glass-input w-full p-3 rounded-xl mb-3"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="glass-input w-full p-3 rounded-xl mb-3"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    {mode === 'signup' && renderRoleSpecificFields()}

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 glass-button-primary font-bold rounded-xl"
                    >
                        {mode === 'login' ? 'Login' : 'Create Account'}
                    </button>

                    {/* Dummy Users for Testing */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-center text-secondary mb-3">Quick Login (Testing)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => onLogin({
                                    id: 'dummy-tourist',
                                    name: 'John Tourist',
                                    email: 'tourist@example.com',
                                    role: 'tourist',
                                    profile: {}
                                })}
                                className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-secondary transition-colors"
                            >
                                Tourist
                            </button>
                            <button
                                type="button"
                                onClick={() => onLogin({
                                    id: 'dummy-restaurant',
                                    name: 'Chef Mario',
                                    email: 'mario@restaurant.com',
                                    role: 'restaurant_owner',
                                    profile: { businessName: "Mario's Pizza", location: "Downtown", cuisineType: "Italian" }
                                })}
                                className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-secondary transition-colors"
                            >
                                Restaurant
                            </button>
                            <button
                                type="button"
                                onClick={() => onLogin({
                                    id: 'dummy-hotel',
                                    name: 'Hotel Manager',
                                    email: 'manager@hotel.com',
                                    role: 'hotel_owner',
                                    profile: { businessName: "Grand Hotel", location: "City Center" }
                                })}
                                className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-secondary transition-colors"
                            >
                                Hotel Owner
                            </button>
                            <button
                                type="button"
                                onClick={() => onLogin({
                                    id: 'dummy-operator',
                                    name: 'Tour Guide',
                                    email: 'guide@tours.com',
                                    role: 'tour_operator',
                                    profile: { businessName: "City Tours", licenseNumber: "TO-12345" }
                                })}
                                className="p-2 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-secondary transition-colors"
                            >
                                Tour Operator
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
