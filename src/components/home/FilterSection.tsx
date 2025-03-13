import React, { useEffect, useState } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronsLeftRight,
  ChevronUp,
  Building,
  MapPin,
  Bath,
  BedDouble,
  Clock,
  Mountain,
  HomeIcon,
  LayersIcon,
  Building2Icon,
  X
} from 'lucide-react';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import {
  CityType,
  Filters,
  FinalType,
  NeighborhoodType,
  PropertySize,
  FilterSectionProps,
  FinalCityType
} from '@/lib/types';
import { cityApi } from '@/api/cityApi';
import { neighborhoodApi } from '@/api/NeighborhoodApi';
import { getPropertySizeLabel } from '@/utils/filterUtils';
import SortComponent from './SortComponent';
import { FilterChip } from './home';
import { SelectField } from './SelectField';
import { finalCityApi } from '@/api/finalCityApi';
import { FLOOR_OPTIONS, FURNISHED_OPTIONS, RENTAL_DURATION_OPTIONS, VIEW_OPTIONS } from '../ui/constants/formOptions';
import { RealEstateApi } from '@/api/realEstateApi';

// Default filter values
const defaultFilters: Filters = {
  bedrooms: '',
  bathrooms: '',
  finalType: '',
  city: '',
  neighborhood: '',
  finalCity: '',
  propertySize: '',
  isFurnished: "0",
  rentalPeriod: '',
  floor: '',
  view: '',
  buildingArea: "",
};
interface BackendFilterConfig {
  finalTypeId?: boolean;
  cityId?: boolean;
  neighborhoodId?: boolean;
  finalCityId?: boolean;
  bedrooms?: boolean;
  bathrooms?: boolean;
  rentalDuration?: boolean;
  viewTime?: boolean;
  floorNumber?: boolean;
  furnished?: boolean;
  buildingArea?: boolean;
  price?: boolean;
}



