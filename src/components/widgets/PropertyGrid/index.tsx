import { SearchX } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { RealEstateData, MainType, SubType } from "@/lib/types";
import { PropertyCardSkeleton } from "@/components/home/home";

interface PropertyGridProps {
  filteredData: RealEstateData[];
  isLoading: boolean;
  resetFilters: () => void;
  currentMainType: MainType | undefined;
  currentSubType: SubType | undefined;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  filteredData,
  isLoading,
  resetFilters,
  currentMainType,
  currentSubType
}) => {
  return (
    <>
      {/* Results Count */}
      <div className="mb-4 text-gray-600 text-sm">
        إجمالي النتائج: {filteredData.length} عقار
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
            <PropertyCard
              key={item.id}
              item={item}
              mainType={currentMainType}
              selectedSubType={currentSubType}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <SearchX className="w-12 h-12 text-gray-400" />
              <p className="text-gray-600 text-lg">
                لا توجد عقارات تطابق معايير البحث
              </p>
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyGrid;

