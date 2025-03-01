import { X } from "lucide-react";

// Category Skeleton
export const CategorySkeleton: React.FC = () => (
  <div className="px-8 py-4 rounded-xl bg-gray-200 animate-pulse">
    <div className="w-24 h-6 bg-gray-300 rounded"></div>
  </div>
);

// Filter Chip
interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove }) => (
  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
    {label}
    <button onClick={onRemove} className="hover:text-blue-900">
      <X className="w-4 h-4" />
    </button>
  </span>
);

// Property Card Skeleton
export const PropertyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
    <div className="h-64 bg-gray-200 animate-pulse"></div>
    <div className="p-6 space-y-4">
      <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded"></div>
      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    </div>
  </div>
);
