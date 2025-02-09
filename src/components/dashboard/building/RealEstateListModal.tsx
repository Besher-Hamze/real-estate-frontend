import React from 'react';
import { X, MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { RealEstateApi } from '@/api/realEstateApi';
import { RealEstateData } from '@/lib/types';
import { toast } from 'react-toastify';

interface RealEstateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingItemId?: string;
}

export function RealEstateListModal({
    isOpen,
    onClose,
    buildingItemId
}: RealEstateListModalProps) {
    const { data: realEstates = [], isLoading, error } = useQuery({
        queryKey: ['realEstates', buildingItemId],
        queryFn: () => buildingItemId
            ? RealEstateApi.fetchRealEstateByBuildingItemId(buildingItemId)
            : Promise.resolve([]),
        enabled: isOpen && !!buildingItemId
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                        <h2 className="text-xl font-semibold">العقارات المرتبطة</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <p className="text-center">جارٍ التحميل...</p>
                        ) : error ? (
                            <p className="text-center text-red-500">حدث خطأ في جلب العقارات</p>
                        ) : realEstates && realEstates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(Array.isArray(realEstates) ? realEstates : [realEstates]).map((item: RealEstateData) => (
                                    <PropertyCard
                                        key={item.id}
                                        item={item}
                                        mainType={{
                                            name: item.mainCategoryName || 'عقار'
                                        }}
                                        selectedSubType={undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">لا توجد عقارات مرتبطة</p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// PropertyCard component (copied from your previous implementation)
const PropertyCard = ({
    item,
    mainType,
    selectedSubType,
}: {
    item: RealEstateData;
    mainType: { name: string };
    selectedSubType?: any;
}) => (
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
                {
                    (item.subCategoryName != "أرض" && item.finalTypeName != "أرض") && <>
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
                }
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