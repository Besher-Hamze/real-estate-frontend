// components/properties/PropertyCard.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoBed, IoExpand, IoCar } from 'react-icons/io5';
import { FaBath } from 'react-icons/fa'; 
import { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative aspect-video">
        <Image
          src={property.image || '/placeholder.jpg'} // Fallback for missing image
          alt={property.title || 'Property Image'} // Fallback for missing title
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Property Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            {property.type || 'Unknown Type'}
          </span>
        </div>
        {/* Property Status Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            {property.status || 'Unknown Status'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Property Title */}
        <Link href={`/properties/${property.id}`} passHref>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
            {property.title || 'Untitled Property'}
          </h3>
        </Link>
        
        {/* Location */}
        <p className="text-gray-500 text-sm mb-4">
          {property.location || 'Unknown Location'}
        </p>
        
        {/* Price and Rent */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-blue-600">
            ${property.price ? property.price.toLocaleString() : 'N/A'}
          </span>
          {property.rentPerMonth && (
            <span className="text-gray-500 text-sm">
              ${property.rentPerMonth.toLocaleString()}/mo
            </span>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <IoBed className="text-gray-400" />
            <span>{property.bedrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBath className="text-gray-400" />
            <span>{property.bathrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <IoExpand className="text-gray-400" />
            <span>{property.size ? `${property.size}m²` : 'N/A'}</span>
          </div>
          {property.parking && (
            <div className="flex items-center gap-1">
              <IoCar className="text-gray-400" />
              <span>{property.parking ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
