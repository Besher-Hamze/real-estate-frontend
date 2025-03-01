import React, { useEffect, useState } from 'react';
import { Filter, ChevronDown, Home, Maximize, ChevronsLeftRight, ChevronUp, Building, MapPin, Bath, BedDouble, Clock, Mountain, Layers, LucideIcon, LampFloorIcon, HomeIcon } from 'lucide-react';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { CityType, Filters, FinalType, NeighborhoodType } from '@/lib/types';
import { cityApi } from '@/api/cityApi';
import { neighborhoodApi } from '@/api/NeighborhoodApi';

interface FilterSectionProps {
  filters: Filters;
  subId: number | null;
  setFilters: (filters: Filters) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
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

const FilterSection = ({ filters = defaultFilters, setFilters, priceRange, setPriceRange, subId }: FilterSectionProps) => {
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
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-600 transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600 transition-transform duration-300" />
          )}
        </div>
      </div>

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
              icon={Layers}
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

            <SelectField
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
              icon={LampFloorIcon}
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

            {/* <SelectField
              label="المساحة"
              icon={HomeIcon} 
              value={filters.buildingArea}
              onChange={(e) => setFilters({ ...filters, buildingArea: e.target.value })}
              options={[
                { value: '', label: 'الكل' }, 
                { value: '50-100', label: '50 - 100 م²' },
                { value: '101-150', label: '101 - 150 م²' },
                { value: '151-200', label: '151 - 200 م²' },
                { value: '200+', label: 'أكثر من 200 م²' },
              ]}
            /> */}

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