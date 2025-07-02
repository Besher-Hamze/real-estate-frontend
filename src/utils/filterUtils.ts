import { SortOption } from '@/components/home/SortComponent';
import { RealEstateData, Filters, FilterParams, PropertyValue, DynamicProperties } from '@/lib/types';

// Extended filters interface to include dynamic properties with multi-select support
export interface ExtendedFilters extends Filters {
  [key: string]: any; // For dynamic properties with property_ prefix
}

// Extended filter params to handle dynamic properties
export interface ExtendedFilterParams extends Omit<FilterParams, 'filters'> {
  filters: ExtendedFilters;
}

// Helper function to get dynamic property value
const getDynamicPropertyValue = (item: RealEstateData, propertyKey: string): any => {
  if (item.properties && item.properties[propertyKey]) {
    return item.properties[propertyKey].value;
  }
  return undefined;
};

// Helper function to check if a value matches a filter (updated for multi-select)
const matchesFilter = (itemValue: any, filterValue: any, dataType: string): boolean => {
  if (!filterValue) return true;

  // Handle array filters (multi-select)
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;

    switch (dataType.toUpperCase()) {
      case 'SINGLE_CHOICE':
      case 'TEXT':
        if (itemValue === null || itemValue === undefined) return false;
        return filterValue.some(fValue =>
          itemValue.toString().toLowerCase() === fValue.toString().toLowerCase()
        );

      case 'MULTIPLE_CHOICE':
        if (Array.isArray(itemValue)) {
          return filterValue.some(fValue =>
            itemValue.some(iValue =>
              iValue?.toString().toLowerCase() === fValue.toString().toLowerCase()
            )
          );
        } else if (itemValue) {
          return filterValue.some(fValue =>
            itemValue.toString().toLowerCase() === fValue.toString().toLowerCase()
          );
        }
        return false;

      case 'NUMBER':
        const numValue = parseFloat(itemValue?.toString() || '0');
        return filterValue.some(fValue => numValue === parseFloat(fValue.toString()));

      default:
        if (itemValue === null || itemValue === undefined) return false;
        return filterValue.some(fValue =>
          itemValue.toString().toLowerCase() === fValue.toString().toLowerCase()
        );
    }
  }

  // Handle single values and objects
  if (filterValue === '') return true;

  switch (dataType.toUpperCase()) {
    case 'NUMBER':
      if (typeof filterValue === 'object' && filterValue !== null) {
        const numValue = parseFloat(itemValue?.toString() || '0');
        const min = filterValue.min ? parseFloat(filterValue.min) : Number.NEGATIVE_INFINITY;
        const max = filterValue.max ? parseFloat(filterValue.max) : Number.POSITIVE_INFINITY;
        return numValue >= min && numValue <= max;
      }
      return parseFloat(itemValue?.toString() || '0') === parseFloat(filterValue);

    case 'SINGLE_CHOICE':
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase() === filterValue.toString().toLowerCase();

    case 'MULTIPLE_CHOICE':
      if (Array.isArray(itemValue)) {
        return itemValue.some(iValue =>
          iValue?.toString().toLowerCase() === filterValue.toString().toLowerCase()
        );
      } else if (itemValue) {
        return itemValue.toString().toLowerCase() === filterValue.toString().toLowerCase();
      }
      return false;

    case 'BOOLEAN':
      if (typeof filterValue === 'boolean') {
        return Boolean(itemValue) === filterValue;
      }
      return true;

    case 'TEXT':
      if (itemValue === null || itemValue === undefined) return false;
      const itemStr = itemValue.toString().toLowerCase();
      const filterStr = filterValue.toString().toLowerCase();
      return itemStr.includes(filterStr);

    case 'DATE':
      if (itemValue && filterValue) {
        const itemDate = new Date(itemValue).getTime();
        const filterDate = new Date(filterValue).getTime();
        return itemDate === filterDate;
      }
      return true;

    default:
      if (itemValue === null || itemValue === undefined) return false;
      return itemValue.toString().toLowerCase() === filterValue.toString().toLowerCase();
  }
};

