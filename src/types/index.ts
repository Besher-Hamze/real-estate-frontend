export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    rentPerMonth?: number;
    image: string;
    images: string[];
    type: 'house' | 'apartment' | 'villa' | 'land';
    status: 'for-sale' | 'for-rent';
    bedrooms: number;
    bathrooms: number;
    size: number;
    parking: boolean;
    location: string;
    createdAt: Date;
  }
  
  export interface PropertyFilters {
    type: string;
    status: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    location: string;
  }
  
  export interface NavLink {
    name: string;
    href: string;
  }