import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin,
  Building2Icon,
  X,
  Loader2,
  Hash,
  Type,
  CheckSquare,
  Calendar,
  FileText,
  Search,
  Sliders,
  Grid3X3,
  Settings,
  Tag,
  DollarSign,
  Check
} from 'lucide-react';
import { finalTypeTypeApi } from '@/api/finalTypeApi';
import { FilterPropertiesApi } from '@/api/filterPropertiesApi';
import {
  CityType,
  Filters,
  FinalType,
  NeighborhoodType,
  FilterSectionProps,
  FinalCityType,
  ApiDynamicProperty,
  RealEstateData,
  PropertyValue
} from '@/lib/types';
import { cityApi } from '@/api/cityApi';
import { neighborhoodApi } from '@/api/NeighborhoodApi';
import { getPropertySizeLabel } from '@/utils/filterUtils';
import SortComponent from './SortComponent';
import { FilterChip } from './home';
import { SelectField } from './SelectField';
import { finalCityApi } from '@/api/finalCityApi';

// Extended filters to support multiple selections
interface ExtendedFilters extends Filters {
  [key: string]: any; // For dynamic properties
}

// Default filter values - updated to support multiple selections
const defaultFilters: ExtendedFilters = {
  bedrooms: [],
  bathrooms: [],
  finalType: [],
  city: [],
  neighborhood: [],
  finalCity: [],
  propertySize: [],
  isFurnished: [],
  rentalPeriod: [],
  floor: [],
  view: [],
  buildingArea: "",
  maxArea: "",
  minArea: ""
};

// Chip Button Component - OpenSouq Style
const FilterChipButton = ({
  label,
  isSelected,
  onClick,
  icon: Icon,
  variant = 'default',
  count
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'price' | 'location' | 'property';
  count?: number;
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'price':
        return isSelected
          ? 'bg-green-500 text-white border-green-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50';
      case 'location':
        return isSelected
          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50';
      case 'property':
        return isSelected
          ? 'bg-purple-500 text-white border-purple-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50';
      default:
        return isSelected
          ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 
        transition-all duration-200 font-medium text-sm min-h-[40px]
        ${getVariantStyles()}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {count && count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
          {count}
        </span>
      )}
      {isSelected && <Check className="w-3 h-3" />}
    </button>
  );
};

// Multi-Select Chips Section Component
const MultiSelectChipsSection = ({
  title,
  options,
  selectedValues,
  onChange,
  icon: Icon,
  variant = 'default',
  loading = false
}: {
  title: string;
  options: Array<{ value: string | number; label: string; count?: number }>;
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'price' | 'location' | 'property';
  loading?: boolean;
}) => {
  const toggleOption = (value: string | number) => {
    const stringValue = value.toString();
    const currentStringValues = selectedValues.map(v => v.toString());

    if (currentStringValues.includes(stringValue)) {
      onChange(selectedValues.filter(v => v.toString() !== stringValue));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-400">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {selectedValues.length > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
            {selectedValues.length}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <FilterChipButton
            key={option.value}
            label={option.label}
            isSelected={selectedValues.map(v => v.toString()).includes(option.value.toString())}
            onClick={() => toggleOption(option.value)}
            variant={variant}
            count={option.count}
          />
        ))}
      </div>
    </div>
  );
};

// Range Input Component
const RangeInputGroup = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = { min: '0', max: '∞' },
  unit = '',
  icon: Icon
}: {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  placeholder?: { min: string; max: string };
  unit?: string;
  icon?: React.ComponentType<any>;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            placeholder={placeholder.min}
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <span className="text-gray-400 font-medium">-</span>
        <div className="flex-1">
          <input
            type="number"
            placeholder={placeholder.max}
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        {unit && <span className="text-sm text-gray-500 min-w-[30px]">{unit}</span>}
      </div>
    </div>
  );
};