// Main filter function for real estate data (updated for multi-select)
export const filterRealEstateData = (
  realEstateData: RealEstateData[],
  { selectedMainTypeId, selectedSubTypeId, priceRange, filters }: ExtendedFilterParams,
  sortOption?: SortOption,
  propertyDefinitions?: Array<{ propertyKey: string, dataType: string }>
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

    // Final type filter (multi-select support)
    const finalTypeFilter = filters.finalType;
    if (finalTypeFilter) {
      const finalTypeArray = Array.isArray(finalTypeFilter) ? finalTypeFilter : [finalTypeFilter];
      if (finalTypeArray.length > 0 && finalTypeArray.some(ft => ft !== '')) {
        const validTypes = finalTypeArray.filter(ft => ft !== '').map(ft => parseInt(ft.toString()));
        if (validTypes.length > 0 && !validTypes.includes(item.finalTypeId)) {
          return false;
        }
      }
    }

    // Price range filter
    if (item.price < priceRange[0] || item.price > priceRange[1]) {
      return false;
    }

    // City filter (multi-select support)
    const cityFilter = filters.city;
    if (cityFilter) {
      const cityArray = Array.isArray(cityFilter) ? cityFilter : [cityFilter];
      if (cityArray.length > 0 && cityArray.some(c => c !== '')) {
        const validCities = cityArray.filter(c => c !== '').map(c => parseInt(c.toString()));
        if (validCities.length > 0 && !validCities.includes(item.cityId)) {
          return false;
        }
      }
    }

    // Neighborhood filter (multi-select support)
    const neighborhoodFilter = filters.neighborhood;
    if (neighborhoodFilter) {
      const neighborhoodArray = Array.isArray(neighborhoodFilter) ? neighborhoodFilter : [neighborhoodFilter];
      if (neighborhoodArray.length > 0 && neighborhoodArray.some(n => n !== '')) {
        const validNeighborhoods = neighborhoodArray.filter(n => n !== '').map(n => parseInt(n.toString()));
        if (validNeighborhoods.length > 0 && !validNeighborhoods.includes(item.neighborhoodId)) {
          return false;
        }
      }
    }

    // Final city filter (multi-select support)
    const finalCityFilter = filters.finalCity;
    if (finalCityFilter) {
      const finalCityArray = Array.isArray(finalCityFilter) ? finalCityFilter : [finalCityFilter];
      if (finalCityArray.length > 0 && finalCityArray.some(fc => fc !== '')) {
        const validFinalCities = finalCityArray.filter(fc => fc !== '').map(fc => parseInt(fc.toString()));
        if (validFinalCities.length > 0 && !validFinalCities.includes(item.finalCityId)) {
          return false;
        }
      }
    }

    // Dynamic property filters
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      if (filterKey.startsWith('property_')) {
        const propertyKey = filterKey.replace('property_', '');
        const itemValue = getDynamicPropertyValue(item, propertyKey);
        const propertyDef = propertyDefinitions?.find(p => p.propertyKey === propertyKey);
        const dataType = propertyDef?.dataType?.toUpperCase() || item.properties?.[propertyKey]?.property?.dataType || 'TEXT';

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

      case 'createdAt':
        valueA = new Date(a.createdAt).getTime();
        valueB = new Date(b.createdAt).getTime();
        break;

      default:
        if (sortOption.field.startsWith('property_')) {
          const propertyKey = sortOption.field.replace('property_', '');
          valueA = getDynamicPropertyValue(a, propertyKey);
          valueB = getDynamicPropertyValue(b, propertyKey);

          const propertyDef = propertyDefinitions?.find(p => p.propertyKey === propertyKey);
          const dataType = propertyDef?.dataType?.toUpperCase() || a.properties?.[propertyKey]?.property?.dataType || 'TEXT';

          if (dataType === 'NUMBER') {
            valueA = parseFloat(valueA?.toString() || '0');
            valueB = parseFloat(valueB?.toString() || '0');
          } else if (dataType === 'DATE') {
            valueA = new Date(valueA || 0).getTime();
            valueB = new Date(valueB || 0).getTime();
          } else {
            valueA = valueA?.toString() || '';
            valueB = valueB?.toString() || '';
          }
        } else {
          return 0;
        }
    }

    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';

    if (sortOption.direction === 'asc') {
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB, 'ar');
      }
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueB.localeCompare(valueA, 'ar');
      }
      return valueB < valueA ? -1 : valueB > valueA ? 1 : 0;
    }
  });
};

// Updated initial filter state (multi-select arrays)
export const initialFilterState: ExtendedFilters = {
  finalType: [],
  city: [],
  neighborhood: [],
  finalCity: [],
};

// Default sort option
export const initialSortOption: SortOption = {
  field: 'createdAt',
  direction: 'desc',
  label: 'أحدث الإعلانات'
};

// Helper function to create filter params
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

// Helper function to get active filter count (updated for arrays)
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

  Object.entries(filters).forEach(([key, value]) => {
    if (!key.startsWith('property_')) {
      if (Array.isArray(value) && value.length > 0) {
        count++;
      } else if (value && value !== '') {
        count++;
      }
    }
  });

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

