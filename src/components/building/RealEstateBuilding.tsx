import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Eye,
  BedDouble,
  Bath,
  Maximize2,
  Sunset,
  MapPin,
  Heart,
  BuildingIcon
} from 'lucide-react';
import { RealEstateData } from '@/lib/types';

interface RealEstateListItemProps {
  item: RealEstateData;
  onHover?: () => void;
  onLeave?: () => void;
}

const RealEstateListItem: React.FC<RealEstateListItemProps> = ({
  item,
  onHover,
  onLeave
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check and manage favorites
  useEffect(() => {
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      const favoritesArray = JSON.parse(favorites);
      setIsFavorite(favoritesArray.includes(item.id));
    }
  }, [item.id]);

  // Toggle favorite status
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = localStorage.getItem('favorites');
    let favoritesArray: number[] = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      favoritesArray = favoritesArray.filter(id => id !== item.id);
    } else {
      favoritesArray.push(item.id);
    }

    localStorage.setItem('favorites', JSON.stringify(favoritesArray));
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 relative"
      onMouseEnter={() => {
        setIsHovered(true);
        // onHover && onHover();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        // onLeave && onLeave();
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className='flex items-center gap-4'>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {item.title}
            </h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {item.mainCategoryName || 'عقار'}
            </span>
          </div>
        </div>

      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 justify-center">
        {/* Bedrooms */}
        {(item.subCategoryName !== "أرض" && item.finalTypeName !== "أرض") && (
          <div className="group relative flex items-center gap-4 p-3 
      bg-gradient-to-br from-blue-50 to-white 
      rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
      hover:translate-y-[-2px] border border-blue-100/50 justify-center text-gray-600"
          >
            <BedDouble className="w-4 h-4 ml-2 group-hover:text-blue-600 transition-colors" />
            <span className="group-hover:text-blue-600 transition-colors">
              {item.bedrooms} غرفة
            </span>
          </div>
        )}

        {/* Bathrooms */}
        {(item.subCategoryName !== "أرض" && item.finalTypeName !== "أرض") && (
          <div className="group relative flex items-center gap-4 p-3 
      bg-gradient-to-br from-blue-50 to-white 
      rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
      hover:translate-y-[-2px] border border-blue-100/50 justify-center text-gray-600"
          >
            <Bath className="w-4 h-4 ml-2 group-hover:text-blue-600 transition-colors" />
            <span className="group-hover:text-blue-600 transition-colors">
              {item.bathrooms} حمام
            </span>
          </div>
        )}

        {/* View */}
        <div className="group relative flex items-center gap-4 p-3 
    bg-gradient-to-br from-blue-50 to-white 
    rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
    hover:translate-y-[-2px] border border-blue-100/50 justify-center text-gray-600"
        >
          <Sunset className="w-4 h-4 ml-2 group-hover:text-blue-600 transition-colors" />
          <span className="group-hover:text-blue-600 transition-colors">
            {item.facade || 'غير محدد'}
          </span>
        </div>

        {/* Area */}
        <div className="group relative flex items-center gap-4 p-3 
    bg-gradient-to-br from-blue-50 to-white 
    rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
    hover:translate-y-[-2px] border border-blue-100/50 justify-center text-gray-600"
        >
          <Maximize2 className="w-4 h-4 ml-2 group-hover:text-blue-600 transition-colors" />
          <span className="group-hover:text-blue-600 transition-colors">
            {item.buildingArea} م²
          </span>
        </div>

        {/* Price */}
        <div className="group relative flex items-center gap-4 p-3 
    bg-gradient-to-br from-blue-50 to-white 
    rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
    hover:translate-y-[-2px] border border-blue-100/50 justify-center text-gray-600"
        >
          <span className="text-xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
            {item.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600 mr-1">ر.ع</span>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-center gap-2 group relative p-3
    bg-gradient-to-br from-blue-50 to-white 
    rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
    hover:translate-y-[-2px] border border-blue-100/50'
        >
          <Link
            href={`/properties/${item.id}`}
            className={`p-2 rounded-full transition-all duration-300 ${isHovered
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
              }`}
          >
            <Eye className="w-5 h-5" />
          </Link>

          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-all duration-300 ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const RealEstateListView: React.FC<{
  items: RealEstateData[],
  onPropertyHover?: (id: number) => void,
  onPropertyLeave?: () => void
}> = ({
  items,
  onPropertyHover,
  onPropertyLeave
}) => {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50">
        {items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item) => (
              <RealEstateListItem
                key={item.id}
                item={item}
                onHover={() => onPropertyHover && onPropertyHover(item.id)}
                onLeave={onPropertyLeave}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-12 text-center">
            <BuildingIcon className="w-24 h-24 text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              لا توجد عقارات متاحة
            </h2>
            <p className="text-gray-600 mb-6">
              يبدو أنه لا توجد عقارات في الوقت الحالي
            </p>
          </div>
        )}
      </div>
    );
  };

export default RealEstateListView;