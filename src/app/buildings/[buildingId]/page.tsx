"use client"
import React, { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealEstateApi } from '@/api/realEstateApi';
import { Building, RealEstateData } from '@/lib/types';
import Link from 'next/link';
import {
    ArrowLeft,
    MapPin,
    Building2,
    Plus
} from 'lucide-react';
import { buildingApi } from '@/api/buidlingApi';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import RealEstateCard from '@/components/widgets/PropertyGrid/PropertyCard';

function BuildingContent({ buildingId }: { buildingId: string }) {
    const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);

    const { data: building, isLoading: isBuildingLoading } = useQuery<Building>({
        queryKey: ['building', buildingId],
        queryFn: () => buildingApi.fetchBuildingById(buildingId),
        enabled: !!buildingId
    });

    const { data: realEstates = [], isLoading: isRealEstateLoading } = useQuery<RealEstateData[]>({
        queryKey: ['realEstate', 'building', buildingId],
        queryFn: () => RealEstateApi.fetchRealEstateByBuildingId(buildingId),
        enabled: !!buildingId
    });

    const handlePropertyHover = (propertyId: number) => {
        setHoveredPropertyId(propertyId);
    };

    const handlePropertyLeave = () => {
        setHoveredPropertyId(null);
    };

    if (isBuildingLoading || isRealEstateLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <BuildingHeader building={building} />

                {building && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center p-4 border-r border-gray-100">
                                <span className="text-3xl font-bold text-blue-600">{realEstates.length}</span>
                                <span className="text-gray-600 mt-2">إجمالي العقارات</span>
                            </div>
                            <div className="flex flex-col items-center p-4 border-r border-gray-100">
                                <span className="text-3xl font-bold text-blue-600">
                                    {realEstates.length > 0
                                        ? Math.min(...realEstates.map(e => e.price)).toLocaleString()
                                        : 0}
                                </span>
                                <span className="text-gray-600 mt-2">أقل سعر (ر.ع)</span>
                            </div>
                            <div className="flex flex-col items-center p-4">
                                <span className="text-3xl font-bold text-blue-600">
                                    {realEstates.length > 0
                                        ? Math.max(...realEstates.map(e => e.price)).toLocaleString()
                                        : 0}
                                </span>
                                <span className="text-gray-600 mt-2">أعلى سعر (ر.ع)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Real Estate Properties Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">العقارات المتاحة</h2>
                    </div>

                    {realEstates.length === 0 ? (
                        <EmptyRealEstateState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realEstates.map((estate) => (
                                <RealEstateCard
                                    key={estate.id}
                                    item={estate}
                                    onHover={() => handlePropertyHover(estate.id)}
                                    onLeave={handlePropertyLeave}
                                    mainType={undefined} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BuildingHeader({ building }: { building?: Building }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/buildings"
                    className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{building?.title}</h1>
                    <div className="flex items-center text-gray-600 mt-2">
                        <MapPin className="w-5 h-5 ml-2" />
                        <span>{building?.location || "غير محدد"}</span>
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
            px-3 py-2 rounded-full text-xs font-medium inline-block mt-4 md:mt-0
            ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}
        `}>
            {status || "غير محدد"}
        </span>
    );
}

function EmptyRealEstateState() {
    return (
        <div className="text-center bg-white p-12 rounded-xl shadow-md">
            <Building2 className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
                لا توجد عقارات في هذا المبنى
            </h2>
            <p className="text-gray-600 mb-6">
                لم يتم إضافة أي عقارات حتى الآن
            </p>
            <Link
                href={`/admin/real-estates/add?buildingId=${useParams().buildingId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
                <Plus className="w-5 h-5" />
                إضافة عقار جديد
            </Link>
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

export default function BuildingPage() {
    const params = useParams();
    const buildingId = params.buildingId as string;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <BuildingContent buildingId={buildingId} />
        </Suspense>
    );
}