// Helper function to clear specific filter (updated for arrays)
export const clearFilter = (filters: ExtendedFilters, filterKey: string): ExtendedFilters => {
  const newFilters = { ...filters };

  if (filterKey === 'city') {
    newFilters.city = [];
    newFilters.neighborhood = [];
    newFilters.finalCity = [];
  } else if (filterKey === 'neighborhood') {
    newFilters.neighborhood = [];
    newFilters.finalCity = [];
  } else if (filterKey.startsWith('property_')) {
    delete newFilters[filterKey];
  } else {
    // Handle both array and single value filters
    if (Array.isArray(newFilters[filterKey as keyof ExtendedFilters])) {
      newFilters[filterKey as keyof ExtendedFilters] = [];
    } else {
      newFilters[filterKey as keyof ExtendedFilters] = '';
    }
  }

  return newFilters;
};

// Helper function to extract property definitions
export const extractPropertyDefinitions = (realEstateData: RealEstateData[]): Array<{ propertyKey: string, dataType: string }> => {
  const definitions: Array<{ propertyKey: string, dataType: string }> = [];
  const seen = new Set<string>();

  realEstateData.forEach(item => {
    if (item.properties) {
      Object.entries(item.properties).forEach(([propertyKey, propertyValue]) => {
        if (!seen.has(propertyKey)) {
          seen.add(propertyKey);
          const dataType = propertyValue.property?.dataType || 'TEXT';
          definitions.push({ propertyKey, dataType });
        }
      });
    }
  });

  return definitions;
};

// Helper function to get display value
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

    if (propertyValue.property?.propertyName?.toLowerCase().includes(lowerSearchTerm)) {
      return true;
    }

    const value = propertyValue.value;
    if (Array.isArray(value)) {
      return value.some(v => v?.toString().toLowerCase().includes(lowerSearchTerm));
    } else if (value) {
      return value.toString().toLowerCase().includes(lowerSearchTerm);
    }

    return false;
  });
};

// Helper function to convert single values to arrays for backward compatibility
export const normalizeFiltersForMultiSelect = (filters: any): ExtendedFilters => {
  const normalized: ExtendedFilters = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (['city', 'neighborhood', 'finalCity', 'finalType'].includes(key)) {
      // Convert single values to arrays for multi-select fields
      if (Array.isArray(value)) {
        normalized[key] = value;
      } else if (value && value !== '') {
        normalized[key] = [value];
      } else {
        normalized[key] = [];
      }
    } else {
      normalized[key] = value;
    }
  });

  return normalized;
};

// Helper function to get filter summary for display
export const getFilterSummary = (
  filters: ExtendedFilters,
  cities: any[],
  neighborhoods: any[],
  finalCities: any[],
  finalTypes: any[]
): string[] => {
  const summary: string[] = [];

  // City summary
  if (filters.city && Array.isArray(filters.city) && filters.city.length > 0) {
    const cityNames = filters.city.map(id =>
      cities.find(c => c.id.toString() === id.toString())?.name || id
    ).filter(Boolean);
    if (cityNames.length > 0) {
      summary.push(`المحافظة: ${cityNames.join(', ')}`);
    }
  }

  // Neighborhood summary
  if (filters.neighborhood && Array.isArray(filters.neighborhood) && filters.neighborhood.length > 0) {
    const neighborhoodNames = filters.neighborhood.map(id =>
      neighborhoods.find(n => n.id.toString() === id.toString())?.name || id
    ).filter(Boolean);
    if (neighborhoodNames.length > 0) {
      summary.push(`المدينة: ${neighborhoodNames.join(', ')}`);
    }
  }

  // Final city summary
  if (filters.finalCity && Array.isArray(filters.finalCity) && filters.finalCity.length > 0) {
    const finalCityNames = filters.finalCity.map(id =>
      finalCities.find(f => f.id.toString() === id.toString())?.name || id
    ).filter(Boolean);
    if (finalCityNames.length > 0) {
      summary.push(`المنطقة: ${finalCityNames.join(', ')}`);
    }
  }

  // Final type summary
  if (filters.finalType && Array.isArray(filters.finalType) && filters.finalType.length > 0) {
    const typeNames = filters.finalType.map(id =>
      finalTypes.find(t => t.id.toString() === id.toString())?.name || id
    ).filter(Boolean);
    if (typeNames.length > 0) {
      summary.push(`نوع العقار: ${typeNames.join(', ')}`);
    }
  }

  return summary;
};

export default {
  filterRealEstateData,
  sortRealEstateData,
  initialFilterState,
  initialSortOption,
  createFilterParams,
  getActiveFilterCount,
  clearAllFilters,
  clearFilter,
  extractPropertyDefinitions,
  getDisplayValue,
  searchInDynamicProperties,
  getDynamicPropertyValue,
  matchesFilter,
  normalizeFiltersForMultiSelect,
  getFilterSummary
};