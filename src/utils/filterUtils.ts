import { SortOption } from '@/components/home/SortComponent';
import { RealEstateData, Filters, FilterParams, PropertySize } from '@/lib/types';

export const filterRealEstateData = (
  realEstateData: RealEstateData[],
  { selectedMainTypeId, selectedSubTypeId, priceRange, filters }: FilterParams,
  sortOption?: SortOption
): RealEstateData[] => {
  const filteredData = realEstateData.filter((item) => {
    if (selectedMainTypeId && item.mainCategoryId !== selectedMainTypeId) {
      return false;
    }

    if (selectedSubTypeId && item.subCategoryId !== selectedSubTypeId) {
      return false;
    }

    if ((filters.finalType && filters.finalType !== "") &&
      item.finalTypeId !== parseInt(filters.finalType)) {
      return false;
    }

    if (item.price < priceRange[0] || item.price > priceRange[1]) {
      return false;
    }

    if (filters.bedrooms) {
      if (filters.bedrooms === "-1") {
        if (item.bedrooms <= 8) {
          return false;
        }
      } else if (item.bedrooms.toString() !== filters.bedrooms) {
        return false;
      }
    }


    if (filters.propertySize) {
      const area = parseFloat(item.buildingArea);
      switch (filters.propertySize) {
        case "small":
          if (area >= 100) return false;
          break;
        case "medium":
          if (area < 100 || area >= 200) return false;
          break;
        case "large":
          if (area < 200 || area >= 300) return false;
          break;
        case "xlarge":
          if (area < 300) return false;
          break;
      }
    }

    if (filters.bathrooms) {
      if (filters.bathrooms === "-1") {
        if (item.bathrooms <= 4) {
          return false;
        }
      } else if (item.bathrooms.toString() !== filters.bathrooms) {
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
      console.log(item.furnished);
      
      if (item.furnished.toString().toLocaleLowerCase() !== filters.isFurnished.toLowerCase()) {
        return false;
      }
    }
    if (filters.rentalPeriod && filters.rentalPeriod !== "") {
      if (item.rentalDuration !== parseInt(filters.rentalPeriod)) {
        return false;
      }
    }

    if (filters.floor && filters.floor !== "") {
      if (item.floorNumber !== parseInt(filters.floor)) {
        return false;
      }
    }

    if (filters.view && filters.view !== "") {
      if (item.facade.toLowerCase() !== filters.view.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  if (sortOption) {
    return sortRealEstateData(filteredData, sortOption);
  }

  return filteredData;
};

export const sortRealEstateData = (
  data: RealEstateData[],
  sortOption: SortOption
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
        valueA = parseFloat(a.buildingArea);
        valueB = parseFloat(b.buildingArea);
        break;
      case 'bedrooms':
        valueA = a.bedrooms;
        valueB = b.bedrooms;
        break;
      case 'createdAt':
        valueA = a.id;
        valueB = b.id;
        break;

      default:
        return 0;
    }

    if (sortOption.direction === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
};

export const initialFilterState: Filters = {
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
  finalCity: ""
};

// خيار الترتيب الافتراضي
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