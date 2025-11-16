import type { ChatPost } from '../types';

export const dummyChatData: ChatPost[] = [
  {
    id: 1,
    author: 'Alex G.',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
    content: "Just found the most amazing little cafe, 'The Daily Grind'. Their espresso is top-notch! Highly recommend.",
    distance: 1.2,
    timestamp: '5m ago',
    placeRecommendation: {
      name: 'The Daily Grind',
      rating: 4.8,
    }
  },
  {
    id: 2,
    author: 'Maria S.',
    avatarUrl: 'https://i.pravatar.cc/150?u=maria',
    content: "Has anyone seen the new art installation in Central Park? It's breathtaking!",
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723a9ce6890?q=80&w=800&auto=format&fit=crop',
    distance: 3.5,
    timestamp: '25m ago',
  },
  {
    id: 3,
    author: 'David Chen',
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
    content: "Looking for a good hotel near the airport, any suggestions? Needs to be quiet.",
    distance: 15.8,
    timestamp: '1h ago',
  },
  {
    id: 4,
    author: 'Priya Patel',
    avatarUrl: 'https://i.pravatar.cc/150?u=priya',
    content: "Just finished a wonderful stay at The Grand Vista. The service was impeccable and the views were incredible. A bit pricey but worth it for a special occasion.",
    distance: 12.1,
    timestamp: '3h ago',
    placeRecommendation: {
      name: 'The Grand Vista Hotel',
      rating: 5.0,
    }
  },
  {
    id: 5,
    author: 'John Miller',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
    content: "The sunset from Beacon Hill is absolutely stunning tonight. You have to see this!",
    imageUrl: 'https://images.unsplash.com/photo-1542359649-31e03cdde4e8?q=80&w=800&auto=format&fit=crop',
    distance: 8.2,
    timestamp: '8h ago',
  },
  {
    id: 6,
    author: 'Emily White',
    avatarUrl: 'https://i.pravatar.cc/150?u=emily',
    content: "Does anyone know if 'Luigi's Trattoria' takes reservations online? I can't get through on the phone.",
    distance: 2.1,
    timestamp: '1d ago',
  },
    {
    id: 7,
    author: 'Carlos R.',
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos',
    content: "Heads up! There's a street food festival happening by the waterfront today. So many good options!",
    distance: 0.8,
    timestamp: '2d ago',
  },
];
