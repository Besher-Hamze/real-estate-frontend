import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";
import { PropertyCardProps } from "@/lib/types";

const PropertyCard: React.FC<PropertyCardProps> = ({ item, mainType }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
  >
    <div className="relative h-64">
      <Image
        src={
          item.coverImage
            ? `${process.env.NEXT_PUBLIC_API_URL}/${item.coverImage}`
            : "/images/bg-real.jpg"
        }
        alt={item.title}
        fill
        loading="lazy"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
        {mainType?.name}
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <MapPin className="w-4 h-4" />
        <span>
          {item.cityName} - {item.neighborhoodName}
        </span>
      </div>
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
        {(item.subCategoryName !== "أرض" && item.finalTypeName !== "أرض") && (
          <>
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-black font-medium">
                {item.bedrooms}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-black font-medium">
                {item.bathrooms}
              </span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1">
          <Maximize2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-black font-medium">
            {item.buildingArea} م²
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">السعر</span>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-blue-600">
              {item.price.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-gray-600">ر.ع</span>
          </div>
        </div>
        <Link
          href={`/properties/${item.id}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          التفاصيل
        </Link>
      </div>
    </div>
  </motion.div>
);

export default PropertyCard;
