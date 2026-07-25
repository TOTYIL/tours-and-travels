export type BikeCategory = 'scooter' | 'cruiser' | 'adventure';

export interface Bike {
  id: string;
  name: string;
  category: BikeCategory;
  basePricePerDay: number;
  imageUrl: string;
  features: string[];
}
