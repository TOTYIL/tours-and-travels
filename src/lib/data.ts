export interface Bike {
  id: string;
  name: string;
  category: string;
  basePricePerDay: number;
  imageUrl: string;
  features: string[];
  stock: number;
}

export interface Booking {
  id: string;
  bikeId: string;
  bikeName: string;
  customerName: string;
  email: string;
  phone: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  totalPrice: number;
  status: string;
  timestamp: string;
  hasDocuments: boolean;
}

const DEFAULT_FLEET: Bike[] = [
  {
    id: 'himalayan',
    name: 'Royal Enfield Himalayan 411',
    category: 'Adventure',
    basePricePerDay: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    features: ['All-Terrain Tyres', 'Panniers Available', 'ABS', '411cc Engine'],
    stock: 2
  },
  {
    id: 'classic350',
    name: 'Royal Enfield Classic 350',
    category: 'Cruiser',
    basePricePerDay: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5064ce97fe2?auto=format&fit=crop&q=80&w=800',
    features: ['Comfortable Seating', 'Classic Styling', '349cc Engine', 'Disc Brakes'],
    stock: 4
  },
  {
    id: 'meteor',
    name: 'Royal Enfield Meteor 350',
    category: 'Cruiser',
    basePricePerDay: 1300,
    imageUrl: 'https://images.unsplash.com/photo-1647413340578-8ba948b89e7f?auto=format&fit=crop&q=80&w=800',
    features: ['Tripper Navigation', 'Relaxed Stance', '349cc Engine'],
    stock: 3
  },
  {
    id: 'xpulse',
    name: 'Hero XPulse 200 4V',
    category: 'Off-Road',
    basePricePerDay: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1650383794354-946453664d95?auto=format&fit=crop&q=80&w=800',
    features: ['Lightweight', 'High Ground Clearance', '200cc Engine', 'Off-Road Suspension'],
    stock: 3
  },
  {
    id: 'ntorq',
    name: 'TVS NTorq 125',
    category: 'Scooter',
    basePricePerDay: 600,
    imageUrl: 'https://images.unsplash.com/photo-1602735746931-18e4ba398553?auto=format&fit=crop&q=80&w=800',
    features: ['Bluetooth Sync', 'Digital Console', 'Storage', '125cc Engine'],
    stock: 5
  }
];

const DEFAULT_SLIDESHOW = [
  "https://images.unsplash.com/photo-1520116468816-95b69f847357?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1200"
];

export const getFleet = (): Bike[] => {
  const data = localStorage.getItem('yt_fleet');
  return data ? JSON.parse(data) : DEFAULT_FLEET;
};

export const saveFleet = (fleet: Bike[]) => {
  localStorage.setItem('yt_fleet', JSON.stringify(fleet));
};

export const getSlideshow = (): string[] => {
  const data = localStorage.getItem('yt_slideshow');
  return data ? JSON.parse(data) : DEFAULT_SLIDESHOW;
};

export const saveSlideshow = (slides: string[]) => {
  localStorage.setItem('yt_slideshow', JSON.stringify(slides));
};

export const getBookings = (): Booking[] => {
  const data = localStorage.getItem('yt_bookings');
  return data ? JSON.parse(data) : [];
};

export const saveBooking = (booking: Booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('yt_bookings', JSON.stringify(bookings));
};
