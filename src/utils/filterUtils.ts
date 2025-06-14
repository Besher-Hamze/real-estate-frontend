import { SortOption } from '@/components/home/SortComponent';
import { RealEstateData, Filters, FilterParams, PropertySize, PropertyValue, DynamicProperties } from '@/lib/types';

// Extended filters interface to include dynamic properties
export interface ExtendedFilters extends Filters {
  [key: string]: any; // For dynamic properties with property_ prefix
}

// Extended filter params to handle dynamic properties
export interface ExtendedFilterParams extends Omit<FilterParams, 'filters'> {
  filters: ExtendedFilters;
}

// Helper function to get dynamic property value from real estate item
const getDynamicPropertyValue = (item: RealEstateData, propertyKey: string): any => {
  // First check if the item has dynamic properties
  if (item.properties && typeof item.properties === 'object') {
    const propertyValue = item.properties[propertyKey] as PropertyValue;
    if (propertyValue) {
      return propertyValue.value;
    }
  }

  // Fallback to legacy property mapping for backward compatibility
  const propertyMapping: Record<string, keyof RealEstateData> = {
    'rooms_count': 'bedrooms',
    'bathrooms_count': 'bathrooms',
    'total_area': 'buildingArea',
    'floor_number': 'floorNumber',
    'contract_duration': 'rentalDuration',
    'furnishing_status': 'furnished',
    'view_type': 'facade',
    'building_age': 'buildingAge',
  };

  const mappedField = propertyMapping[propertyKey];
  if (mappedField && item[mappedField] !== undefined) {
    return item[mappedField];
  }

  // Try to find the property directly on the item
  return (item as any)[propertyKey];
};

// Helper function to check if a value matches a filter
const matchesFilter = (itemValue: any, filterValue: any, dataType: string): boolean => {
  if (!filterValue || filterValue === '') return true;

  switch (dataType.toLowerCase()) {
    case 'number':
      if (typeof filterValue === 'object' && filterValue !== null) {
        const numValue = parseFloat(itemValue?.toString() || '0');
        const min = filterValue.min ? parseFloat(filterValue.min) : Number.NEGATIVE_INFINITY;
        const max = filterValue.max ? parseFloat(filterValue.max) : Number.POSITIVE_INFINITY;
        return numValue >= min && numValue <= max;
      }
      return parseFloat(itemValue?.toString() || '0') === parseFloat(filterValue);

    case 'single_choice':
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase() === filterValue.toString().toLowerCase();

    case 'multiple_choice':
      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) return true;

        // If item value is an array (multiple selected values)
        if (Array.isArray(itemValue)) {
          return filterValue.some(fValue =>
            itemValue.some(iValue =>
              iValue?.toString().toLowerCase() === fValue.toString().toLowerCase()
            )
          );
        }
        // If item value is a single value
        else if (itemValue) {
          return filterValue.some(fValue =>
            itemValue.toString().toLowerCase() === fValue.toString().toLowerCase()
          );
        }
      }
      return true;

    case 'boolean':
      if (typeof filterValue === 'boolean') {
        return Boolean(itemValue) === filterValue;
      }
      return true;

    case 'text':
      if (itemValue === null || itemValue === undefined) return false;
      const itemStr = itemValue.toString().toLowerCase();
      const filterStr = filterValue.toString().toLowerCase();
      return itemStr.includes(filterStr);

    case 'date':
      // Handle date filtering if needed
      return true;

    default:
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase() === filterValue.toString().toLowerCase();
  }
};

