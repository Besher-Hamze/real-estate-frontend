import { SortOption } from '@/components/home/SortComponent';
import { RealEstateData, Filters, FilterParams, PropertySize } from '@/lib/types';

export const filterRealEstateData = (
  realEstateData: RealEstateData[],
  { selectedMainTypeId, selectedSubTypeId, priceRange, filters }: FilterParams,
  sortOption?: SortOption
): RealEstateData[] => {
  // فلترة البيانات أولاً
  const filteredData = realEstateData.filter((item) => {
    // 1) mainCategoryId
    if (selectedMainTypeId && item.mainCategoryId !== selectedMainTypeId) {
      return false;
    }

    // 2) subCategoryId
    if (selectedSubTypeId && item.subCategoryId !== selectedSubTypeId) {
      return false;
    }

    // 3) finalTypeId
    if ((filters.finalType && filters.finalType !== "") &&
      item.finalTypeId !== parseInt(filters.finalType)) {
      return false;
    }

    // 4) priceRange
    if (item.price < priceRange[0] || item.price > priceRange[1]) {
      return false;
    }

    // 5) bedrooms
    if (filters.bedrooms && item.bedrooms.toString() !== filters.bedrooms) {
      return false;
    }

    // 6) propertySize (buildingArea)
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

    // 7) Bathrooms
    if (filters.bathrooms && item.bathrooms.toString() !== filters.bathrooms) {
      return false;
    }

    // 8) City
    if (filters.city && filters.city !== "") {
      if (item.cityId != parseInt(filters.city)) {
        return false;
      }
    }

    // 9) Neighborhood
    if (filters.neighborhood && filters.neighborhood !== "") {
      if (item.neighborhoodId != parseInt(filters.neighborhood)) {
        return false;
      }
    }

    // 10) Furnished Status
    if (filters.isFurnished && !item.furnished) {
      return false;
    }

    // 11) Rental Period
    if (filters.rentalPeriod && filters.rentalPeriod !== "") {
      if (item.rentalDuration !== parseInt(filters.rentalPeriod)) {
        return false;
      }
    }

    // 12) Floor Number
    if (filters.floor && filters.floor !== "") {
      if (item.floorNumber !== parseInt(filters.floor)) {
        return false;
      }
    }

    // 13) View/Facade
    if (filters.view && filters.view !== "") {
      if (item.facade.toLowerCase() !== filters.view.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // ثم ترتيب البيانات المفلترة إذا تم توفير خيار الترتيب
  if (sortOption) {
    return sortRealEstateData(filteredData, sortOption);
  }

  return filteredData;
};

// دالة الترتيب
export const sortRealEstateData = (
  data: RealEstateData[],
  sortOption: SortOption
): RealEstateData[] => {
  return [...data].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    // تحديد القيم المناسبة للمقارنة بناءً على حقل الترتيب
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

    // ترتيب تصاعدي أو تنازلي
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
  isFurnished: false,
  neighborhood: "",
  rentalPeriod: "",
  view: "",
  buildingArea: "",
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