import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCity } from '@/lib/hooks/useCity';
import { useRealEstate } from '@/lib/hooks/useRealEstate';
import { CityType } from '@/lib/types';





interface CityStatsType {
  [key: number]: {
    saleCount: number;
    rentCount: number;
  };
}

interface CityGridProps {
  onCitySelect: (cityId: number) => void;
}

const CityList: React.FC<CityGridProps> = ({ onCitySelect }) => {
  const { cities, isLoading: isLoadingCities } = useCity();
  const { realEstateData, isLoading: isLoadingProperties } = useRealEstate();
  const [cityStats, setCityStats] = useState<CityStatsType>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (realEstateData && cities) {
      const stats: CityStatsType = {};

      // Initialize stats for all cities
      cities.forEach(city => {
        stats[city.id] = { saleCount: 0, rentCount: 0 };
      });

      // Count properties for each city
      realEstateData.forEach(property => {
        if (property.cityId && stats[property.cityId]) {
          // Check if it's for sale or rent based on the main category
          if (property.mainCategoryName && property.mainCategoryName.includes('بيع')) {
            stats[property.cityId].saleCount++;
          } else if (property.mainCategoryName && property.mainCategoryName.includes('إيجار')) {
            stats[property.cityId].rentCount++;
          }
        }
      });
      setCityStats(stats);
    }
  }, [realEstateData, cities]);

  // Handle scroll buttons
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (isLoadingCities) {
    return (
      <div className="relative flex space-x-4 rtl:space-x-reverse">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-64 bg-gray-200 animate-pulse rounded-xl h-72"></div>
        ))}
      </div>
    );
  }

  if (!cities || cities.length === 0) {
    return <div className="text-center py-8">لا توجد مدن متاحة</div>;
  }

  return (
    <div className="relative">
      {/* Scroll Left Button */}
      <button 
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 text-gray-700 hover:text-blue-600"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* City List */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-4 rtl:space-x-reverse overflow-x-auto pb-6 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cities.map((city: CityType) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-64 relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => onCitySelect(city.id)}
          >
            {/* City Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={"./images/hero_bg_3.jpg"}
                alt={city.name}
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            </div>

            {/* City Info */}
            <div className="p-4 bg-white">
              <h3 className="text-xl font-bold text-center mb-4">{city.name}</h3>

              <div className="flex justify-between text-sm">
                <div className="flex flex-col items-center gap-1 w-1/2 border-l border-gray-200">
                  <span className="text-gray-600">للبيع</span>
                  <span className="font-bold text-gray-800">
                    {cityStats[city.id]?.saleCount || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 w-1/2">
                  <span className="text-gray-600">للإيجار</span>
                  <span className="font-bold text-gray-800">
                    {cityStats[city.id]?.rentCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Hover state actions */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button 
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 text-gray-700 hover:text-blue-600"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Custom styles for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CityList;