import type { TourPackage } from '../types';

export const dummyTourData: TourPackage[] = [
  {
    id: 1,
    title: 'Walled City Historical Tour',
    agency: 'Lahore Guided Tours',
    price: 8500,
    imageUrl: 'https://images.unsplash.com/photo-1616368339438-f82387114412?q=80&w=800&auto=format&fit=crop',
    facilities: ['Guided Tour', 'AC Transport', 'Lunch', 'Entry Tickets'],
    details: [
      'Begin at the majestic Delhi Gate, one of the thirteen gates of the Inner City.',
      'Marvel at the intricate tile work (kashi-kari) of the historic Wazir Khan Mosque.',
      'Wander through the narrow, bustling streets and hidden alleys of the old city.',
      'Visit the Shahi Hammam (Royal Bath) and learn about its history.',
      'Enjoy a traditional Lahori lunch at a local restaurant within the Walled City.',
      'Conclude the tour at the Lahore Fort, a UNESCO World Heritage Site.'
    ],
  },
  {
    id: 2,
    title: 'Lahori Food Adventure',
    agency: 'Taste of Lahore',
    price: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1567033228491-7f99b903a4c0?q=80&w=800&auto=format&fit=crop',
    facilities: ['Expert Food Guide', 'Multiple Tastings', 'Rickshaw Ride', 'Dinner'],
    details: [
      'Experience the legendary food street of Gawalmandi.',
      'Taste authentic Lahori chargha, seekh kebabs, and tawa chicken.',
      'Enjoy a refreshing glass of lassi or freshly squeezed sugarcane juice.',
      'Travel between food spots in a traditional decorated rickshaw.',
      'Learn about the history and culture behind Lahore\'s famous dishes.',
      'End the night with delicious local desserts like falooda and jalebi.'
    ],
  },
  {
    id: 3,
    title: 'Wagah Border Ceremony Trip',
    agency: 'Patriot Tours PK',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1589704259836-6dc09c369351?q=80&w=800&auto=format&fit=crop',
    facilities: ['Private AC Car', 'Experienced Driver', 'Front-row Seats', 'Refreshments'],
    details: [
      'Private, comfortable air-conditioned transport from your hotel to Wagah Border.',
      'Witness the daily flag-lowering ceremony, a powerful display of patriotism.',
      'Experience the energetic and coordinated parade by Pakistani and Indian soldiers.',
      'Feel the electric atmosphere created by the enthusiastic crowds.',
      'Enjoy complimentary refreshments during the trip.',
      'Safe and timely return journey to your location in Lahore.'
    ],
  },
  {
    id: 4,
    title: 'Modern Lahore Exploration',
    agency: 'Lahore City Escapes',
    price: 7000,
    imageUrl: 'https://images.unsplash.com/photo-1623746272892-75382025e1d4?q=80&w=800&auto=format&fit=crop',
    facilities: ['Private Transport', 'Shopping Guide', 'Cafe Visit', 'Dinner'],
    details: [
      'Visit Packages Mall, one of the largest and most modern shopping centers in Pakistan.',
      'Explore the upscale boutiques and international brands in Gulberg.',
      'Relax and enjoy coffee at a trendy, high-end cafe.',
      'Stroll through the beautifully maintained Model Town Park.',
      'Dine at a top-rated contemporary restaurant on M.M. Alam Road.',
      'Experience the vibrant nightlife and modern culture of Lahore.'
    ],
  },
];
