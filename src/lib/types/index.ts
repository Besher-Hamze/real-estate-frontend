
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
  buildingItemId?: string;
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


export interface BuildingItem {
  id: string;
  name: string;
  price: string;
  area: string;
  type: 'apartment' | 'shop'
}


export interface Building {
  id: string;
  title: string;
  status: 'مكتمل' | 'قيد الإنشاء' | 'مخطط';
  location: string;
  items?: BuildingItem[]
}

export interface CreateBuilding {
  title: string;
  status: Building['status'];
  location: Building['location'];
}

export interface UpdateBuilding {
  title?: string;
  status?: Building['status'];
  location?: Building['location'];
}

export interface BuildingItem {
  id: string;
  name: string;
  price: string;
  area: string;
  type: 'apartment' | 'shop';
  building_id: string;
}

export interface CreateBuildingItem {
  name: string;
  price: string;
  area: string;
  type: BuildingItem['type'];
  building_id: string;
}

export interface UpdateBuildingItem {
  name?: string;
  price?: string;
  area?: string;
  type?: BuildingItem['type'];
}

export interface PropertyCardProps {
  item: RealEstateData;
  mainType: MainType | undefined;
  selectedSubType?: SubType | undefined;
}

export type PriceRange = [number, number];



export interface Filters {
  bedrooms: string;
  bathrooms: string;
  finalType: string;
  city: string;
  neighborhood: string;
  propertySize: string;
  isFurnished: boolean;
  rentalPeriod: string;
  floor: string;
  view: string;
  buildingArea: string;
}
export interface FilterParams {
  selectedMainTypeId: number | null;
  selectedSubTypeId: number | null;
  priceRange: PriceRange;
  filters: Filters;
}

export type PropertySize = "small" | "medium" | "large" | "xlarge" | "";
