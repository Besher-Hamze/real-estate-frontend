"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize2, ArrowRight, Home, Info, Star, LocateIcon, Clock, CheckCircle, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { RealEstateApi } from '@/api/realEstateApi';
import Image from 'next/image';
import { RealEstateData } from '@/lib/types';
import PropertyGallery from '@/components/properties/PropertyGallery';
import RealEstateCard from '@/components/widgets/PropertyGrid/PropertyCard';
import MapboxViewer from '@/components/map/MapboxViewer';
import { BUILDING_AGE_OPTION, FLOOR_OPTIONS, FURNISHED_OPTIONS, RENTAL_DURATION_OPTIONS } from '@/components/ui/constants/formOptions';
import PropertyActionButtons from '@/components/properties/PropertyActionButtons';
import { PropertyReservationModal } from '@/components/properties/PropertyReservation';
import { PropertyFeedbackModal } from '@/components/properties/PropertyFeedbackForm';
import { Badge } from '@/components/ui/badge';

export default function PropertyDetails() {
    const [property, setProperty] = useState<RealEstateData | null>(null);
    const [similarProperties, setSimilarProperties] = useState<RealEstateData[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // حالة النوافذ المنبثقة
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

    // فتح وإغلاق النوافذ المنبثقة
    const openReservationModal = () => setIsReservationModalOpen(true);
    const closeReservationModal = () => setIsReservationModalOpen(false);
    const openFeedbackModal = () => setIsFeedbackModalOpen(true);
    const closeFeedbackModal = () => setIsFeedbackModalOpen(false);

    // Helper function to get property value from new structure
    const getPropertyValue = (key: string) => {
        return property?.properties?.[key]?.value;
    };

    // Helper function to render dynamic property value - FIXED
    const renderPropertyValue = (key: string, propertyInfo?: any) => {
        const value = getPropertyValue(key);
        if (!value) return null;

        const dataType = propertyInfo?.property?.dataType;

        switch (dataType) {
            case 'MULTIPLE_CHOICE':
                if (typeof value === 'string' && value.includes(',')) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {value.split(',').map((item: string, index: number) => (
                                <span key={`${key}-choice-${index}`} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                                    {item.trim()}
                                </span>
                            ))}
                        </div>
                    );
                }
                return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">{value}</span>;
            case 'NUMBER':
                const unit = propertyInfo?.property?.unit;
                return `${value}${unit ? ` ${unit}` : ''}`;
            case 'BOOLEAN':
                return value ? (
                    <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        نعم
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-red-600">
                        <X className="w-4 h-4" />
                        لا
                    </span>
                );
            default:
                return value;
        }
    };

    // Helper function to get features from new structure
    const getFeatures = (key: string) => {
        const value = getPropertyValue(key);
        if (!value) return [];

        if (typeof value === 'string') {
            return value.split(',').map(item => item.trim());
        }
        return Array.isArray(value) ? value : [value];
    };

    function getRentalText(rentalDuration: string) {
        return RENTAL_DURATION_OPTIONS.find(r => r.value == rentalDuration)?.label;
    }

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

    // Get dynamic property values
    const roomsCount = getPropertyValue('rooms_count');
    const bathroomsCount = getPropertyValue('bathrooms_count');
    const totalArea = getPropertyValue('total_area');
    const basicAmenities = getFeatures('basic_amenities');
    const additionalAmenities = getFeatures('additional_amenities');
    const viewType = getFeatures('view_type');
    const nearbyPlaces = getFeatures('nearby_places');
    const contractDuration = getPropertyValue('contract_duration');
    const buildingAge = getPropertyValue('building_age');
    const furnishingStatus = getPropertyValue('furnishing_status');
    const floorType = getPropertyValue('floor_type');
    const floorNumber = getPropertyValue('floor_number');

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
                                <span>{property.cityName} - {property.neighborhoodName} - {property.finalCityName} - {property.mainCategoryName} - {property.subCategoryName} - {property.finalTypeName}</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-500">السعر</div>
                            <div className="text-3xl font-bold text-blue-600">
                                {property.price} ر.ع
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl mb-6">
                        {(property.subCategoryName != "أرض" && property.finalTypeName != "أرض") && roomsCount && (
                            <div className="flex items-center gap-3">
                                <BedDouble className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-500">غرف النوم</div>
                                    <div className="font-semibold">{roomsCount}</div>
                                </div>
                            </div>
                        )}
                        {(property.subCategoryName != "أرض" && property.finalTypeName != "أرض") && bathroomsCount && (
                            <div className="flex items-center gap-3">
                                <Bath className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-500">الحمامات</div>
                                    <div className="font-semibold">{bathroomsCount}</div>
                                </div>
                            </div>
                        )}
                        {totalArea && (
                            <div className="flex items-center gap-3">
                                <Maximize2 className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="text-sm text-gray-500">المساحة</div>
                                    <div className="font-semibold">{renderPropertyValue('total_area', property.properties?.total_area)}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">الوصف</h2>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {property.description || "لا يوجد وصف متاح لهذا العقار"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Basic Amenities - FIXED KEYS */}
                {basicAmenities.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Home className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black">
                                المزايا الأساسية
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                            {basicAmenities.map((feature: string, index: number) => (
                                <div
                                    key={`basic-amenity-${index}-${feature.slice(0, 10)}`}
                                    className="group relative flex items-center gap-4 p-5 
                                   bg-gradient-to-br from-blue-50 to-white 
                                   rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                                   hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                                           transition-colors duration-300">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Amenities - FIXED KEYS */}
                {additionalAmenities.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Home className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black">
                                المزايا الإضافية
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                            {additionalAmenities.map((feature: string, index: number) => (
                                <div
                                    key={`additional-amenity-${index}-${feature.slice(0, 10)}`}
                                    className="group relative flex items-center gap-4 p-5 
                                   bg-gradient-to-br from-blue-50 to-white 
                                   rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                                   hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                                           transition-colors duration-300">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Type - FIXED KEYS */}
                {viewType.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Home className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black">
                                الإطلالات المتوفرة
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                            {viewType.map((feature: string, index: number) => (
                                <div
                                    key={`view-type-${index}-${feature.slice(0, 10)}`}
                                    className="group relative flex items-center gap-4 p-5 
                                   bg-gradient-to-br from-blue-50 to-white 
                                   rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                                   hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                                           transition-colors duration-300">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Time */}
                {property.viewTime && property.viewTime.trim() !== '' && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl my-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Clock className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black">
                                أوقات المشاهدة
                            </span>
                        </h2>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-100 p-2 rounded-full shrink-0 mt-1">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="text-gray-700">
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {property.viewTime}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nearby Places - FIXED KEYS */}
                {nearbyPlaces.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <span className="text-xl text-black">
                                الأماكن القريبة
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                            {nearbyPlaces.map((feature: string, index: number) => (
                                <div
                                    key={`nearby-place-${index}-${feature.slice(0, 10)}`}
                                    className="group relative flex items-center gap-4 p-5 
                                   bg-gradient-to-br from-blue-50 to-white 
                                   rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
                                   hover:translate-y-[-2px] border border-blue-100/50"
                                >
                                    <span className="text-base font-medium text-gray-700 group-hover:text-blue-600 
                                           transition-colors duration-300">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Property Details */}
                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-6">تفاصيل إضافية</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {floorNumber && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">رقم الطابق</span>
                                <span className="font-semibold">{floorNumber}</span>
                            </div>
                        )}
                        {floorType && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">نوع الطابق</span>
                                <span className="font-semibold">{floorType}</span>
                            </div>
                        )}
                        {buildingAge && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">عمر البناء</span>
                                <span className="font-semibold">{buildingAge}</span>
                            </div>
                        )}
                        {furnishingStatus && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">حالة الفرش</span>
                                <span className="font-semibold">{furnishingStatus}</span>
                            </div>
                        )}
                        {property.mainCategoryName === "إيجار" && contractDuration && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">مدة العقد</span>
                                <span className="font-semibold">{contractDuration}</span>
                            </div>
                        )}
                        {property.paymentMethod && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600">طرق الدفع</span>
                                <div className="flex gap-2">
                                    {property.paymentMethod.split(',').map((p, index) => (
                                        <span key={`payment-method-${index}-${p.trim()}`} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                                            {p.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                {property.location && (
                    <div id="property-location-section" className='p-8 mt-8 mb-8'>
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

                {/* أزرار الإجراءات العائمة */}
                <PropertyActionButtons
                    onReservationClick={openReservationModal}
                    onFeedbackClick={openFeedbackModal}
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertyLocation={property.location}
                />

                {/* Similar Properties Section - FIXED KEYS */}
                {similarProperties.length > 0 && (
                    <div className="p-8 mt-8">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                            <Home className="w-8 h-8 text-blue-500" />
                            <span className="text-xl text-black">
                                عقارات مشابهة
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {similarProperties.map((similarProperty) => (
                                <RealEstateCard
                                    key={`similar-property-${similarProperty.id}`}
                                    item={similarProperty}
                                    mainType={{ id: property.mainCategoryId, name: property.mainCategoryName }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* النوافذ المنبثقة */}
                {property && (
                    <>
                        <PropertyReservationModal
                            propertyId={property.id}
                            isOpen={isReservationModalOpen}
                            onClose={closeReservationModal}
                        />

                        <PropertyFeedbackModal
                            propertyId={property.id}
                            isOpen={isFeedbackModalOpen}
                            onClose={closeFeedbackModal}
                        />
                    </>
                )}
            </div>
        </div>
    );
}