import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Filter,
  ChevronDown,
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
  Tag
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

// Extended filters to include dynamic properties
interface ExtendedFilters extends Filters {
  [key: string]: any; // For dynamic properties
}

// Default filter values
const defaultFilters: ExtendedFilters = {
  bedrooms: '',
  bathrooms: '',
  finalType: '',
  city: '',
  neighborhood: '',
  finalCity: '',
  propertySize: '',
  isFurnished: "",
  rentalPeriod: '',
  floor: '',
  view: '',
  buildingArea: "",
  maxArea: "",
  minArea: ""
};

// Enhanced component for rendering different data types with better UI
const DynamicPropertyField = ({
  property,
  value,
  onChange
}: {
  property: ApiDynamicProperty;
  value: any;
  onChange: (value: any) => void;
}) => {
  const getIcon = (dataType: string) => {
    switch (dataType) {
      case 'number': return Hash;
      case 'text': return Type;
      case 'boolean': return CheckSquare;
      case 'date': return Calendar;
      case 'single_choice': return Building;
      case 'multiple_choice': return Grid3X3;
      default: return FileText;
    }
  };

  const Icon = getIcon(property.dataType);

  switch (property.dataType) {
    case 'number':
      return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <label className="block text-sm font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-600" />
              {property.propertyName}
              {property.unit && <span className="text-blue-500 text-xs bg-blue-100 px-2 py-1 rounded-full">({property.unit})</span>}
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                placeholder="الحد الأدنى"
                value={value?.min || ''}
                onChange={(e) => onChange({ ...value, min: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              />
              <span className="absolute left-3 top-3 text-gray-400 text-xs">من</span>
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="الحد الأقصى"
                value={value?.max || ''}
                onChange={(e) => onChange({ ...value, max: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              />
              <span className="absolute left-3 top-3 text-gray-400 text-xs">إلى</span>
            </div>
          </div>
        </div>
      );

    case 'single_choice':
      return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <label className="block text-sm font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-green-600" />
              {property.propertyName}
            </div>
          </label>
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm bg-white"
          >
            <option value="">الكل</option>
            {(property.allowedValues as string[])?.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
          <label className="block text-sm font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-purple-600" />
              {property.propertyName}
              {(value || []).length > 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {(value || []).length} محدد
                </span>
              )}
            </div>
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto bg-white rounded-lg p-3 border border-purple-100">
            {(property.allowedValues as string[])?.map(option => (
              <label key={option} className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors group">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors"
                />
                <span className="text-sm group-hover:text-purple-700 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'boolean':
      return (
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 transition-colors"
            />
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
                {property.propertyName}
              </span>
            </div>
          </label>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-600" />
              {property.propertyName}
            </div>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={property.placeholder || `ابحث في ${property.propertyName}`}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm"
            />
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>
      );

    default:
      return null;
  }
};

// Enhanced FilterSection with better UI
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [finalTypes, setFinalTypes] = useState<FinalType[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [dynamicProperties, setDynamicProperties] = useState<ApiDynamicProperty[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'location' | 'properties'>('location');

  // Get the current finalTypeId from the selected finalType filter
  const currentFinalTypeId = useMemo(() => {
    if (filters.finalType) {
      return parseInt(filters.finalType);
    }
    return null;
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

  // Fetch dynamic filter properties based on finalTypeId
  const fetchFilterProperties = useCallback(async () => {
    if (!currentFinalTypeId) {
      setDynamicProperties([]);
      return;
    }

    setIsLoadingProperties(true);
    try {
      const response = await FilterPropertiesApi.getFilterProperties(currentFinalTypeId);

      if (response && Array.isArray(response)) {
        // Sort properties by displayOrder
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
    if (filters.city) {
      neighborhoodApi.fetchNeighborhoodByCityId(parseInt(filters.city)).then(setNeighborhoods);
    } else {
      setNeighborhoods([]);
      setFilters({ ...filters, neighborhood: '', finalCity: '' });
    }
  }, [filters.city]);

  useEffect(() => {
    if (filters.neighborhood) {
      finalCityApi.fetchFinalCityByNeighborhoodId(parseInt(filters.neighborhood)).then(setFinalCities);
    } else {
      setFinalCities([]);
      setFilters({ ...filters, finalCity: '' });
    }
  }, [filters.neighborhood]);

  // Fetch filter properties when finalTypeId changes
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
    setPriceRange([0, 1000000]);

    if (setSelectedMainTypeId) setSelectedMainTypeId(null);
    if (setSelectedSubTypeId) setSelectedSubTypeId(null);
  }, [setFilters, setPriceRange, setSelectedMainTypeId, setSelectedSubTypeId]);

  // Helper functions for displaying filter values
  const getDisplayName = useCallback((type: string, id: string) => {
    switch (type) {
      case 'city':
        return cities.find(c => c.id.toString() === id)?.name || id;
      case 'neighborhood':
        return neighborhoods.find(n => n.id.toString() === id)?.name || id;
      case 'finalCity':
        return finalCities.find(f => f.id.toString() === id)?.name || id;
      case 'finalType':
        return finalTypes.find(f => f.id.toString() === id)?.name || id;
      default:
        return id;
    }
  }, [cities, neighborhoods, finalCities, finalTypes]);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    return selectedMainTypeId ||
      selectedSubTypeId ||
      Object.values(filters).some(value => value && value !== '') ||
      Object.values(dynamicFilters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => v && v !== '');
        }
        return value && value !== '';
      }) ||
      priceRange[0] > 0 ||
      priceRange[1] < 1000000;
  }, [selectedMainTypeId, selectedSubTypeId, filters, dynamicFilters, priceRange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedMainTypeId) count++;
    if (selectedSubTypeId) count++;
    if (priceRange[0] > 0 || priceRange[1] < 1000000) count++;

    Object.entries(filters).forEach(([key, value]) => {
      if (!key.startsWith('property_') && value && value !== '') count++;
    });

    Object.values(dynamicFilters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'object' && value !== null) {
        if (Object.values(value).some(v => v && v !== '')) count++;
      } else if (value && value !== '') count++;
    });

    return count;
  }, [selectedMainTypeId, selectedSubTypeId, filters, dynamicFilters, priceRange]);

  // Render static filters (location-based)
  const renderStaticFilters = () => (
    <div className="space-y-4">
      {/* City Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectField
          label="المحافظة"
          icon={MapPin}
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value, neighborhood: '', finalCity: '' })}
          options={[
            { value: '', label: 'الكل' },
            ...cities.map(c => ({ value: c.id, label: c.name }))
          ]}
        />

        <SelectField
          label="المدينة"
          icon={Building2Icon}
          value={filters.neighborhood}
          onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value, finalCity: '' })}
          options={[
            { value: '', label: 'الكل' },
            ...neighborhoods.map(n => ({ value: n.id, label: n.name }))
          ]}
          className={!filters.city ? 'opacity-50 cursor-not-allowed' : ''}
          enable={filters.city !== ""}
        />

        <SelectField
          label="المنطقة"
          icon={Building2Icon}
          value={filters.finalCity}
          onChange={(e) => setFilters({ ...filters, finalCity: e.target.value })}
          options={[
            { value: '', label: 'الكل' },
            ...finalCities.map(n => ({ value: n.id, label: n.name }))
          ]}
          className={!filters.neighborhood ? 'opacity-50 cursor-not-allowed' : ''}
          enable={filters.neighborhood !== ""}
        />
      </div>

      {/* Final Type Filter */}
      {finalTypes.length > 0 && (
        <div className="mt-4">
          <SelectField
            label="التصنيف النهائي"
            icon={Building}
            value={filters.finalType}
            onChange={(e) => {
              setDynamicFilters({});
              const newFilters = { ...filters, finalType: e.target.value };
              Object.keys(newFilters).forEach(key => {
                if (key.startsWith('property_')) {
                  delete newFilters[key];
                }
              });
              setFilters(newFilters);
            }}
            options={[
              { value: '', label: 'الكل' },
              ...finalTypes.map(f => ({ value: f.id, label: f.name }))
            ]}
          />
        </div>
      )}
    </div>
  );

  // Render dynamic property groups
  const renderDynamicPropertyGroups = () => {
    if (Object.keys(groupedProperties).length === 0) return null;

    return Object.entries(groupedProperties).map(([groupName, properties]) => (
      <div key={groupName} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h4 className="text-lg font-bold text-gray-800">{groupName}</h4>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            {properties.length} خاصية
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <DynamicPropertyField
              key={property.propertyKey}
              property={property}
              value={dynamicFilters[property.propertyKey]}
              onChange={(value) => handleDynamicPropertyChange(property.propertyKey, value)}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 my-8 overflow-hidden">
      {/* Enhanced Header */}
      <div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 cursor-pointer hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Filter className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">تصفية العقارات</h2>
              <p className="text-white/80 text-sm">ابحث بدقة عن العقار المناسب</p>
            </div>
            {isLoadingProperties && (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            )}
            {activeFilterCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {activeFilterCount} فلتر نشط
                </span>
              </div>
            )}
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white transition-transform duration-300" />
            )}
          </div>
        </div>
      </div>

      {/* Sort Component */}
      <div className="border-b border-gray-100">
        <SortComponent currentSort={sortOption} onSortChange={setSortOption} className="p-4" />
      </div>

      {/* Filter Content */}
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
        <div className="p-6">
          {/* Tab Navigation */}
          {dynamicProperties.length > 0 && (
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('location')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${activeTab === 'location'
                  ? 'bg-white text-indigo-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                الموقع والتصنيف
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${activeTab === 'properties'
                  ? 'bg-white text-indigo-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Sliders className="w-4 h-4" />
                الخصائص المتقدمة
                {dynamicProperties.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full">
                    {dynamicProperties.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'location' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-800">الموقع والتصنيف</h3>
              </div>
              {renderStaticFilters()}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Message when no final type is selected */}
              {!currentFinalTypeId && finalTypes.length > 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <Building className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    اختر التصنيف النهائي أولاً
                  </h3>
                  <p className="text-gray-500">
                    لعرض خصائص الفلترة المتقدمة، يرجى اختيار التصنيف النهائي من تبويب الموقع والتصنيف
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isLoadingProperties && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
                  <p className="text-gray-600 font-medium">جاري تحميل خصائص الفلترة...</p>
                </div>
              )}

              {/* No Properties Message */}
              {!isLoadingProperties && dynamicProperties.length === 0 && currentFinalTypeId && (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد خصائص فلترة متاحة
                  </h3>
                  <p className="text-gray-500">
                    لم يتم تعريف خصائص فلترة لهذا النوع من العقارات بعد
                  </p>
                </div>
              )}

              {/* Dynamic Properties */}
              {!isLoadingProperties && dynamicProperties.length > 0 && renderDynamicPropertyGroups()}
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
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