// Main filter function for real estate data
export const filterRealEstateData = (
  realEstateData: RealEstateData[],
  { selectedMainTypeId, selectedSubTypeId, priceRange, filters }: ExtendedFilterParams,
  sortOption?: SortOption,
  propertyDefinitions?: Array<{ propertyKey: string, dataType: string }> // Property definitions for better filtering
): RealEstateData[] => {
  const filteredData = realEstateData.filter((item) => {
    // Main category filter
    if (selectedMainTypeId && item.mainCategoryId !== selectedMainTypeId) {
      return false;
    }

    // Sub category filter
    if (selectedSubTypeId && item.subCategoryId !== selectedSubTypeId) {
      return false;
    }

    // Final type filter
    if ((filters.finalType && filters.finalType !== "") &&
      item.finalTypeId !== parseInt(filters.finalType)) {
      return false;
    }

    // Price range filter
    if (item.price < priceRange[0] || item.price > priceRange[1]) {
      return false;
    }

    // Building area range filter
    if (filters.minArea && filters.maxArea) {
      const buildingArea = parseFloat(item.buildingArea || '0');
      const minArea = parseFloat(filters.minArea);
      const maxArea = parseFloat(filters.maxArea);
      if (!isNaN(buildingArea) && !isNaN(minArea) && !isNaN(maxArea)) {
        if (buildingArea < minArea || buildingArea > maxArea) {
          return false;
        }
      }
    }

    // Legacy static filters for backward compatibility
    if (filters.bedrooms) {
      if (filters.bedrooms === "-1") {
        if ((item.bedrooms || 0) <= 8) {
          return false;
        }
      } else if ((item.bedrooms || 0).toString() !== filters.bedrooms) {
        return false;
      }
    }

    if (filters.bathrooms) {
      if (filters.bathrooms === "-1") {
        if ((item.bathrooms || 0) <= 4) {
          return false;
        }
      } else if ((item.bathrooms || 0).toString() !== filters.bathrooms) {
        return false;
      }
    }

    if (filters.city && filters.city !== "") {
      if (item.cityId != parseInt(filters.city)) {
        return false;
      }
    }

    if (filters.neighborhood && filters.neighborhood !== "") {
      if (item.neighborhoodId != parseInt(filters.neighborhood)) {
        return false;
      }
    }

    if (filters.finalCity && filters.finalCity !== "") {
      if (item.finalCityId != parseInt(filters.finalCity)) {
        return false;
      }
    }

    if (filters.isFurnished && filters.isFurnished !== "") {
      if (item.furnished?.toString().toLowerCase() !== filters.isFurnished.toLowerCase()) {
        return false;
      }
    }

    if (filters.rentalPeriod && filters.rentalPeriod !== "") {
      if (item.rentalDuration !== filters.rentalPeriod) {
        return false;
      }
    }

    if (filters.floor && filters.floor !== "") {
      if ((item.floorNumber || 0) !== parseInt(filters.floor)) {
        return false;
      }
    }

    if (filters.view && filters.view !== "") {
      if (item.facade?.toLowerCase() !== filters.view.toLowerCase()) {
        return false;
      }
    }

    // Dynamic property filters
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterKey.startsWith('property_')) {
        const propertyKey = filterKey.replace('property_', '');
        const itemValue = getDynamicPropertyValue(item, propertyKey);

        // Find property definition to get data type
        const propertyDef = propertyDefinitions?.find(p => p.propertyKey === propertyKey);
        const dataType = propertyDef?.dataType || 'text';

        if (!matchesFilter(itemValue, filterValue, dataType)) {
          return false;
        }
      }
    }

    return true;
  });

  if (sortOption) {
    return sortRealEstateData(filteredData, sortOption, propertyDefinitions);
  }

  return filteredData;
};

// Enhanced sorting function
export const sortRealEstateData = (
  data: RealEstateData[],
  sortOption: SortOption,
  propertyDefinitions?: Array<{ propertyKey: string, dataType: string }>
): RealEstateData[] => {
  return [...data].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortOption.field) {
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;

      case 'buildingArea':
        valueA = parseFloat(a.buildingArea || '0');
        valueB = parseFloat(b.buildingArea || '0');
        break;

      case 'bedrooms':
        valueA = a.bedrooms || 0;
        valueB = b.bedrooms || 0;
        break;

      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;

      // Handle dynamic property sorting
      default:
        if (sortOption.field.startsWith('property_')) {
          const propertyKey = sortOption.field.replace('property_', '');
          valueA = getDynamicPropertyValue(a, propertyKey);
          valueB = getDynamicPropertyValue(b, propertyKey);

          // Find property definition to determine data type
          const propertyDef = propertyDefinitions?.find(p => p.propertyKey === propertyKey);
          const dataType = propertyDef?.dataType || 'text';

          // Convert to appropriate type for sorting
          if (dataType.toLowerCase() === 'number') {
            valueA = parseFloat(valueA?.toString() || '0');
            valueB = parseFloat(valueB?.toString() || '0');
          } else if (dataType.toLowerCase() === 'date') {
            valueA = new Date(valueA || 0).getTime();
            valueB = new Date(valueB || 0).getTime();
          } else {
            // String sorting
            valueA = valueA?.toString() || '';
            valueB = valueB?.toString() || '';
          }
        } else {
          return 0;
        }
    }

    // Handle null/undefined values
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';

    if (sortOption.direction === 'asc') {
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB, 'ar');
      }
      return valueA - valueB;
    } else {
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueB.localeCompare(valueA, 'ar');
      }
      return valueB - valueA;
    }
  });
};

// Updated initial filter state
export const initialFilterState: ExtendedFilters = {
  bedrooms: "",
  propertySize: "",
  finalType: "",
  bathrooms: "",
  city: "",
  floor: "",
  isFurnished: "",
  neighborhood: "",
  rentalPeriod: "",
  view: "",
  buildingArea: "",
  finalCity: "",
  maxArea: "",
  minArea: ""
};

