// app/properties/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize2, ArrowRight, Home, Info, Star, LocateIcon, Clock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { RealEstateApi } from '@/api/realEstateApi';
import Image from 'next/image';
import { RealEstateData } from '@/lib/types';
import PropertyGallery from '@/components/properties/PropertyGallery';
import PropertyCard from '@/components/widgets/PropertyGrid/PropertyCard';
import MapboxViewer from '@/components/map/MapboxViewer';

export default function PropertyDetails() {
    const [property, setProperty] = useState<RealEstateData | null>(null);
    const [similarProperties, setSimilarProperties] = useState<RealEstateData[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                setIsLoading(true);
                const propertyId = params?.id;
                if (!propertyId) {
                    throw new Error('Property ID not found');
                }

                const data = await RealEstateApi.fetchRealEstateById(Number(propertyId));
                console.log(data);

                const propertyWithFiles = {
                    ...data,
                    files: data.files || [`${process.env.NEXT_PUBLIC_API_URL}/${data.coverImage}`]
                };
                setProperty(propertyWithFiles);

                try {
                    const similarData = await RealEstateApi.fetchSimilarRealEstate(Number(propertyId));

                    // Check if similarData is an array, if not, wrap it in an array
                    const similarPropertiesArray = Array.isArray(similarData)
                        ? similarData
                        : (similarData ? [similarData] : []);

                    // Filter out the current property from similar properties
                    const filteredSimilarProperties = similarPropertiesArray.filter(
                        similarProp => similarProp.id !== Number(propertyId)
                    );

                    setSimilarProperties(filteredSimilarProperties);
                } catch (similarError) {
                    console.error('Failed to fetch similar properties:', similarError);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch property details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [params?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">عذراً</h2>
                    <p className="text-gray-600 mb-8">{error || 'لم يتم العثور على العقار'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Property Header Image */}
            <PropertyGallery
                property={{
                    title: property.title,
                    files: property.files,
                }}
            />

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Property Details */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span>{property.cityName} - {property.neighborhoodName} - {property.mainCategoryName} -  {property.subCategoryName} -{property.finalTypeName}</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-500">السعر</div>
                            <div className="text-3xl font-bold text-blue-600">
                                {property.price.toLocaleString()} ر.ع
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                        {(property.subCategoryName != "أرض" && property.finalTypeName != "أرض") && <>
                            <div className="flex items-center gap-3">
                                <BedDouble className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-500">غرف النوم</div>
                                    <div className="font-semibold">{property.bedrooms}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Bath className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-500">الحمامات</div>
                                    <div className="font-semibold">{property.bathrooms}</div>
                                </div>
                            </div></>}
                        <div className="flex items-center gap-3">
                            <Maximize2 className="w-6 h-6 text-blue-600" />
                            <div>
                                <div className="text-sm text-gray-500">المساحة</div>
                                <div className="font-semibold">{property.buildingArea} م²</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                        <Home className="w-8 h-8 text-blue-500" />
                        <span className="text-xl text-black0">
                            المميزات الرئيسية
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {property.mainFeatures?.split("،") && property.mainFeatures.split("،").length > 0 ? (
                            property.mainFeatures.split("،").map((feature: string, index: number) => (
                                <div
                                    key={index}
                                    className="group relative flex items-center gap-4 p-5 
                       bg-gradient-to-br from-blue-50 to-white 
                       rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                       hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                           transition-colors duration-300"
                                    >
                                        {feature}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex items-center justify-center p-8 
                      bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-lg">لا توجد مميزات متوفرة.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Features */}
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                        <Home className="w-8 h-8 text-blue-500" />
                        <span className="text-xl text-black0">
                            المميزات الإضافية
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {property.additionalFeatures?.split("،") && property.additionalFeatures.split("،").length > 0 ? (
                            property.additionalFeatures.split("،").map((feature: string, index: number) => (
                                <div
                                    key={index}
                                    className="group relative flex items-center gap-4 p-5 
                       bg-gradient-to-br from-blue-50 to-white 
                       rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                       hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                           transition-colors duration-300"
                                    >
                                        {feature}
                                    </span>
                                </div>
                            ))

                        ) : (
                            <div className="col-span-full flex items-center justify-center p-8 
                      bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-lg">لا توجد مميزات إضافية متوفرة.</p>
                            </div>
                        )}
                    </div>
                </div>

                {property.viewTime && property.viewTime.trim() !== '' && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl my-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Clock className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black0">
                                أوقات المشاهدة
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {property.viewTime.split(',').map((timeRange, index) => {
                                const [startTime, endTime] = timeRange.split(' to ');
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 
                            bg-blue-50 rounded-xl border border-blue-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-gray-700">
                                                من {startTime} إلى {endTime}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Nearby Loaction  */}
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <span className="text-xl text-black0">
                            الأماكن القريبة
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {property.nearbyLocations?.split("،") && property.nearbyLocations.split("،").length > 0 ? (
                            property.nearbyLocations.split("،").map((feature: string, index: number) => (
                                <div
                                    key={index}
                                    className="group relative flex items-center gap-4 p-5 
                       bg-gradient-to-br from-blue-50 to-white 
                       rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                       hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                           transition-colors duration-300"
                                    >
                                        {feature}
                                    </span>
                                </div>
                            ))

                        ) : (
                            <div className="col-span-full flex items-center justify-center p-8 
                      bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-lg">لا توجد أماكن قريبة متوفرة.</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* Property Details */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-6">تفاصيل إضافية</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">الواجهة</span>
                            <span className="font-semibold">{property.facade}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">رقم الطابق</span>
                            <span className="font-semibold">{property.floorNumber}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">مفروش</span>
                            <span className="font-semibold">{property.furnished ? 'نعم' : 'لا'}</span>
                        </div>
                        {property.mainCategoryName == "إيجار" && <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">مدة العقد</span>
                            <span className="font-semibold">{property.rentalDuration}  شهر</span>
                        </div>
                        }
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <span className="text-gray-600">طرق الدفع </span>
                            <div className="flex gap-2">
                                {property.paymentMethod.split(',').map((p, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                                        {p.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Nearby Locations */}
                {/* {property.nearbyLocations && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg mt-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            المواقع القريبة
                        </h2>
                        <div className="prose max-w-none text-gray-600">
                            {property.nearbyLocations}
                        </div>
                    </div>
                )} */}
                {property.location && (
                    <div id="property-location-section"
                        className="bg-white rounded-3xl p-8 mt-8 shadow-xl mb-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <MapPin className="w-8 h-8 text-blue-500" />
                            <span className="text-xl">الموقع</span>
                        </h2>

                        <MapboxViewer
                            latitude={property.location ? parseFloat(property.location.split(',')[0]) : undefined}
                            longitude={property.location ? parseFloat(property.location.split(',')[1]) : undefined}
                            cityName={property.cityName}
                            neighborhoodName={property.neighborhoodName}

                        />
                    </div>
                )}

                {/* Similar Properties Section */}
                {similarProperties.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl mt-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Home className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black0">
                                عقارات مشابهة
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similarProperties.map((similarProperty) => (
                                <PropertyCard
                                    key={similarProperty.id}
                                    item={similarProperty} mainType={undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}