import { Bike } from './types';

export const bikes: Bike[] = [
  {
    id: 'b1',
    name: 'Royal Enfield Classic 350',
    category: 'cruiser',
    basePricePerDay: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    features: ['349cc Engine', 'Classic Styling', 'Comfortable Pillion']
  },
  {
    id: 'b2',
    name: 'Himalayan 411',
    category: 'adventure',
    basePricePerDay: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=800',
    features: ['411cc Engine', 'Off-road Ready', 'Luggage Mounts']
  },
  {
    id: 'b3',
    name: 'Honda Activa 6G',
    category: 'scooter',
    basePricePerDay: 600,
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    features: ['110cc Engine', 'Automatic', 'Storage Space']
  },
  {
    id: 'b4',
    name: 'Bajaj Avenger Cruise 220',
    category: 'cruiser',
    basePricePerDay: 900,
    imageUrl: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800',
    features: ['220cc Engine', 'Low Seat Height', 'Highway Cruiser']
  }
];
