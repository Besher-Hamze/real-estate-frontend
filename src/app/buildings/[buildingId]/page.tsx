"use client"
import React, { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buildingItemApi } from '@/api/buildingItemApi';
import { RealEstateApi } from '@/api/realEstateApi';
import { BuildingItem, Building, RealEstateData } from '@/lib/types';
import Link from 'next/link';
import {
    ArrowLeft,
    Home,
    ShoppingBag,
    Building2,
    MapPin,
    Eye,
    X,
    BedDouble,
    Bath,
    Maximize2
} from 'lucide-react';
import { buildingApi } from '@/api/buidlingApi';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { useParams } from 'next/navigation';

function BuildingItemsContent({ buildingId }: { buildingId: string }) {
    const [selectedItem, setSelectedItem] = useState<BuildingItem | null>(null);

    const { data: building, isLoading: isBuildingLoading } = useQuery<Building>({
        queryKey: ['building', buildingId],
        queryFn: () => buildingApi.fetchBuildingById(buildingId),
        enabled: !!buildingId
    });

    const { data: items = [], isLoading } = useQuery<BuildingItem[]>({
        queryKey: ['buildingItems', buildingId],
        queryFn: () => buildingItemApi.fetchBuildingItems(buildingId),
        enabled: !!buildingId
    });

    const { data: realEstates = [], isLoading: isRealEstateLoading } = useQuery<RealEstateData[]>({
        queryKey: ['realEstates', selectedItem?.id],
        queryFn: () => selectedItem
            ? RealEstateApi.fetchRealEstateByBuildingItemId(selectedItem.id)
            : Promise.resolve([]),
        enabled: !!selectedItem
    });

    if (isLoading || isBuildingLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-white container mx-auto px-4 py-8">
            {/* Building Header */}
            <BuildingHeader building={building} />

            {/* Building Items */}
            <div className="mt-8">
                {items.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <BuildingItemCard
                                key={item.id}
                                item={item}
                                onViewRealEstate={() => setSelectedItem(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Real Estate Modal */}
            <RealEstateModal
                selectedItem={selectedItem}
                realEstates={realEstates}
                isLoading={isRealEstateLoading}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
}

function BuildingHeader({ building }: { building?: Building }) {
    return (
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/buildings"
                    className="text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{building?.title}</h1>
                    <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="w-5 h-5 ml-2" />
                        <span>{building?.location}</span>
                    </div>
                </div>
            </div>
            <BuildingStatusBadge status={building?.status} />
        </div>
    );
}

function BuildingStatusBadge({ status }: { status?: string }) {
    const statusClasses = {
        'مكتمل': 'bg-green-100 text-green-800',
        'قيد الإنشاء': 'bg-yellow-100 text-yellow-800',
        'مخطط': 'bg-gray-100 text-gray-800'
    };

    return (
        <span className={`
            px-3 py-2 rounded-full text-xs font-medium
            ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}
        `}>
            {status}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="text-center bg-gray-50 p-12 rounded-xl">
            <Building2 className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
                لا توجد وحدات في هذا المبنى
            </h2>
            <p className="text-gray-600 mb-6">
                لم يتم إضافة أي وحدات حتى الآن
            </p>
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">جارٍ التحميل...</p>
            </div>
        </div>
    );
}

function RealEstateModal({
    selectedItem,
    realEstates,
    isLoading,
    onClose
}: {
    selectedItem: BuildingItem | null,
    realEstates: RealEstateData[],
    isLoading: boolean,
    onClose: () => void
}) {
    if (!selectedItem) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            العقارات الخاصة بـ {selectedItem.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : realEstates.length === 0 ? (
                        <EmptyRealEstateState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realEstates.map((estate) => (
                                <PropertyCard
                                    key={estate.id}
                                    item={estate}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function EmptyRealEstateState() {
    return (
        <div className="text-center py-12">
            <p className="text-gray-600">لا توجد عقارات لهذه الوحدة</p>
        </div>
    );
}

export default function BuildingItemsPage() {
    const params = useParams();
    const buildingId = params.buildingId as string;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <BuildingItemsContent buildingId={buildingId} />
        </Suspense>
    );
}

interface PropertyCardProps {
    item: RealEstateData;
}
const PropertyCard = ({
    item,
}: PropertyCardProps) => (
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
                {item?.mainCategoryName}
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
                }          <div className="flex items-center gap-1">
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

const BuildingItemCard: React.FC<{
    item: BuildingItem,
    onViewRealEstate: () => void
}> = ({ item, onViewRealEstate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                    <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${item.type === 'apartment' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                    `}>
                        {item.type === 'apartment' ? 'شقة' : 'محل'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Home className="w-6 h-6 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">المساحة</p>
                            <p className="text-lg font-bold text-gray-800">{item.area} م²</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">السعر</p>
                            <p className="text-lg font-bold text-gray-800">{item.price} ر.ع</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onViewRealEstate}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Eye className="w-5 h-5" />
                    عرض العقارات
                </button>
            </div>
        </motion.div>
    );
};