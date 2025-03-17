"use client"
import React, { Suspense, useState, useEffect, useRef } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import RealEstateCard from '@/components/widgets/PropertyGrid/PropertyCard';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// إضافة واجهة البناء
interface BuildingType {
  id: string;
  title: string;
  status: 'مكتمل' | 'قيد الإنشاء' | 'مخطط';
  location: string;
  buildingAge: string;
  realEstateCount: number;
}

function BuildingContent({ buildingId }: { buildingId: string }) {
    const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
    const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
    const router = useRouter();

    // مرجع الخريطة
    const mapRef = useRef<any>(null);

    // إحداثيات العرض الأولي للخريطة
    const [viewport, setViewport] = useState({
        latitude: 23.5880, // الإحداثيات الافتراضية لعمان
        longitude: 58.3829,
        zoom: 10
    });

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

    // استعلام لجلب جميع المباني
    const { data: allBuildings = [], isLoading: isAllBuildingsLoading } = useQuery<BuildingType[]>({
        queryKey: ['buildings'],
        queryFn: () => buildingApi.fetchBuildings(),
    });

    // تحديث إحداثيات الخريطة عند تحميل بيانات المبنى
    useEffect(() => {
        if (building?.location) {
            try {
                // نفترض أن الموقع مخزن بصيغة "latitude,longitude"
                const [lat, lng] = building.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setViewport({
                        latitude: lat,
                        longitude: lng,
                        zoom: 12
                    });
                }
            } catch (error) {
                console.error("Error parsing building location:", error);
            }
        }
    }, [building]);

    const handlePropertyHover = (propertyId: number) => {
        setHoveredPropertyId(propertyId);
    };

    const handlePropertyLeave = () => {
        setHoveredPropertyId(null);
    };

    const handleBuildingHover = (building: BuildingType) => {
        setHoveredBuildingId(building.id);
    };

    const handleBuildingLeave = () => {
        setHoveredBuildingId(null);
    };

    const handleBuildingClick = (building: BuildingType) => {
        router.push(`/buildings/${building.id}`);
    };

    // استخراج المباني ذات الإحداثيات الصالحة
    const validBuildingMarkers = allBuildings.filter(b => {
        if (!b.location) return false;
        try {
            const [lat, lng] = b.location.split(',').map(Number);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        } catch {
            return false;
        }
    });

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

                {/* Buildings Map Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">المباني على الخريطة</h2>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="h-[500px] relative">
                            {!mapLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                                        <span className="text-gray-600">جاري تحميل الخريطة...</span>
                                    </div>
                                </div>
                            )}

                            <Map
                                ref={mapRef}
                                mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
                                initialViewState={viewport}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                mapStyle="mapbox://styles/mapbox/streets-v11"
                                onMove={evt => setViewport(evt.viewState)}
                                onLoad={() => {
                                    setMapLoaded(true);
                                    if (mapRef.current?.getMap) {
                                        setTimeout(() => {
                                            mapRef.current.getMap().resize();
                                        }, 100);
                                    }
                                }}
                            >
                                <NavigationControl position="bottom-right" />

                                {validBuildingMarkers.map((building) => {
                                    try {
                                        const [lat, lng] = building.location.split(',').map(Number);
                                        const isHighlighted = hoveredBuildingId === building.id;
                                        const isCurrentBuilding = building.id === buildingId;

                                        // تخطي الإحداثيات غير الصالحة
                                        if (isNaN(lat) || isNaN(lng)) {
                                            return null;
                                        }

                                        return (
                                            <Marker
                                                key={building.id}
                                                latitude={lat}
                                                longitude={lng}
                                                anchor="bottom"
                                                onClick={(e) => {
                                                    e.originalEvent.stopPropagation();
                                                    if (!isCurrentBuilding) {
                                                        handleBuildingClick(building);
                                                    }
                                                }}
                                            >
                                                <div
                                                    className="relative cursor-pointer"
                                                    onMouseEnter={() => handleBuildingHover(building)}
                                                    onMouseLeave={handleBuildingLeave}
                                                >
                                                    <AnimatePresence>
                                                        {(isHighlighted || isCurrentBuilding) && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10"
                                                            >
                                                                <div className="font-bold text-blue-600">{building.title}</div>
                                                                <div className="text-sm text-gray-600">{building.status}</div>
                                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform"></div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <motion.div
                                                        animate={{
                                                            scale: isHighlighted || isCurrentBuilding ? 1.3 : 1,
                                                        }}
                                                        whileHover={{ scale: 1.2 }}
                                                        className={`${isHighlighted || isCurrentBuilding ? 'z-20' : 'z-10'} transition-all duration-200`}
                                                    >
                                                        <div className={`
                                                            ${isCurrentBuilding ? 'bg-blue-600' : getBuildingColorByStatus(building.status)} 
                                                            rounded-full p-2 text-white flex items-center justify-center shadow-md
                                                            ${isCurrentBuilding ? 'ring-4 ring-blue-300' : ''}
                                                        `}>
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </Marker>
                                        );
                                    } catch (error) {
                                        console.error("Error rendering building marker:", error);
                                        return null;
                                    }
                                })}
                            </Map>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// دالة مساعدة لتحديد لون المبنى حسب الحالة
function getBuildingColorByStatus(status?: string): string {
    switch (status) {
        case 'مكتمل':
            return 'bg-green-600';
        case 'قيد الإنشاء':
            return 'bg-yellow-600';
        case 'مخطط':
            return 'bg-gray-600';
        default:
            return 'bg-gray-600';
    }
}

function BuildingHeader({ building }: { building?: Building }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{building?.title}</h1>
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
    const params = useParams();
    const buildingId = params.buildingId as string;
    
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
                href={`/admin/real-estates/add?buildingId=${buildingId}`}
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