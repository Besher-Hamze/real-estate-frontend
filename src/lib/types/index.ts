import { LucideIcon } from "lucide-react";

export interface RealEstateFilters {
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
  finalCityId: number;
  title: string;
  description: string;
  price: number;
  cityName: string;
  neighborhoodName: string;
  finalCityName: string;
  buildingAge: string;
  bedrooms: number;
  bathrooms: number;
  furnished: string;
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
  rentalDuration: string;
  ceilingHeight: number;
  totalFloors: number;
  buildingItemId?: string;
  viewTime: string;
  location: string; // ex: "1.43,1.44"
  createdAt: string;
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
export interface FinalCityType {
  id: number;
  name: string;
  neighborhoodId: number
  location?: string;
}

export interface Building {
  id: string;
  title: string;
  status: 'مكتمل' | 'قيد الإنشاء' | 'مخطط';
  location: string;
  buildingAge: string;
  realEstateCount: number;
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
  realestateCount: number;
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

export interface RealEstateCardProps {
  item: RealEstateData;
  mainType: Partial<MainType> | undefined;
  selectedSubType?: SubType | undefined;
}

export type PriceRange = [number, number];

export interface Filters {
  bedrooms: string;
  bathrooms: string;
  finalType: string;
  city: string;
  neighborhood: string;
  finalCity: string;
  propertySize: string;
  isFurnished: string;
  rentalPeriod: string;
  floor: string;
  view: string;
  buildingArea: string;
  minArea: string;
  maxArea: string;
}

export type SortField = 'price' | 'createdAt' | 'buildingArea' | 'bedrooms';

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

export interface FilterParams {
  selectedMainTypeId: number | null;
  selectedSubTypeId: number | null;
  priceRange: [number, number];
  filters: Filters;
  sortOption?: SortOption;
}

export type PropertySize = "small" | "medium" | "large" | "xlarge" | "";

export interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export interface FilterSectionProps {
  filters: Filters;
  subId: number | null;
  setFilters: (filters: Filters) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  isRental: boolean;
  currentMainType?: MainType;
  currentSubType?: SubType;
  selectedMainTypeId?: number | null;
  setSelectedMainTypeId?: (id: number | null) => void;
  selectedSubTypeId?: number | null;
  setSelectedSubTypeId?: (id: number | null) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  enable?: boolean;
}

// ========== الواجهات الجديدة للنظام الديناميكي ==========

// واجهة الخاصية الديناميكية من API
export interface ApiDynamicProperty {
  id: number;
  finalTypeId: number;
  propertyKey: string;
  propertyName: string;
  groupName: string;
  dataType: 'text' | 'number' | 'single_choice' | 'multiple_choice' | 'boolean' | 'date' | 'file';
  allowedValues?: string[] | null;
  isFilter: boolean;
  displayOrder: number;
  isRequired: boolean;
  placeholder?: string | null;
  groupSelect: boolean;
  unit?: string | null;
  createdAt: string;
  updatedAt: string;
  finalType?: {
    id: number;
    subId: number;
    name: string;
    subType?: {
      id: number;
      mainId: number;
      name: string;
      mainType?: {
        id: number;
        name: string;
        icon: string;
      };
    };
  };
  _count?: {
    propertyValues: number;
  };
  propertyValues?: any[];
}

// واجهة المجموعة من API
export interface ApiPropertyGroup {
  groupName: string;
  _count: {
    groupName: number;
  };
}

// واجهة الخصائص المجمعة حسب المجموعة
export interface GroupedProperties {
  [groupName: string]: ApiDynamicProperty[];
}

// واجهة بيانات النموذج الديناميكي
export interface DynamicFormData {
  [propertyKey: string]: any;
}

// واجهة العقار المحسّنة مع الخصائص الديناميكية
export interface EnhancedRealEstateData extends RealEstateData {
  dynamicProperties?: DynamicFormData;
}

// واجهة خطوة النموذج
export interface PropertyFormStep {
  id: number;
  title: string;
  description?: string;
  isActive: boolean;
  isCompleted: boolean;
}

// واجهة بيانات إنشاء العقار الجديدة
export interface CreateRealEstateData {
  // الحقول الثابتة
  title: string;
  description: string;
  price: number;
  mainCategoryId: number;
  subCategoryId: number;
  finalTypeId: number;
  cityId: number;
  neighborhoodId: number;
  finalCityId: number;
  location: string;
  viewTime: string;
  coverImage: File | null;
  files: File[];
  buildingItemId?: string;
  
  // الخصائص الديناميكية
  dynamicProperties: DynamicFormData;
}