const FilterSection = ({
  filters = defaultFilters,
  setFilters,
  priceRange,
  setPriceRange,
  subId,
  isRental,
  currentMainType,
  currentSubType,
  selectedMainTypeId,
  setSelectedMainTypeId,
  selectedSubTypeId,
  setSelectedSubTypeId,
  sortOption,
  setSortOption
}: FilterSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [minInput, setMinInput] = useState(priceRange[0].toString());
  const [maxInput, setMaxInput] = useState(priceRange[1].toString());
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [backendFilterConfig, setBackendFilterConfig] = useState<BackendFilterConfig>({
    finalTypeId: true,
    cityId: true,
    neighborhoodId: true,
    finalCityId: true,
    bedrooms: true,
    bathrooms: true,
    rentalDuration: true,
    viewTime: true,
    floorNumber: true,
    furnished: true,
    buildingArea: true,
    price: true
  });

  useEffect(() => {
    const fetchFilterConfiguration = async () => {
      try {
        if (currentMainType && currentSubType) {
          const filterConfig = await RealEstateApi.fetchFilter(
            currentMainType.name,
            currentSubType.name,
            finalTypes.find(f => f.id == parseInt(filters.finalType))?.name
          );
          console.log(filterConfig);
          
          setBackendFilterConfig(filterConfig);
        }
      } catch (error) {
        console.error('Failed to fetch filter configuration', error);
        setBackendFilterConfig({
          finalTypeId: true,
          cityId: true,
          neighborhoodId: true,
          finalCityId: true,
          bedrooms: true,
          bathrooms: true,
          rentalDuration: true,
          viewTime: true,
          floorNumber: true,
          furnished: true,
          buildingArea: true,
          price: true
        });
      }
    };

    fetchFilterConfiguration();
  }, [currentMainType, currentSubType,filters.finalType]);

  useEffect(() => {
    if (subId) {
      finalTypeTypeApi.fetchFinalTypeBySubId(subId).then(setFinalTypes);
    }
  }, [subId]);

  useEffect(() => {
    cityApi.fetchCity().then(setCities);
  }, []);

  useEffect(() => {
    if (filters.city) {
      neighborhoodApi.fetchNeighborhoodByCityId(parseInt(filters.city)).then(setNeighborhoods);
    } else {
      setNeighborhoods([]);
    }
  }, [filters.city]);

  useEffect(() => {
    if (filters.neighborhood) {
      finalCityApi.fetchFinalCityByNeighborhoodId(parseInt(filters.neighborhood)).then(setFinalCities);
    } else {
      setFinalCities([]);
    }
  }, [filters.neighborhood]);

  const handlePriceChange = (type: 'min' | 'max', value: string): void => {
    const cleanValue = value.replace(/,/g, '');
    if (type === 'min') {
      setMinInput(cleanValue);
      const numericValue = parseInt(cleanValue);
      if (!isNaN(numericValue)) {
        setPriceRange([numericValue, priceRange[1]]);
      }
    } else {
      setMaxInput(cleanValue);
      const numericValue = parseInt(cleanValue);
      if (!isNaN(numericValue)) {
        setPriceRange([priceRange[0], numericValue]);
      }
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters);
    setPriceRange([0, 1000000]);
    setMinInput("0");
    setMaxInput("1000000");

    if (setSelectedMainTypeId) {
      setSelectedMainTypeId(null);
    }
    if (setSelectedSubTypeId) {
      setSelectedSubTypeId(null);
    }
  };

  // Check for any active filters
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

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id.toString() === cityId);
    return city ? city.name : cityId;
  };

  const getNeighborhoodName = (neighborhoodId: string): string => {
    const neighborhood = neighborhoods.find(n => n.id.toString() === neighborhoodId);
    return neighborhood ? neighborhood.name : neighborhoodId;
  };

  const getFinalTypeName = (finalTypeId: string): string => {
    const finalType = finalTypes.find(f => f.id.toString() === finalTypeId);
    return finalType ? finalType.name : finalTypeId;
  };

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

  const getRentalPeriodLabel = (period: string): string => {
    const periodLabels: Record<string, string> = {
      '1': 'شهر',
      '3': 'ثلاثة شهور',
      '6': 'ستة شهور',
      '12': 'سنة'
    };

    return periodLabels[period] || period;
  };

  // Render active filters (chips)
  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;
    return (
      <div className="mb-6 px-6 pb-0 pt-0">
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-gray-600 text-sm ml-2">الفلاتر النشطة:</span>

            {selectedMainTypeId && currentMainType && (
              <FilterChip
                label={currentMainType.name}
                onRemove={() => {
                  if (setSelectedMainTypeId) setSelectedMainTypeId(null);
                }}
              />
            )}

            {selectedSubTypeId && currentSubType && (
              <FilterChip
                label={currentSubType.name}
                onRemove={() => {
                  if (setSelectedSubTypeId) setSelectedSubTypeId(null);
                }}
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
                label={`${filters.bedrooms === "-1" ? "اكثر من 8" : filters.bedrooms} ${parseInt(filters.bedrooms) === 1 ? "غرفة" : "غرف"}`}
                onRemove={() => setFilters({ ...filters, bedrooms: "" })}
              />
            )}

            {filters.bathrooms && (
              <FilterChip
                label={`${filters.bathrooms === "-1" ? "اكثر من 4" : filters.bathrooms} ${parseInt(filters.bathrooms) === 1 ? "حمام" : "حمامات"}`}
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
                onRemove={() => setFilters({ ...filters, isFurnished: "" })}
              />
            )}

            <button
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 mr-auto"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg my-8 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800 text-lg">تصفية العقارات</span>
          </div>
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-blue-600 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600 transition-transform duration-300" />
            )}
          </div>
        </div>
      </div>
      <SortComponent currentSort={sortOption} onSortChange={setSortOption} className="p-4" />
      {renderActiveFilters()}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {/* Render Final Type filter */}
            {backendFilterConfig.finalTypeId && (
              <SelectField
                label="التصنيف"
                icon={Building}
                value={filters.finalType}
                onChange={(e) => setFilters({ ...filters, finalType: e.target.value })}
                options={[{ value: '', label: 'الكل' }, ...finalTypes.map(f => ({ value: f.id, label: f.name }))]}
              />
            )}

            {/* Render City filter */}
            {backendFilterConfig.cityId && (
              <SelectField
                label="المحافظة"
                icon={MapPin}
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value, neighborhood: '' })}
                options={[{ value: '', label: 'الكل' }, ...cities.map(c => ({ value: c.id, label: c.name }))]}
              />
            )}

            {/* Render Neighborhood filter */}
            {backendFilterConfig.neighborhoodId && (
              <SelectField
                label="المدينة"
                icon={Building2Icon}
                value={filters.neighborhood}
                onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                options={[{ value: '', label: 'الكل' }, ...neighborhoods.map(n => ({ value: n.id, label: n.name }))]}
                className={!filters.city ? 'opacity-50 cursor-not-allowed' : ''}
                enable={filters.city !== ""}
              />
            )}

            {/* Render Final City filter */}
            {backendFilterConfig.finalCityId && (
              <SelectField
                label="الحي"
                icon={Building2Icon}
                value={filters.finalCity}
                onChange={(e) => setFilters({ ...filters, finalCity: e.target.value })}
                options={[{ value: '', label: 'الكل' }, ...finalCities.map(n => ({ value: n.id, label: n.name }))]}
                className={!filters.finalCity ? 'opacity-50 cursor-not-allowed' : ''}
                enable={filters.finalCity !== ""}
              />
            )}

            {/* Render Bedrooms filter */}
            {backendFilterConfig.bedrooms && (
              <SelectField
                label="عدد الغرف"
                icon={BedDouble}
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                options={[
                  { value: '', label: 'جميع الغرف' },
                  ...Array.from({ length: 8 }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1} ${i === 0 ? 'غرفة' : 'غرف'}`
                  })),
                  { value: -1, label: `اكثر من ${8} غرف` },
                ]}
              />
            )}

            {/* Render Bathrooms filter */}
            {backendFilterConfig.bathrooms && (
              <SelectField
                label="عدد الحمامات"
                icon={Bath}
                value={filters.bathrooms}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                options={[
                  { value: '', label: 'جميع الحمامات' },
                  ...Array.from({ length: 4 }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1} ${i === 0 ? 'حمام' : 'حمامات'}`
                  })),
                  { value: -1, label: `اكثر من ${4} حمام` },
                ]}
              />
            )}

            {/* Render Property Size filter if buildingArea is enabled */}
            {backendFilterConfig.buildingArea && (
              <SelectField
                label="المساحة"
                icon={Building}
                value={filters.propertySize}
                onChange={(e) => setFilters({ ...filters, propertySize: e.target.value })}
                options={[
                  { value: '', label: 'الكل' },
                  // Add your property size options here
                ]}
              />
            )}

            {/* Render Rental Duration only if allowed (it is false in our config) */}
            {isRental && backendFilterConfig.rentalDuration && (
              <SelectField
                label="مدة الإيجار"
                icon={Clock}
                value={filters.rentalPeriod}
                onChange={(e) => setFilters({ ...filters, rentalPeriod: e.target.value })}
                options={[
                  { value: '', label: 'جميع المدد' },
                  ...RENTAL_DURATION_OPTIONS,
                ]}
              />
            )}

            {/* Render View filter */}
            {backendFilterConfig.viewTime && (
              <SelectField
                label="الإطلالة"
                icon={Mountain}
                value={filters.view}
                onChange={(e) => setFilters({ ...filters, view: e.target.value })}
                options={[
                  { value: '', label: 'جميع الإطلالات' },
                  ...VIEW_OPTIONS,
                ]}
              />
            )}

            {/* Render Floor filter */}
            {backendFilterConfig.floorNumber && (
              <SelectField
                label="الطابق"
                icon={LayersIcon}
                value={filters.floor}
                onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
                options={[
                  { value: '', label: 'الكل' },
                  ...FLOOR_OPTIONS,
                ]}
              />
            )}

            {/* Render Furnished filter */}
            {backendFilterConfig.furnished && (
              <SelectField
                label="حالة الفرش"
                icon={HomeIcon}
                value={filters.isFurnished === null ? '' : filters.isFurnished.toString()}
                onChange={(e) => setFilters({ ...filters, isFurnished: e.target.value })}
                options={[
                  { value: '', label: 'الكل' },
                  ...FURNISHED_OPTIONS,
                ]}
              />
            )}
          </div>

          {/* Price Range filter */}
          {backendFilterConfig.price && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <ChevronsLeftRight className="w-4 h-4 text-blue-600" />
                  نطاق السعر
                  <span className="text-blue-600 font-semibold">
                    ({parseInt(minInput.replace(/,/g, '')).toLocaleString()} - {parseInt(maxInput.replace(/,/g, '')).toLocaleString()})
                  </span>
                </div>
              </label>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={parseInt(maxInput.replace(/,/g, ''))}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={minInput ?? 0}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="flex-1 bg-white rounded-lg px-4 py-2 text-sm border focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="الحد الأدنى"
                      dir="ltr"
                    />
                    <input
                      type="number"
                      value={maxInput}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="flex-1 bg-white rounded-lg px-4 py-2 text-sm border focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="الحد الأقصى"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
