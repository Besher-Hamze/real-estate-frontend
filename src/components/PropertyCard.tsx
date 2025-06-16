import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RealEstateData } from '@/lib/types';
import { MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';

interface PropertyCardProps {
    property: RealEstateData;
    viewMode?: 'grid' | 'list';
    onFavoriteToggle?: (id: number) => void;
    isFavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
    property,
    viewMode = 'grid',
    onFavoriteToggle,
    isFavorite = false,
}) => {
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onFavoriteToggle?.(property.id);
    };

    const imageContent = (
        <>
            {property.coverImage ? (
                <img
                    src={property.coverImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Square className="w-12 h-12 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <div className="absolute top-3 right-3">
                <Badge variant={property.mainCategoryName === 'بيع' ? 'default' : 'secondary'}>
                    {property.mainCategoryName}
                </Badge>
            </div>
            {onFavoriteToggle && (
                <button
                    onClick={handleFavoriteClick}
                    className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                    aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                </button>
            )}
        </>
    );

    if (viewMode === 'list') {
        return (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="flex flex-col sm:flex-row" dir="rtl">
                    <div className="w-full sm:w-64 h-48 flex-shrink-0 relative">{imageContent}</div>
                    <CardContent className="flex-1 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between h-full gap-4">
                            <div className="flex-1 space-y-3">
                                <Link href={`/properties/${property.id}`} className="block">
                                    <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                        {property.title}
                                    </h3>
                                </Link>
                                <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" aria-hidden="true" />
                                    <span>
                                        {property.cityName} - {property.neighborhoodName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {property.bedrooms && (
                                        <div className="flex items-center gap-1">
                                            <Bed className="w-4 h-4" aria-hidden="true" />
                                            <span>{property.bedrooms} غرف</span>
                                        </div>
                                    )}
                                    {property.bathrooms && (
                                        <div className="flex items-center gap-1">
                                            <Bath className="w-4 h-4" aria-hidden="true" />
                                            <span>{property.bathrooms} حمام</span>
                                        </div>
                                    )}
                                    {property.buildingArea && (
                                        <div className="flex items-center gap-1">
                                            <Square className="w-4 h-4" aria-hidden="true" />
                                            <span>{property.buildingArea} م²</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {formatPrice(property.price)}
                                </div>
                                <Link href={`/properties/${property.id}`}>
                                    <Button className="flex items-center gap-2 mt-4" aria-label="عرض تفاصيل العقار">
                                        <Eye className="w-4 h-4" aria-hidden="true" />
                                        عرض التفاصيل
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative h-48" dir="rtl">
                {imageContent}
            </div>
            <CardContent className="p-4 sm:p-6 space-y-3">
                <Link href={`/properties/${property.id}`} className="block">
                    <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {property.title}
                    </h3>
                </Link>
                <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    <span>
                        {property.cityName} - {property.neighborhoodName}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatPrice(property.price)}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
                    {property.bedrooms && (
                        <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" aria-hidden="true" />
                            <span>{property.bedrooms}</span>
                        </div>
                    )}
                    {property.bathrooms && (
                        <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" aria-hidden="true" />
                            <span>{property.bathrooms}</span>
                        </div>
                    )}
                    {property.buildingArea && (
                        <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" aria-hidden="true" />
                            <span>{property.buildingArea} م²</span>
                        </div>
                    )}
                </div>
                {property.finalTypeName && (
                    <div className="pt-2">
                        <Badge variant="outline" className="text-xs">
                            {property.finalTypeName}
                        </Badge>
                    </div>
                )}
                <Link href={`/properties/${property.id}`} className="block pt-4">
                    <Button className="w-full flex items-center gap-2 justify-center" aria-label="عرض تفاصيل العقار">
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        عرض التفاصيل
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};