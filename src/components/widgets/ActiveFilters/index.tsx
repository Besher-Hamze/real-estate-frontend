import { X } from "lucide-react";
import { MainType, SubType, Filters, PriceRange, PropertySize } from "@/lib/types";
import { getPropertySizeLabel } from "@/utils/filterUtils";
import { FilterChip } from "@/components/home/home";

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
          label={`المدينة: ${filters.city}`}
          onRemove={() => setFilters({ ...filters, city: "" })}
        />
      )}

      {filters.neighborhood && (
        <FilterChip
          label={`الحي: ${filters.neighborhood}`}
          onRemove={() => setFilters({ ...filters, neighborhood: "" })}
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
