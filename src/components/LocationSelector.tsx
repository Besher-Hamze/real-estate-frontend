import React, { useEffect, useCallback } from 'react';
import { useLocationData } from '@/hooks/useLocationData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MapPin, Building, Home, Navigation } from 'lucide-react';

interface LocationData {
    cityId: number | null;
    neighborhoodId: number | null;
    finalCityId: number | null;
    locationPath: string;
}

interface LocationSelectorProps {
    onLocationChange?: (locationData: LocationData) => void;
    initialCityId?: number;
    initialNeighborhoodId?: number;
    initialFinalCityId?: number;
    required?: boolean;
    className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    onLocationChange,
    initialCityId,
    initialNeighborhoodId,
    initialFinalCityId,
    required = false,
    className = '',
}) => {
    const {
        cities,
        neighborhoods,
        finalCities,
        selectedCityId,
        selectedNeighborhoodId,
        loading,
        error,
        setSelectedCityId,
        setSelectedNeighborhoodId,
        getLocationPath,
        resetSelections,
    } = useLocationData();

    const [selectedFinalCityId, setSelectedFinalCityId] = React.useState<number | null>(
        initialFinalCityId ?? null
    );

    // Initialize selections
    useEffect(() => {
        if (initialCityId && initialCityId !== selectedCityId) {
            setSelectedCityId(initialCityId);
        }
        if (initialNeighborhoodId && initialNeighborhoodId !== selectedNeighborhoodId) {
            setSelectedNeighborhoodId(initialNeighborhoodId);
        }
    }, [initialCityId, initialNeighborhoodId, setSelectedCityId, setSelectedNeighborhoodId]);

    // Notify parent of changes
    const notifyLocationChange = useCallback(() => {
        if (onLocationChange) {
            onLocationChange({
                cityId: selectedCityId,
                neighborhoodId: selectedNeighborhoodId,
                finalCityId: selectedFinalCityId,
                locationPath: getLocationPath(),
            });
        }
    }, [selectedCityId, selectedNeighborhoodId, selectedFinalCityId, onLocationChange, getLocationPath]);

    useEffect(() => {
        notifyLocationChange();
    }, [notifyLocationChange]);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : null;
        setSelectedCityId(id);
        setSelectedNeighborhoodId(null);
        setSelectedFinalCityId(null);
    };

    const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : null;
        setSelectedNeighborhoodId(id);
        setSelectedFinalCityId(null);
    };

    const handleFinalCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value ? Number(e.target.value) : null;
        setSelectedFinalCityId(id);
    };

    const handleReset = () => {
        resetSelections();
        setSelectedFinalCityId(null);
    };

    if (loading && cities.length === 0) {
        return <LoadingSpinner message="جاري تحميل بيانات المواقع..." />;
    }

    return (
        <Card className={`shadow-sm ${className}`} dir="rtl" role="region" aria-label="اختيار الموقع">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MapPin className="w-5 h-5 text-blue-500" aria-hidden="true" />
                    اختيار الموقع
                    {required && <span className="text-red-500" aria-hidden="true">*</span>}
                </CardTitle>
                {getLocationPath() && (
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            {getLocationPath()}
                        </Badge>
                        <button
                            onClick={handleReset}
                            className="text-xs text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            aria-label="إعادة تعيين الاختيارات"
                        >
                            إعادة تعيين
                        </button>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <div
                        className="text-sm text-red-600 bg-red-50 p-3 rounded-md"
                        role="alert"
                        aria-live="assertive"
                    >
                        {error}
                    </div>
                )}

                {/* City Selection */}
                <div className="space-y-2">
                    <Label htmlFor="city-select" className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-500" aria-hidden="true" />
                        المدينة
                        {required && <span className="text-red-500" aria-hidden="true">*</span>}
                    </Label>
                    <select
                        id="city-select"
                        value={selectedCityId ?? ''}
                        onChange={handleCityChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        aria-required={required}
                    >
                        <option value="">اختر المدينة</option>
                        {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    {cities.length > 0 && (
                        <p className="text-xs text-gray-500">{cities.length} مدينة متاحة</p>
                    )}
                </div>

                {/* Neighborhood Selection */}
                {selectedCityId && (
                    <div className="space-y-2">
                        <Label htmlFor="neighborhood-select" className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-green-500" aria-hidden="true" />
                            الحي
                            {required && <span className="text-red-500" aria-hidden="true">*</span>}
                        </Label>
                        <select
                            id="neighborhood-select"
                            value={selectedNeighborhoodId ?? ''}
                            onChange={handleNeighborhoodChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || neighborhoods.length === 0}
                            aria-required={required}
                        >
                            <option value="">اختر الحي</option>
                            {neighborhoods.map((neighborhood) => (
                                <option key={neighborhood.id} value={neighborhood.id}>
                                    {neighborhood.name}
                                </option>
                            ))}
                        </select>
                        {loading && neighborhoods.length === 0 && (
                            <p className="text-xs text-blue-600">جاري تحميل الأحياء...</p>
                        )}
                        {!loading && neighborhoods.length === 0 && (
                            <p className="text-xs text-gray-500">لا توجد أحياء متاحة لهذه المدينة</p>
                        )}
                        {neighborhoods.length > 0 && (
                            <p className="text-xs text-gray-500">{neighborhoods.length} حي متاح</p>
                        )}
                    </div>
                )}

                {/* Final City Selection */}
                {selectedNeighborhoodId && finalCities.length > 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="final-city-select" className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-purple-500" aria-hidden="true" />
                            المنطقة النهائية
                        </Label>
                        <select
                            id="final-city-select"
                            value={selectedFinalCityId ?? ''}
                            onChange={handleFinalCityChange}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            <option value="">اختر المنطقة (اختياري)</option>
                            {finalCities.map((finalCity) => (
                                <option key={finalCity.id} value={finalCity.id}>
                                    {finalCity.name}
                                </option>
                            ))}
                        </select>
                        {loading && finalCities.length === 0 && (
                            <p className="text-xs text-blue-600">جاري تحميل المناطق...</p>
                        )}
                        {finalCities.length > 0 && (
                            <p className="text-xs text-gray-500">{finalCities.length} منطقة متاحة</p>
                        )}
                    </div>
                )}

                {/* Selection Summary */}
                {(selectedCityId || selectedNeighborhoodId || selectedFinalCityId) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">ملخص الموقع المختار:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            {selectedCityId && (
                                <p>المدينة: {cities.find((c) => c.id === selectedCityId)?.name ?? 'غير محدد'}</p>
                            )}
                            {selectedNeighborhoodId && (
                                <p>
                                    الحي: {neighborhoods.find((n) => n.id === selectedNeighborhoodId)?.name ?? 'غير محدد'}
                                </p>
                            )}
                            {selectedFinalCityId && (
                                <p>
                                    المنطقة: {finalCities.find((fc) => fc.id === selectedFinalCityId)?.name ?? 'غير محدد'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};