// Price Range Section
const PriceRangeSection = ({
  priceRange,
  setPriceRange,
  isRental = false
}: {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  isRental?: boolean;
}) => {
  const currency = 'ر.ع';
  const maxPrice = isRental ? 10000 : 1000000;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const quickPrices = isRental ? [
    { label: 'أقل من 500', min: 0, max: 500 },
    { label: '500 - 1000', min: 500, max: 1000 },
    { label: '1000 - 2000', min: 1000, max: 2000 },
    { label: '2000 - 5000', min: 2000, max: 5000 },
    { label: '5000+', min: 5000, max: maxPrice }
  ] : [
    { label: 'أقل من 50 ألف', min: 0, max: 50000 },
    { label: '50 - 100 ألف', min: 50000, max: 100000 },
    { label: '100 - 200 ألف', min: 100000, max: 200000 },
    { label: '200 - 500 ألف', min: 200000, max: 500000 },
    { label: '500 ألف+', min: 500000, max: maxPrice }
  ];

  return (
    <div className="space-y-4">
      <RangeInputGroup
        label={`السعر ${isRental ? '(إيجار شهري)' : '(سعر البيع)'}`}
        minValue={priceRange[0].toString()}
        maxValue={priceRange[1].toString()}
        onMinChange={(value) => {
          const numValue = parseInt(value) || 0;
          setPriceRange([numValue, priceRange[1]]);
        }}
        onMaxChange={(value) => {
          const numValue = parseInt(value) || maxPrice;
          setPriceRange([priceRange[0], numValue]);
        }}
        placeholder={{ min: '0', max: maxPrice.toString() }}
        unit={currency}
        icon={DollarSign}
      />

      {/* Quick price selections */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">اختيارات سريعة:</span>
        <div className="flex flex-wrap gap-2">
          {quickPrices.map((range, index) => (
            <FilterChipButton
              key={index}
              label={range.label}
              isSelected={priceRange[0] === range.min && priceRange[1] === range.max}
              onClick={() => setPriceRange([range.min, range.max])}
              variant="price"
            />
          ))}
        </div>
      </div>

      {/* Current range display */}
      {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 text-center">
            {formatNumber(priceRange[0])} - {formatNumber(priceRange[1])} {currency}
          </div>
        </div>
      )}
    </div>
  );
};

