import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow, ChevronDown } from 'lucide-react';
import { RealEstateData } from '@/lib/types';

// تعريف أنواع الترتيب
export type SortField = 'price' | 'createdAt' | 'buildingArea' | 'bedrooms';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

interface SortProps {
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
  className?: string;
}

// تعريف خيارات الترتيب المتاحة
export const sortOptions: SortOption[] = [
  { field: 'price', direction: 'asc', label: 'السعر: من الأقل إلى الأعلى' },
  { field: 'price', direction: 'desc', label: 'السعر: من الأعلى إلى الأقل' },
  { field: 'buildingArea', direction: 'desc', label: 'المساحة: من الأكبر إلى الأصغر' },
  { field: 'buildingArea', direction: 'asc', label: 'المساحة: من الأصغر إلى الأكبر' },
  { field: 'createdAt', direction: 'desc', label: 'أحدث الإعلانات' },
  { field: 'createdAt', direction: 'asc', label: 'أقدم الإعلانات' },
  { field: 'bedrooms', direction: 'desc', label: 'عدد الغرف: من الأكثر إلى الأقل' },
  { field: 'bedrooms', direction: 'asc', label: 'عدد الغرف: من الأقل إلى الأكثر' },
];

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

const SortComponent: React.FC<SortProps> = ({ onSortChange, currentSort, className = '' }) => {
  // الحصول على الأيقونة المناسبة بناءً على نوع الترتيب
  const getSortIcon = (field: SortField, direction: SortDirection) => {
    if (field === 'price' || field === 'buildingArea' || field === 'bedrooms' || field === "createdAt") {
      return direction === 'asc' ? <ArrowUpWideNarrow className="w-3 h-3" /> : <ArrowDownWideNarrow className="w-3 h-3" />;
    } else {
      return direction === 'asc' ? <ArrowUpAZ className="w-3 h-3" /> : <ArrowDownAZ className="w-3 h-3" />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 hover:border-blue-300 px-2 py-1.5 rounded-md shadow-sm transition-all duration-200 hover:bg-blue-100">
        <span className="text-gray-700 text-xs font-medium">ترتيب:</span>
        <div className="relative">
          <select
            className="appearance-none bg-transparent pr-5 pl-6 py-0.5 text-xs font-medium focus:outline-none text-blue-700"
            value={`${currentSort.field}-${currentSort.direction}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
              const newOption = sortOptions.find(
                option => option.field === field && option.direction === direction
              );
              if (newOption) {
                onSortChange(newOption);
              }
            }}
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.field}-${option.direction}`}
                value={`${option.field}-${option.direction}`}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-500" />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600">
            {getSortIcon(currentSort.field, currentSort.direction)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SortComponent;