// Default sort option
export const initialSortOption: SortOption = {
  field: 'createdAt',
  direction: 'desc',
  label: 'أحدث الإعلانات'
};

export const getPropertySizeLabel = (size: PropertySize): string => {
  switch (size) {
    case "small": return "أقل من 100م²";
    case "medium": return "100م² - 200م²";
    case "large": return "200م² - 300م²";
    case "xlarge": return "أكثر من 300م²";
    default: return "";
  }
};

// Helper function to create filter params from form data
export const createFilterParams = (
  filters: ExtendedFilters,
  selectedMainTypeId: number | null,
  selectedSubTypeId: number | null,
  priceRange: [number, number]
): ExtendedFilterParams => {
  return {
    filters,
    selectedMainTypeId,
    selectedSubTypeId,
    priceRange
  };
};

// Helper function to get active filter count
export const getActiveFilterCount = (
  filters: ExtendedFilters,
  selectedMainTypeId: number | null,
  selectedSubTypeId: number | null,
  priceRange: [number, number]
): number => {
  let count = 0;

  if (selectedMainTypeId) count++;
  if (selectedSubTypeId) count++;
  if (priceRange[0] > 0 || priceRange[1] < 1000000) count++;

  // Count static filters
  Object.entries(filters).forEach(([key, value]) => {
    if (!key.startsWith('property_') && value && value !== '') {
      count++;
    }
  });

  // Count dynamic property filters
  Object.entries(filters).forEach(([key, value]) => {
    if (key.startsWith('property_')) {
      if (Array.isArray(value) && value.length > 0) {
        count++;
      } else if (typeof value === 'object' && value !== null) {
        if (Object.values(value).some(v => v && v !== '')) {
          count++;
        }
      } else if (value && value !== '') {
        count++;
      }
    }
  });

  return count;
};

// Helper function to clear all filters
export const clearAllFilters = (): ExtendedFilters => {
  return { ...initialFilterState };
};

// Helper function to clear specific filter
export const clearFilter = (filters: ExtendedFilters, filterKey: string): ExtendedFilters => {
  const newFilters = { ...filters };

  if (filterKey === 'city') {
    // Clear dependent filters
    newFilters.city = '';
    newFilters.neighborhood = '';
    newFilters.finalCity = '';
  } else if (filterKey === 'neighborhood') {
    newFilters.neighborhood = '';
    newFilters.finalCity = '';
  } else if (filterKey.startsWith('property_')) {
    delete newFilters[filterKey];
  } else {
    newFilters[filterKey as keyof ExtendedFilters] = '';
  }

  return newFilters;
};

// Helper function to extract property definitions from real estate data
export const extractPropertyDefinitions = (realEstateData: RealEstateData[]): Array<{ propertyKey: string, dataType: string }> => {
  const definitions: Array<{ propertyKey: string, dataType: string }> = [];
  const seen = new Set<string>();

  realEstateData.forEach(item => {
    if (item.properties) {
      Object.entries(item.properties).forEach(([propertyKey, propertyValue]) => {
        if (!seen.has(propertyKey)) {
          seen.add(propertyKey);
          const dataType = propertyValue.property?.dataType?.toLowerCase() || 'text';
          definitions.push({ propertyKey, dataType });
        }
      });
    }
  });

  return definitions;
};

// Helper function to get display value for dynamic property
export const getDisplayValue = (propertyValue: PropertyValue): string => {
  if (!propertyValue) return '';

  const value = propertyValue.value;
  const unit = propertyValue.property?.unit;

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا';
  }

  const stringValue = value?.toString() || '';
  return unit ? `${stringValue} ${unit}` : stringValue;
};

// Helper function to search in dynamic properties
export const searchInDynamicProperties = (item: RealEstateData, searchTerm: string): boolean => {
  if (!item.properties || !searchTerm) return false;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return Object.values(item.properties).some(propertyValue => {
    if (!propertyValue) return false;

    // Search in property name
    if (propertyValue.property?.propertyName?.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }

    // Search in property value
    const value = propertyValue.value;
    if (Array.isArray(value)) {
      return value.some(v => v?.toString().toLowerCase().includes(lowerSearchTerm));
    } else if (value) {
      return value.toString().toLowerCase().includes(lowerSearchTerm);
    }

    return false;
  });
};

export default {
  filterRealEstateData,
  sortRealEstateData,
  initialFilterState,
  initialSortOption,
  getPropertySizeLabel,
  createFilterParams,
  getActiveFilterCount,
  clearAllFilters,
  clearFilter,
  extractPropertyDefinitions,
  getDisplayValue,
  searchInDynamicProperties,
  getDynamicPropertyValue,
  matchesFilter
};