// Dynamic Property Field Component
const DynamicPropertyChipsField = ({
  property,
  value,
  onChange
}: {
  property: ApiDynamicProperty;
  value: any;
  onChange: (value: any) => void;
}) => {
  switch (property.dataType) {
    case 'single_choice':
      const singleChoiceOptions = (property.allowedValues as string[])?.map(val => ({
        value: val,
        label: val
      })) || [];

      return (
        <MultiSelectChipsSection
          title={property.propertyName}
          options={singleChoiceOptions}
          selectedValues={Array.isArray(value) ? value : (value ? [value] : [])}
          onChange={(values) => onChange(values)}
          icon={Building}
          variant="property"
        />
      );

    case 'multiple_choice':
      const multiChoiceOptions = (property.allowedValues as string[])?.map(val => ({
        value: val,
        label: val
      })) || [];

      return (
        <MultiSelectChipsSection
          title={property.propertyName}
          options={multiChoiceOptions}
          selectedValues={value || []}
          onChange={(values) => onChange(values)}
          icon={Grid3X3}
          variant="property"
        />
      );

    case 'number':
      return (
        <RangeInputGroup
          label={property.propertyName}
          minValue={value?.min || ''}
          maxValue={value?.max || ''}
          onMinChange={(minVal) =>
            onChange({ ...value, min: minVal })}
          onMaxChange={(maxVal) =>
            onChange({ ...value, max: maxVal })}
          unit={property.unit || ''}
          icon={Hash}
        />
      );

    case 'boolean':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{property.propertyName}</span>
          </div>
          <div className="flex gap-2">
            <FilterChipButton
              label="نعم"
              isSelected={value === true}
              onClick={() => onChange(value === true ? null : true)}
              variant="property"
              icon={Check}
            />
            <FilterChipButton
              label="لا"
              isSelected={value === false}
              onClick={() => onChange(value === false ? null : false)}
              variant="property"
              icon={X}
            />
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{property.propertyName}</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={property.placeholder || `ابحث في ${property.propertyName}`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Main Filter Section Component
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
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [dynamicProperties, setDynamicProperties] = useState<ApiDynamicProperty[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState<string | null>('location');

  // Get the current finalTypeId from the selected finalType filter
  const currentFinalTypeId = useMemo(() => {
    const finalTypeArray = Array.isArray(filters.finalType) ? filters.finalType :
      filters.finalType ? [filters.finalType] : [];
    return finalTypeArray.length === 1 ? parseInt(finalTypeArray[0].toString()) : null;
  }, [filters.finalType]);

  // Group dynamic properties
  const groupedProperties = useMemo(() => {
    return dynamicProperties.reduce((groups: Record<string, ApiDynamicProperty[]>, property) => {
      const groupName = (property.groupName && property.groupName.trim() !== '')
        ? property.groupName
        : 'خصائص أساسية';

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(property);
      return groups;
    }, {});
  }, [dynamicProperties]);

  // Fetch dynamic filter properties
  const fetchFilterProperties = useCallback(async () => {
    if (!currentFinalTypeId) {
      setDynamicProperties([]);
      return;
    }

    setIsLoadingProperties(true);
    try {
      const response = await FilterPropertiesApi.getFilterProperties(currentFinalTypeId);
      if (response && Array.isArray(response)) {
        const sortedProperties = response.sort((a, b) => a.displayOrder - b.displayOrder);
        setDynamicProperties(sortedProperties);
      } else {
        setDynamicProperties([]);
      }
    } catch (error) {
      console.error('Failed to fetch filter properties:', error);
      setDynamicProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  }, [currentFinalTypeId]);

  // Data fetching effects
  useEffect(() => {
    if (subId) {
      finalTypeTypeApi.fetchFinalTypeBySubId(subId).then(setFinalTypes);
    }
  }, [subId]);

  useEffect(() => {
    cityApi.fetchCity().then(setCities);
  }, []);

  useEffect(() => {
    const cityArray = Array.isArray(filters.city) ? filters.city :
      filters.city ? [filters.city] : [];

    if (cityArray.length === 1) {
      neighborhoodApi.fetchNeighborhoodByCityId(parseInt(cityArray[0].toString())).then(setNeighborhoods);
    } else {
      setNeighborhoods([]);
      const newFilters = { ...filters };
      newFilters.neighborhood = [];
      newFilters.finalCity = [];
      setFilters(newFilters);
    }
  }, [filters.city]);

  useEffect(() => {
    const neighborhoodArray = Array.isArray(filters.neighborhood) ? filters.neighborhood :
      filters.neighborhood ? [filters.neighborhood] : [];

    if (neighborhoodArray.length === 1) {
      finalCityApi.fetchFinalCityByNeighborhoodId(parseInt(neighborhoodArray[0].toString())).then(setFinalCities);
    } else {
      setFinalCities([]);
      const newFilters = { ...filters };
      newFilters.finalCity = [];
      setFilters(newFilters);
    }
  }, [filters.neighborhood]);

  useEffect(() => {
    fetchFilterProperties();
  }, [fetchFilterProperties]);

  // Clear dynamic filters when finalType changes
  useEffect(() => {
    if (currentFinalTypeId) {
      setDynamicFilters({});
      const newFilters = { ...filters };
      Object.keys(newFilters).forEach(key => {
        if (key.startsWith('property_')) {
          delete newFilters[key];
        }
      });
      if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
        setFilters(newFilters);
      }
    }
  }, [currentFinalTypeId]);

  // Handler for dynamic property changes
  const handleDynamicPropertyChange = useCallback((propertyKey: string, value: any) => {
    setDynamicFilters(prev => ({
      ...prev,
      [propertyKey]: value
    }));

    setFilters(prevFilters => ({
      ...prevFilters,
      [`property_${propertyKey}`]: value
    }));
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setDynamicFilters({});
    setPriceRange([0, isRental ? 10000 : 1000000]);
    if (setSelectedMainTypeId) setSelectedMainTypeId(null);
    if (setSelectedSubTypeId) setSelectedSubTypeId(null);
  }, [setFilters, setPriceRange, setSelectedMainTypeId, setSelectedSubTypeId, isRental]);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    return selectedMainTypeId ||
      selectedSubTypeId ||
      Object.values(filters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value && value !== '';
      }) ||
      Object.values(dynamicFilters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => v && v !== '');
        }
        return value && value !== '';
      }) ||
      priceRange[0] > 0 ||
      priceRange[1] < (isRental ? 10000 : 1000000);
  }, [selectedMainTypeId, selectedSubTypeId, filters, dynamicFilters, priceRange, isRental]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedMainTypeId) count++;
    if (selectedSubTypeId) count++;
    if (priceRange[0] > 0 || priceRange[1] < (isRental ? 10000 : 1000000)) count++;

    Object.entries(filters).forEach(([key, value]) => {
      if (!key.startsWith('property_')) {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (value && value !== '') count++;
      }
    });

    Object.values(dynamicFilters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'object' && value !== null) {
        if (Object.values(value).some(v => v && v !== '')) count++;
      } else if (value && value !== '') count++;
    });

    return count;
  }, [selectedMainTypeId, selectedSubTypeId, filters, dynamicFilters, priceRange, isRental]);

  // Helper functions for updating filters
  const updateFilter = (key: string, values: (string | number)[]) => {
    setFilters(prev => ({
      ...prev,
      [key]: values
    }));
  };

  // Section toggle handler
  const toggleSection = (sectionName: string) => {
    setActiveSection(activeSection === sectionName ? null : sectionName);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 my-6 overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-white" />
            <div>
              <h2 className="font-bold text-white text-lg">فلترة الإعلانات</h2>
              <p className="text-white/80 text-sm">اختر أكثر من خيار للبحث الدقيق</p>
            </div>
            {activeFilterCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-white text-sm font-medium">{activeFilterCount}</span>
              </div>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Sort Component */}
      <div className="border-b border-gray-100">
        <SortComponent currentSort={sortOption} onSortChange={setSortOption} className="p-4" />
      </div>

      {/* Filter Content */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-4 space-y-6">

          {/* Location Section */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">الموقع ونوع العقار</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${activeSection === 'location' ? 'rotate-180' : ''}`} />
            </button>

            {activeSection === 'location' && (
              <div className="pl-4 space-y-6">
                {/* Cities */}
                <MultiSelectChipsSection
                  title="المحافظة"
                  options={cities.map(city => ({ value: city.id, label: city.name }))}
                  selectedValues={Array.isArray(filters.city) ? filters.city : (filters.city ? [filters.city] : [])}
                  onChange={(values) => {
                    updateFilter('city', values);
                    updateFilter('neighborhood', []); // Reset dependent filters
                    updateFilter('finalCity', []);
                  }}
                  icon={MapPin}
                  variant="location"
                />

                {/* Neighborhoods */}
                {neighborhoods.length > 0 && (
                  <MultiSelectChipsSection
                    title="المدينة"
                    options={neighborhoods.map(neighborhood => ({ value: neighborhood.id, label: neighborhood.name }))}
                    selectedValues={Array.isArray(filters.neighborhood) ? filters.neighborhood : (filters.neighborhood ? [filters.neighborhood] : [])}
                    onChange={(values) => {
                      updateFilter('neighborhood', values);
                      updateFilter('finalCity', []); // Reset dependent filters
                    }}
                    icon={Building2Icon}
                    variant="location"
                  />
                )}

                {/* Final Cities */}
                {finalCities.length > 0 && (
                  <MultiSelectChipsSection
                    title="المنطقة"
                    options={finalCities.map(finalCity => ({ value: finalCity.id, label: finalCity.name }))}
                    selectedValues={Array.isArray(filters.finalCity) ? filters.finalCity : (filters.finalCity ? [filters.finalCity] : [])}
                    onChange={(values) => updateFilter('finalCity', values)}
                    icon={Building2Icon}
                    variant="location"
                  />
                )}

                {/* Property Types */}
                {finalTypes.length > 0 && (
                  <MultiSelectChipsSection
                    title="نوع العقار"
                    options={finalTypes.map(type => ({ value: type.id, label: type.name }))}
                    selectedValues={Array.isArray(filters.finalType) ? filters.finalType : (filters.finalType ? [filters.finalType] : [])}
                    onChange={(values) => updateFilter('finalType', values)}
                    icon={Building}
                    variant="default"
                  />
                )}
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="space-y-4">
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-800">السعر</span>
                {(priceRange[0] > 0 || priceRange[1] < (isRental ? 10000 : 1000000)) && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    محدد
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${activeSection === 'price' ? 'rotate-180' : ''}`} />
            </button>

            {activeSection === 'price' && (
              <div className="pl-4">
                <PriceRangeSection
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  isRental={isRental}
                />
              </div>
            )}
          </div>

          {/* Dynamic Properties Sections */}
          {!isLoadingProperties && dynamicProperties.length > 0 && Object.entries(groupedProperties).map(([groupName, properties]) => (
            <div key={groupName} className="space-y-4">
              <button
                onClick={() => toggleSection(groupName)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">{groupName}</span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    {properties.length}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${activeSection === groupName ? 'rotate-180' : ''}`} />
              </button>

              {activeSection === groupName && (
                <div className="pl-4 space-y-6">
                  {properties.map((property) => (
                    <DynamicPropertyChipsField
                      key={property.propertyKey}
                      property={property}
                      value={dynamicFilters[property.propertyKey]}
                      onChange={(value) => handleDynamicPropertyChange(property.propertyKey, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading State */}
          {isLoadingProperties && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-blue-600 animate-spin" />
              <p className="text-gray-600 text-sm">جاري تحميل الخصائص...</p>
            </div>
          )}

          {/* No Properties Message */}
          {!isLoadingProperties && dynamicProperties.length === 0 && currentFinalTypeId && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-sm">لا توجد خصائص إضافية لهذا النوع</p>
            </div>
          )}

          {/* Help Message */}
          {!currentFinalTypeId && finalTypes.length > 0 && (
            <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
              <Building className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <p className="text-blue-700 text-sm font-medium">اختر نوع عقار واحد لعرض الخصائص المتقدمة</p>
            </div>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                مسح جميع الفلاتر ({activeFilterCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;