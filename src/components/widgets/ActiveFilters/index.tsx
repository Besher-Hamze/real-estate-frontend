import { X } from "lucide-react";
import { MainType, SubType, Filters, PriceRange, PropertySize, CityType, FinalType } from "@/lib/types";
import { getPropertySizeLabel } from "@/utils/filterUtils";
import { FilterChip } from "@/components/home/home";
import { cityApi } from "@/api/cityApi";
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { useEffect, useState } from "react";
import { neighborhoodApi } from "@/api/NeighborhoodApi";

interface ActiveFiltersProps {
  currentMainType: MainType | undefined;
  currentSubType: SubType | undefined;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  selectedMainTypeId: number | null;
  setSelectedMainTypeId: (id: number | null) => void;
  selectedSubTypeId: number | null;
  setSelectedSubTypeId: (id: number | null) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  resetFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  currentMainType,
  currentSubType,
  filters,
  setFilters,
  selectedMainTypeId,
  setSelectedMainTypeId,
  selectedSubTypeId,
  setSelectedSubTypeId,
  priceRange,
  setPriceRange,
  resetFilters
}) => {
  // حالات البيانات للمدن والتصنيفات والأحياء
  const [cities, setCities] = useState<CityType[]>([]);
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  // جلب بيانات المدن والتصنيفات عند تحميل المكون
  useEffect(() => {
    cityApi.fetchCity().then(setCities);
    if (selectedSubTypeId) {
      finalTypeTypeApi.fetchFinalTypeBySubId(selectedSubTypeId).then(setFinalTypes);
    }
  }, [selectedSubTypeId]);

  // جلب بيانات الأحياء عندما يتم اختيار مدينة
  useEffect(() => {
    if (filters.city) {
      neighborhoodApi.fetchNeighborhoodByCityId(parseInt(filters.city)).then(setNeighborhoods);
    }
  }, [filters.city]);

  // Check if any filters are active
  const hasActiveFilters = 
    selectedMainTypeId ||
    selectedSubTypeId ||
    filters.bedrooms ||
    filters.propertySize ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000000 ||
    filters.bathrooms ||
    filters.city ||
    filters.finalType ||
    filters.isFurnished ||
    filters.neighborhood ||
    filters.floor ||
    filters.view ||
    filters.rentalPeriod;

  if (!hasActiveFilters) {
    return null;
  }
  
  // الحصول على اسم المحافظة بناءً على الرقم التعريفي
  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id.toString() === cityId);
    return city ? city.name : cityId;
  };

  // الحصول على اسم المدينة بناءً على الرقم التعريفي
  const getNeighborhoodName = (neighborhoodId: string): string => {
    const neighborhood = neighborhoods.find(n => n.id.toString() === neighborhoodId);
    return neighborhood ? neighborhood.name : neighborhoodId;
  };

  // الحصول على اسم التصنيف النهائي بناءً على الرقم التعريفي
  const getFinalTypeName = (finalTypeId: string): string => {
    const finalType = finalTypes.find(f => f.id.toString() === finalTypeId);
    return finalType ? finalType.name : finalTypeId;
  };
  
  // Get floor label based on floor value
  const getFloorLabel = (floor: string): string => {
    const floorLabels: Record<string, string> = {
      '0': 'أرضي',
      '1': 'أول',
      '2': 'ثاني',
      '3': 'ثالث',
      '4': 'رابع',
      '5': 'خامس'
    };
    
    return floorLabels[floor] || floor;
  };
  
  // Get rental period label based on rentalPeriod value
  const getRentalPeriodLabel = (period: string): string => {
    const periodLabels: Record<string, string> = {
      '1': 'شهر',
      '3': 'ثلاثة شهور',
      '6': 'ستة شهور',
      '12': 'سنة'
    };
    
    return periodLabels[period] || period;
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center">
      <span className="text-gray-600 text-sm">الفلاتر النشطة:</span>
      
      {selectedMainTypeId && currentMainType && (
        <FilterChip
          label={currentMainType.name}
          onRemove={() => setSelectedMainTypeId(null)}
        />
      )}
      
      {selectedSubTypeId && currentSubType && (
        <FilterChip
          label={currentSubType.name}
          onRemove={() => setSelectedSubTypeId(null)}
        />
      )}
      
      {filters.finalType && (
        <FilterChip
          label={getFinalTypeName(filters.finalType)}
          onRemove={() => setFilters({ ...filters, finalType: "" })}
        />
      )}
      
      {filters.bedrooms && (
        <FilterChip
          label={`${filters.bedrooms} ${parseInt(filters.bedrooms) === 1 ? "غرفة" : "غرف"}`}
          onRemove={() => setFilters({ ...filters, bedrooms: "" })}
        />
      )}
      
      {filters.bathrooms && (
        <FilterChip
          label={`${filters.bathrooms} ${parseInt(filters.bathrooms) === 1 ? "حمام" : "حمامات"}`}
          onRemove={() => setFilters({ ...filters, bathrooms: "" })}
        />
      )}
      
      {filters.propertySize && (
        <FilterChip
          label={getPropertySizeLabel(filters.propertySize as PropertySize)}
          onRemove={() => setFilters({ ...filters, propertySize: "" })}
        />
      )}
      
      {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
        <FilterChip
          label={`${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} ر.ع`}
          onRemove={() => setPriceRange([0, 1000000])}
        />
      )}

      {filters.city && (
        <FilterChip
          label={`المحافظة: ${getCityName(filters.city)}`}
          onRemove={() => setFilters({ ...filters, city: "", neighborhood: "" })}
        />
      )}

      {filters.neighborhood && (
        <FilterChip
          label={`المدينة: ${getNeighborhoodName(filters.neighborhood)}`}
          onRemove={() => setFilters({ ...filters, neighborhood: "" })}
        />
      )}
      
      {filters.floor && (
        <FilterChip
          label={`الطابق: ${getFloorLabel(filters.floor)}`}
          onRemove={() => setFilters({ ...filters, floor: "" })}
        />
      )}
      
      {filters.view && (
        <FilterChip
          label={`الإطلالة: ${filters.view}`}
          onRemove={() => setFilters({ ...filters, view: "" })}
        />
      )}
      
      {filters.rentalPeriod && (
        <FilterChip
          label={`مدة الإيجار: ${getRentalPeriodLabel(filters.rentalPeriod)}`}
          onRemove={() => setFilters({ ...filters, rentalPeriod: "" })}
        />
      )}

      {filters.isFurnished && (
        <FilterChip
          label="مفروش"
          onRemove={() => setFilters({ ...filters, isFurnished: false })}
        />
      )}
      
      <button
        onClick={resetFilters}
        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
      >
        <X className="w-4 h-4" />
        مسح الكل
      </button>
    </div>
  );
};

export default ActiveFilters;