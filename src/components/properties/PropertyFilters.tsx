// components/properties/PropertyFilters.tsx
import React, { useState } from 'react';
import Button from '../ui/Button';

interface PropertyFiltersProps {
  onFilterChange: (filters: any) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    location: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      type: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      location: '',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Property Type */}
        <FilterItem
          label="Property Type"
          name="type"
          value={filters.type}
          onChange={handleChange}
          type="select"
          options={[
            { value: '', label: 'Any Type' },
            { value: 'house', label: 'House' },
            { value: 'apartment', label: 'Apartment' },
            { value: 'villa', label: 'Villa' },
            { value: 'land', label: 'Land' },
          ]}
        />

        {/* Status */}
        <FilterItem
          label="Status"
          name="status"
          value={filters.status}
          onChange={handleChange}
          type="select"
          options={[
            { value: '', label: 'Any Status' },
            { value: 'for-sale', label: 'For Sale' },
            { value: 'for-rent', label: 'For Rent' },
          ]}
        />

        {/* Min Price */}
        <FilterItem
          label="Min Price"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          type="number"
          placeholder="Min Price"
        />

        {/* Max Price */}
        <FilterItem
          label="Max Price"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          type="number"
          placeholder="Max Price"
        />

        {/* Bedrooms */}
        <FilterItem
          label="Bedrooms"
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
          type="select"
          options={[
            { value: '', label: 'Any' },
            { value: '1', label: '1+' },
            { value: '2', label: '2+' },
            { value: '3', label: '3+' },
            { value: '4', label: '4+' },
            { value: '5', label: '5+' },
          ]}
        />

        {/* Location */}
        <FilterItem
          label="Location"
          name="location"
          value={filters.location}
          onChange={handleChange}
          type="text"
          placeholder="Enter location"
        />
      </div>

      {/* Filter Actions */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
        <Button>Apply Filters</Button>
      </div>
    </div>
  );
};

interface FilterItemProps {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement | HTMLInputElement>;
  type: 'select' | 'text' | 'number';
  placeholder?: string;
  options?: { value: string; label: string }[];
}

const FilterItem: React.FC<FilterItemProps> = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  options,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {type === 'select' && options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
    </div>
  );
};

export default PropertyFilters;
