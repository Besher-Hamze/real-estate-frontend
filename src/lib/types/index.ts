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

export interface MainType {
  id: number;
  name: string;
  icon: string;
  subtypes: SubType[];
}

export interface SubType {
  id: number;
  name: string;
  mainId: number;
}

export interface FinalType {
  id: number;
  name: string;
  subId: number;
}
export interface RealEstateData {
  id: number;
  cityId: number;
  neighborhoodId: number;
  title: string;
  price: number;
  cityName: string;
  neighborhoodName: string;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  buildingArea: string;
  floorNumber: number;
  facade: string;
  paymentMethod: string;
  mainCategoryId: number;
  subCategoryId: number;
  finalTypeId: number;
  mainCategoryName?: string;
  subCategoryName?: string;
  finalTypeName?: string;
  mainFeatures: string;
  additionalFeatures: string;
  nearbyLocations: string;
  coverImage: string;
  files: string[];
  rentalDuration: number;
  ceilingHeight: number;
  totalFloors: number;
}
export interface CityType {
  id: number;
  name: string;
}
export interface NeighborhoodType {
  id: number;
  name: string;
  cityId: number
}
export interface MainType {
  id: number;
  name: string;
  icon: string;
  subtypes: SubType[];
}

export interface SubType {
  id: number;
  name: string;
  mainId: number;
}

export interface FinalType {
  id: number;
  name: string;
  subId: number;
}
