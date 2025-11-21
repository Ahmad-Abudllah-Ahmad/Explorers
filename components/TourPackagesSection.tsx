import React, { useState } from 'react';
import TourBookingModal from './TourBookingModal';
import TourDetailsModal from './TourDetailsModal';
import { User } from '../types';

const TourPackagesSection: React.FC<{
  location: { latitude: number; longitude: number } | null,
  onBookingConfirmed: (booking: any) => void,
  onAskExplorerAI: (tour: any) => void,
  currentUser?: User | null,
  onAuthRequired?: () => void
}> = ({ location, onBookingConfirmed, onAskExplorerAI, currentUser, onAuthRequired }) => {
  // Define tour packages data
  const tourPackages = [
    {
      id: 1,
      title: "Walled City Historical Tour",
      agency: "Lahore Guided Tours",
      price: 8500,
      rating: 4.8,
      reviews: 127,
      features: ["Guided Tour", "AC Transport", "Lunch", "Entry Tickets"],
      itinerary: [
        "Begin at the majestic Delhi Gate, one of the thirteen gates of the Inner City.",
        "Marvel at the intricate tile work (kashi-kari) of the historic Wazir Khan Mosque.",
        "Wander through the narrow, bustling streets and hidden alleys of the old city.",
        "Visit the Shahi Hammam (Royal Bath) and learn about its history.",
        "Enjoy a traditional Lahori lunch at a local restaurant within the Walled City.",
        "Conclude the tour at the Lahore Fort, a UNESCO World Heritage Site."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off included",
      imageUrl: "https://images.unsplash.com/photo-1598965391050-50d4bcb3e9f2?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Lahori Food Adventure",
      agency: "Taste of Lahore",
      price: 6000,
      rating: 4.8,
      reviews: 127,
      features: ["Expert Food Guide", "Multiple Tastings", "Rickshaw Ride", "Dinner"],
      itinerary: [
        "Start with a visit to Gawalmandi Food Street for breakfast specialties.",
        "Explore traditional dhabas and street food stalls.",
        "Sample authentic Lahori dishes like nihari, paya, and kulfi.",
        "Experience a guided rickshaw ride through bustling markets.",
        "Visit hidden gems known only to locals.",
        "End the evening with dinner at a rooftop restaurant."
      ],
      transportDetails: "Guided rickshaw ride through narrow streets",
      pickupDropoff: "Hotel pickup and drop-off included",
      imageUrl: "https://images.unsplash.com/photo-1583255448430-17c5297043dd?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Wagah Border Ceremony Trip",
      agency: "Patriot Tours PK",
      price: 4500,
      rating: 4.8,
      reviews: 127,
      features: ["Private AC Car", "Experienced Driver", "Front-row Seats", "Refreshments"],
      itinerary: [
        "Departure from your hotel in Lahore.",
        "Scenic drive to Wagah Border through rural Punjab.",
        "Arrival at Wagah Border with time to explore the area.",
        "Witness the famous flag lowering ceremony.",
        "Experience the cultural exchange between Pakistan and India.",
        "Return journey to Lahore with refreshments."
      ],
      transportDetails: "Private AC car with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off included",
      imageUrl: "https://images.unsplash.com/photo-1598965431460-a0bc635b6059?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      title: "Modern Lahore Exploration",
      agency: "Lahore City Escapes",
      price: 7000,
      rating: 4.8,
      reviews: 127,
      features: ["Private Transport", "Shopping Guide", "Cafe Visit", "Dinner"],
      itinerary: [
        "Begin at Anarkali Bazaar for traditional crafts shopping.",
        "Visit Anarkali Tower for panoramic city views.",
        "Explore the vibrant food scene at Liberty Market.",
        "Experience Lahore's nightlife at popular entertainment spots.",
        "Visit cultural centers and modern art galleries.",
        "Conclude with a relaxing dinner at a fine dining restaurant."
      ],
      transportDetails: "Private transport with flexible itinerary",
      pickupDropoff: "Hotel pickup and drop-off included",
      imageUrl: "https://images.unsplash.com/photo-1558599508-e5a06f44d97f?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Hunza Valley Cultural Tour",
      agency: "Northern Explorers",
      price: 25000,
      rating: 4.9,
      reviews: 89,
      features: ["Guided Tour", "4x4 Vehicle", "Local Homestay", "Meals"],
      itinerary: [
        "Drive from Islamabad to Hunza Valley via Karakoram Highway.",
        "Visit ancient Baltit Fort and Altit Fort.",
        "Explore the traditional village of Karimabad.",
        "Experience local culture with a homestay in a traditional house.",
        "Visit Attabad Lake and Duiker Point.",
        "Return journey to Islamabad."
      ],
      transportDetails: "4x4 vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1602491142402-a0d90e7ee651?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Skardu Adventure Trek",
      agency: "Mountain Trekkers PK",
      price: 18000,
      rating: 4.7,
      reviews: 67,
      features: ["Trekking Guide", "Camping Gear", "Meals", "Permits"],
      itinerary: [
        "Drive from Islamabad to Skardu via scenic routes.",
        "Trek to Shangrila Resort and explore the area.",
        "Visit Kharpocho Fort (Shangarila Fort).",
        "Trek to Satpara Lake for camping.",
        "Explore Deosai National Park.",
        "Return journey to Islamabad."
      ],
      transportDetails: "4x4 vehicle and trekking equipment",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 7,
      title: "Fairy Meadows Overnight Stay",
      agency: "Gilgit Adventures",
      price: 22000,
      rating: 4.9,
      reviews: 112,
      features: ["Guided Trek", "Camping", "Meals", "Park Entry"],
      itinerary: [
        "Drive from Islamabad to Fairy Meadows via Naran.",
        "Trek from the meadows to Nanga Parbat Base Camp.",
        "Experience camping under the stars.",
        "Witness the majestic view of Nanga Parbat.",
        "Explore the lush green meadows and local villages.",
        "Return journey to Islamabad."
      ],
      transportDetails: "4x4 vehicle and trekking guide",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 8,
      title: "Swat Valley Cultural Experience",
      agency: "Valley Tours PK",
      price: 15000,
      rating: 4.6,
      reviews: 78,
      features: ["Guided Tour", "AC Transport", "Local Guide", "Meals"],
      itinerary: [
        "Drive from Islamabad to Swat Valley.",
        "Visit Malam Jabba Ski Resort.",
        "Explore the ancient Buddhist stupas.",
        "Experience local culture and handicrafts.",
        "Visit Fizagat Park and Bahrain Village.",
        "Return journey to Islamabad."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1592277693575-4bb3dbdafdeb?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 9,
      title: "Murree Hills Retreat",
      agency: "Hill Stations PK",
      price: 8000,
      rating: 4.5,
      reviews: 142,
      features: ["Guided Tour", "AC Transport", "Tea Tasting", "Local Guide"],
      itinerary: [
        "Drive from Islamabad to Murree Hills.",
        "Visit Mall Road and Patriata (New Murree).",
        "Experience a traditional tea tasting session.",
        "Explore the historic Christ Church.",
        "Visit Pindi Point and Kashmir Point.",
        "Return journey to Islamabad."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1596386461396-59d825d0c4f3?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 10,
      title: "Naltar Valley Snow Trek",
      agency: "Snow Trekkers",
      price: 12000,
      rating: 4.7,
      reviews: 56,
      features: ["Guided Trek", "Snow Gear", "Camping", "Meals"],
      itinerary: [
        "Drive from Gilgit to Naltar Valley.",
        "Trek to the blue glacier of Naltar.",
        "Experience snow activities and ice formations.",
        "Visit the ancient Naltar Fort.",
        "Camping under the stars in snow-covered landscape.",
        "Return journey to Gilgit."
      ],
      transportDetails: "4x4 vehicle and snow trekking equipment",
      pickupDropoff: "Hotel pickup and drop-off from Gilgit included",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 11,
      title: "Shandur Polo Festival",
      agency: "Cultural Events PK",
      price: 10000,
      rating: 4.8,
      reviews: 93,
      features: ["Festival Entry", "AC Transport", "Guide", "Meals"],
      itinerary: [
        "Drive from Chitral to Shandur Top.",
        "Witness the world's highest polo ground.",
        "Experience the annual Shandur Polo Festival.",
        "Enjoy traditional music and dance performances.",
        "Visit the ancient Chitral Fort.",
        "Return journey to Chitral."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Chitral included",
      imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 12,
      title: "Ratti Gali Lake Trek",
      agency: "Lake Trekkers",
      price: 16000,
      rating: 4.9,
      reviews: 74,
      features: ["Guided Trek", "Camping Gear", "Meals", "Permits"],
      itinerary: [
        "Drive from Islamabad to Kaghan Valley.",
        "Trek from Shogran to Ratti Gali Lake.",
        "Experience the pristine beauty of alpine lake.",
        "Camping near the lake with mountain views.",
        "Explore the surrounding meadows and streams.",
        "Return trek to Shogran and journey back to Islamabad."
      ],
      transportDetails: "4x4 vehicle and trekking equipment",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 13,
      title: "Kalash Valley Cultural Tour",
      agency: "Cultural Heritage Tours",
      price: 14000,
      rating: 4.7,
      reviews: 88,
      features: ["Cultural Guide", "AC Transport", "Local Experience", "Meals"],
      itinerary: [
        "Drive from Chitral to Bumboret Valley.",
        "Experience the unique Kalash culture and traditions.",
        "Visit ancient temples and cultural sites.",
        "Participate in traditional festivals (seasonal).",
        "Explore the handicrafts and local markets.",
        "Return journey to Chitral."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Chitral included",
      imageUrl: "https://images.unsplash.com/photo-1584920521443-1e127fba619e?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 14,
      title: "Khunjerab Pass Adventure",
      agency: "Border Adventures",
      price: 20000,
      rating: 4.8,
      reviews: 65,
      features: ["4x4 Vehicle", "Guide", "China Border", "Meals"],
      itinerary: [
        "Drive from Islamabad to Khunjerab Pass.",
        "Cross the highest paved international border.",
        "Visit the Khunjerab Pass border point.",
        "Experience the stunning Karakoram landscape.",
        "Explore the ancient Hunza Valley on return.",
        "Return journey to Islamabad."
      ],
      transportDetails: "4x4 vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 15,
      title: "Chitral to Yarkhun Valley Trek",
      agency: "Valley Trekkers",
      price: 17000,
      rating: 4.6,
      reviews: 42,
      features: ["Guided Trek", "Camping Gear", "Meals", "Permits"],
      itinerary: [
        "Drive from Chitral to Yarkhun Valley.",
        "Trek through the remote Yarkhun Valley.",
        "Experience the untouched natural beauty.",
        "Visit ancient villages and meet local communities.",
        "Camping in the pristine valley environment.",
        "Return journey to Chitral."
      ],
      transportDetails: "4x4 vehicle and trekking equipment",
      pickupDropoff: "Hotel pickup and drop-off from Chitral included",
      imageUrl: "https://images.unsplash.com/photo-1586276393635-5ecd8a851acc?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 16,
      title: "Attabad Lake Boat Tour",
      agency: "Lake Adventures",
      price: 6000,
      rating: 4.5,
      reviews: 103,
      features: ["Boat Ride", "Guide", "Lake Views", "Snacks"],
      itinerary: [
        "Drive from Islamabad to Attabad Lake.",
        "Boat ride across the stunning turquoise lake.",
        "Visit the landslide dam site.",
        "Explore the surrounding mountain scenery.",
        "Photography opportunities at scenic points.",
        "Return journey to Islamabad."
      ],
      transportDetails: "Air-conditioned vehicle and boat ride",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 17,
      title: "Neelum Valley Jeep Safari",
      agency: "Valley Safaris PK",
      price: 13000,
      rating: 4.7,
      reviews: 95,
      features: ["Jeep Safari", "4x4 Vehicle", "Guide", "Picnic Spot"],
      itinerary: [
        "Drive from Muzaffarabad to Keran Village.",
        "Explore the pristine beauty of Neelum Valley.",
        "Visit Shounter Lake for its crystal-clear waters.",
        "Experience jeep safari through rugged terrain.",
        "Stop at Keran Top for panoramic valley views.",
        "Return journey to Muzaffarabad."
      ],
      transportDetails: "4x4 jeep with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Muzaffarabad included",
      imageUrl: "https://images.unsplash.com/photo-1587497030844-751d0b45d1c9?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 18,
      title: "Gorakh Hill Station Trek",
      agency: "Highland Trekkers",
      price: 9500,
      rating: 4.6,
      reviews: 72,
      features: ["Trekking Guide", "Camping Gear", "Meals", "Sunrise View"],
      itinerary: [
        "Drive from Karachi to Gorakh Hill Station.",
        "Trek to the highest point of Gorakh Hills.",
        "Experience camping in Balochistan's highlands.",
        "Witness spectacular sunrise over the desert.",
        "Visit the Gorakh Hotel for local cuisine.",
        "Explore the vast desert landscape."
      ],
      transportDetails: "4x4 vehicle and trekking guide",
      pickupDropoff: "Hotel pickup and drop-off from Karachi included",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 19,
      title: "Kaghan Valley Luxury Tour",
      agency: "Luxury Valley Tours",
      price: 28000,
      rating: 4.9,
      reviews: 68,
      features: ["Luxury Transport", "5-Star Accommodation", "Guide", "All Meals"],
      itinerary: [
        "Drive from Islamabad to Kaghan Valley.",
        "Stay at luxury resorts in Mansehra.",
        "Visit Saif-ul-Mulook Lake with private boat ride.",
        "Explore Lama Dubar and Batakundi meadows.",
        "Experience local culture with traditional dinner.",
        "Relaxation and sightseeing throughout the valley."
      ],
      transportDetails: "Luxury 4x4 vehicle with chauffeur",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 20,
      title: "Chilam Chowki Scenic Drive",
      agency: "Scenic Routes PK",
      price: 7500,
      rating: 4.5,
      reviews: 89,
      features: ["Scenic Drive", "AC Transport", "Guide", "Tea Stop"],
      itinerary: [
        "Drive from Rawalpindi to Chilam Chowki.",
        "Experience the highest point accessible by road in Pakistan.",
        "Enjoy panoramic views of Murree and surrounding areas.",
        "Stop at traditional tea stalls for local snacks.",
        "Visit the historical British-era buildings.",
        "Photography opportunities at scenic viewpoints."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Rawalpindi included",
      imageUrl: "https://images.unsplash.com/photo-1596386461396-59d825d0c4f3?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 21,
      title: "Rama Meadows Family Tour",
      agency: "Family Adventures PK",
      price: 11000,
      rating: 4.6,
      reviews: 102,
      features: ["Family Friendly", "AC Transport", "Guide", "Picnic Spot"],
      itinerary: [
        "Drive from Islamabad to Astore Valley.",
        "Visit Rama Meadows for family picnic.",
        "Explore the lush green pastures and streams.",
        "Enjoy horse riding activities for kids.",
        "Visit Rama Lake for boating experience.",
        "Return journey to Islamabad with packed lunch."
      ],
      transportDetails: "Air-conditioned vehicle with experienced driver",
      pickupDropoff: "Hotel pickup and drop-off from Islamabad included",
      imageUrl: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 22,
      title: "Broghol Pass Expedition",
      agency: "Extreme Adventures",
      price: 35000,
      rating: 4.8,
      reviews: 43,
      features: ["Expedition", "4x4 Vehicle", "Guide", "Camping Gear"],
      itinerary: [
        "Drive from Chitral to Broghol Pass border.",
        "Cross the historic trade route to Afghanistan.",
        "Experience high-altitude terrain and landscapes.",
        "Camp near the pass at extreme altitude.",
        "Witness the convergence of three mountain ranges.",
        "Return journey to Chitral with permits arranged."
      ],
      transportDetails: "4x4 expedition vehicle with experienced crew",
      pickupDropoff: "Hotel pickup and drop-off from Chitral included",
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const [selectedTour, setSelectedTour] = useState<typeof tourPackages[0] | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating' | 'newest'>('default');

  // Sort the tour packages based on the selected filter
  const sortedTourPackages = [...tourPackages].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return b.id - a.id;
      case 'default':
      default:
        return a.id - b.id;
    }
  });

  const handleViewDetails = (tour: typeof tourPackages[0], event: React.MouseEvent) => {
    console.log('Viewing details for tour:', tour);
    const cardElement = (event.target as HTMLElement).closest('.glass-pane');
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      setModalPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    setSelectedTour(tour);
    setIsDetailsModalOpen(true);
  };

  const handleBookTour = (tour: typeof tourPackages[0], event: React.MouseEvent) => {
    // Auth guard: require login for booking
    if (!currentUser) {
      onAuthRequired?.();
      return;
    }
    console.log('Booking tour:', tour);
    const cardElement = (event.target as HTMLElement).closest('.glass-pane');
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect();
      setModalPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    setSelectedTour(tour);
    setIsBookingModalOpen(true);
  };

  const handleAskAI = (tour: typeof tourPackages[0]) => {
    // Call the passed function to open the chatbot with context about the selected tour
    onAskExplorerAI(tour);
  };

  return (
    <>
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-2xl font-bold text-primary">Discoveries Near You</h3>

          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="glass-input px-3 py-2 text-sm rounded-lg"
            >
              <option value="default">Default Order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {sortedTourPackages.map((pkg) => (
            <div key={pkg.id} className="relative p-4 glass-pane flex flex-col sm:flex-row gap-4">
              {pkg.imageUrl ? (
                <img
                  src={pkg.imageUrl}
                  alt={`Image of ${pkg.title}`}
                  className="w-full sm:w-32 h-32 flex-shrink-0 object-cover rounded-2xl bg-black/10 dark:bg-white/10"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center';
                      fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-secondary opacity-30" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg>';
                      parent.insertBefore(fallback, e.currentTarget);
                    }
                  }}
                />
              ) : (
                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative border border-black/10 dark:border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary opacity-30" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex-grow flex flex-col sm:justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <button
                      className="font-semibold text-primary hover:text-[color:var(--accent-color)] text-lg text-left"
                      onClick={(e) => handleViewDetails(pkg, e)}
                    >
                      {pkg.title}
                    </button>
                    <div className="text-lg font-bold text-[color:var(--accent-color)]">PKR {pkg.price.toLocaleString()}</div>
                  </div>
                  <p className="text-sm text-secondary">{pkg.agency}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.features.map((feature, index) => (
                      <span key={index} className="inline-block bg-blue-500/10 text-blue-500 text-xs font-semibold px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-primary"
                    onClick={(e) => handleBookTour(pkg, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </button>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 text-sm glass-button-secondary"
                    onClick={() => handleAskAI(pkg)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Ask Explorer AI
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTour && (
        <TourDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          tourPackage={selectedTour}
          onBookNow={() => {
            setIsDetailsModalOpen(false);
            setIsBookingModalOpen(true);
          }}
          onAskAI={handleAskAI}
          position={modalPosition}
          currentUser={currentUser}
          onAuthRequired={onAuthRequired}
        />
      )}
      {selectedTour && (
        <TourBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          tourPackage={selectedTour}
          onBookingConfirmed={onBookingConfirmed}
          userLocation={location}
          position={modalPosition}
        />
      )}
    </>
  );
};

export default TourPackagesSection;