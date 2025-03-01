import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, Home, Maximize, ChevronsLeftRight, ChevronUp, Building, MapPin, Bath, BedDouble, Clock, Mountain, Layers, LucideIcon, LampFloorIcon, HomeIcon, LayersIcon, Building2Icon, RotateCcw, X } from 'lucide-react';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { CityType, Filters, FinalType, NeighborhoodType, MainType, SubType, PriceRange, PropertySize } from '@/lib/types';
import { cityApi } from '@/api/cityApi';
import { neighborhoodApi } from '@/api/NeighborhoodApi';
import { getPropertySizeLabel } from '@/utils/filterUtils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
    {label}
    <button onClick={onRemove} className="hover:text-blue-900">
      <X className="w-4 h-4" />
    </button>
  </span>
);

interface FilterSectionProps {
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
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  enable?: boolean;
}

const defaultFilters: Filters = {
  bedrooms: '',
  bathrooms: '',
  finalType: '',
  city: '',
  neighborhood: '',
  propertySize: '',
  isFurnished: false,
  rentalPeriod: '',
  floor: '',
  view: '',
  buildingArea: "",
};

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
  setSelectedSubTypeId
}: FilterSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [minInput, setMinInput] = useState(priceRange[0].toString());
  const [maxInput, setMaxInput] = useState(priceRange[1].toString());
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  
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

  const formatPrice = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

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

  // دالة إعادة تعيين الفلاتر إلى الوضع الافتراضي
  const resetFilters = () => {
    setFilters(defaultFilters);
    setPriceRange([0, 1000000]);
    setMinInput("0");
    setMaxInput("1000000");

    // إعادة تعيين الأنواع الرئيسية والفرعية إذا تم توفيرها
    if (setSelectedMainTypeId) {
      setSelectedMainTypeId(null);
    }
    if (setSelectedSubTypeId) {
      setSelectedSubTypeId(null);
    }
  };

  const SelectField: React.FC<SelectFieldProps> = ({ label, icon: Icon, value, onChange, options, className = '', enable = true }) => (
    <div className="relative group">
      <label className="block text-sm font-medium text-gray-700 mb-2 mr-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          {label}
        </div>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-white text-gray-700 rounded-xl px-4 py-3 border border-gray-200 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200
                    hover:border-blue-300 ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  // === Active Filters Logic ===

  // التحقق مما إذا كانت هناك فلاتر نشطة
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

  // الحصول على اسم المدينة بناءً على الرقم التعريفي
  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id.toString() === cityId);
    return city ? city.name : cityId;
  };

  // الحصول على اسم الحي بناءً على الرقم التعريفي
  const getNeighborhoodName = (neighborhoodId: string): string => {
    const neighborhood = neighborhoods.find(n => n.id.toString() === neighborhoodId);
    return neighborhood ? neighborhood.name : neighborhoodId;
  };

  // الحصول على اسم التصنيف النهائي بناءً على الرقم التعريفي
  const getFinalTypeName = (finalTypeId: string): string => {
    const finalType = finalTypes.find(f => f.id.toString() === finalTypeId);
    return finalType ? finalType.name : finalTypeId;
  };

  // الحصول على تسمية الطابق بناءً على القيمة
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

  // الحصول على تسمية فترة الإيجار بناءً على القيمة
  const getRentalPeriodLabel = (period: string): string => {
    const periodLabels: Record<string, string> = {
      '1': 'شهر',
      '3': 'ثلاثة شهور',
      '6': 'ستة شهور',
      '12': 'سنة'
    };

    return periodLabels[period] || period;
  };

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
                label={`المدينة: ${getCityName(filters.city)}`}
                onRemove={() => setFilters({ ...filters, city: "", neighborhood: "" })}
              />
            )}

            {filters.neighborhood && (
              <FilterChip
                label={`الحي: ${getNeighborhoodName(filters.neighborhood)}`}
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
      {/* عرض الفلاتر النشطة */}
      {renderActiveFilters()}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <SelectField
              label="التصنيف"
              icon={Building}
              value={filters.finalType}
              onChange={(e) => setFilters({ ...filters, finalType: e.target.value })}
              options={[{ value: '', label: 'الكل' }, ...finalTypes.map(f => ({ value: f.id, label: f.name }))]}
            />

            <SelectField
              label="المدينة"
              icon={MapPin}
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value, neighborhood: '' })}
              options={[{ value: '', label: 'الكل' }, ...cities.map(c => ({ value: c.id, label: c.name }))]}
            />

            <SelectField
              label="الحي"
              icon={Building2Icon}
              value={filters.neighborhood}
              onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
              options={[{ value: '', label: 'الكل' }, ...neighborhoods.map(n => ({ value: n.id, label: n.name }))]}
              className={!filters.city ? 'opacity-50 cursor-not-allowed' : ''}
              enable={filters.city != ""}
            />

            <SelectField
              label="عدد الغرف"
              icon={BedDouble}
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              options={[
                { value: '', label: 'جميع الغرف' },
                ...Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} ${i === 0 ? 'غرفة' : 'غرف'}` }))
              ]}
            />

            <SelectField
              label="عدد الحمامات"
              icon={Bath}
              value={filters.bathrooms}
              onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              options={[
                { value: '', label: 'الكل' },
                ...Array.from({ length: 4 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
              ]}
            />

            {isRental && <SelectField
              label="مدة الإيجار"
              icon={Clock}
              value={filters.rentalPeriod}
              onChange={(e) => setFilters({ ...filters, rentalPeriod: e.target.value })}
              options={[
                { value: '', label: 'جميع المدد' },
                { value: '1', label: 'شهر' },
                { value: '3', label: 'ثلاث شهور' },
                { value: '6', label: 'ستة شهور' },
                { value: '12', label: 'سنة' }
              ]}
            />
            }
            <SelectField
              label="الإطلالة"
              icon={Mountain}
              value={filters.view}
              onChange={(e) => setFilters({ ...filters, view: e.target.value })}
              options={[
                { value: '', label: 'جميع الإطلالات' },
                { value: 'بحرية', label: 'بحرية' },
                { value: 'جبلية', label: 'جبلية' },
                { value: 'على الشارع', label: 'على الشارع' },
                { value: 'حديقة داخلية', label: 'حديقة داخلية' },
                { value: 'داخلية', label: 'داخلية' }
              ]}
            />

            <SelectField
              label="الطابق"
              icon={LayersIcon}
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              options={[
                { value: '', label: 'الكل' },
                { value: '0', label: 'أرضي' },
                { value: '1', label: 'أول' },
                { value: '2', label: 'ثاني' },
                { value: '3', label: 'ثالث' },
                { value: '4', label: 'رابع' },
                { value: '5', label: 'خامس' },
              ]}
            />

            <SelectField
              label="حالة الفرش"
              icon={HomeIcon}
              value={filters.isFurnished === null ? '' : filters.isFurnished.toString()}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                setFilters({ ...filters, isFurnished: value! });
              }}
              options={[
                { value: '', label: 'الكل' },
                { value: 'true', label: 'مفروشة' },
                { value: 'false', label: 'غير مفروشة' },
              ]}
            />
          </div>

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
        </div>


      </div>
    </div>
  );
};

export default FilterSection;