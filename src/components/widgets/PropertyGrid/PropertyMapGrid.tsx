import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SearchX, MapPin, List, MapIcon } from 'lucide-react';
import RealEstateCard from './PropertyCard';
import { RealEstateData, MainType, SubType } from '@/lib/types';
import { PropertyCardSkeleton } from '@/components/home/home';

interface PropertyGridProps {
    filteredData: RealEstateData[];
    isLoading: boolean;
    resetFilters: () => void;
    currentMainType: MainType | undefined;
    currentSubType: SubType | undefined;
}

const PropertyMapGrid: React.FC<PropertyGridProps> = ({
    filteredData,
    isLoading,
    resetFilters,
    currentMainType,
    currentSubType
}) => {
    // State for view mode
    const [viewMode, setViewMode] = useState<'split' | 'list' | 'map' | any>('split');

    // State for selected property
    const [selectedProperty, setSelectedProperty] = useState<RealEstateData | null>(null);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);

    // Refs for property card elements
    const propertyCardsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    // Initial map viewport
    const [viewport, setViewport] = useState({
        latitude: 23.5880, // Default coordinates for Oman
        longitude: 58.3829,
        zoom: 10
    });

    // Update viewport if we have properties
    useEffect(() => {
        if (filteredData.length > 0 && filteredData[0].location) {
            try {
                const [lat, lng] = filteredData[0].location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setViewport({
                        latitude: lat,
                        longitude: lng,
                        zoom: 10
                    });
                }
            } catch (error) {
                console.error("Error parsing location:", error);
            }
        }
    }, [filteredData]);

    // Valid markers - only properties with valid coordinates
    const validMarkers = useMemo(() => {
        return filteredData.filter(property => {
            if (!property.location) return false;

            try {
                const [lat, lng] = property.location.split(',').map(Number);
                return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
            } catch {
                return false;
            }
        });
    }, [filteredData]);

    // Function to scroll to property card when hovering over a marker
    const scrollToPropertyCard = (propertyId: number) => {
        const cardElement = propertyCardsRef.current[propertyId];
        const container = gridContainerRef.current;

        if (cardElement && container && (viewMode === 'split' || viewMode === 'list')) {
            // Get positions
            const containerRect = container.getBoundingClientRect();
            const cardRect = cardElement.getBoundingClientRect();

            // Calculate if card is in view
            const isInView =
                cardRect.top >= containerRect.top &&
                cardRect.bottom <= containerRect.bottom;

            if (!isInView) {
                // Scroll to the card with some offset for better visibility
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    // Function to fly to marker on map
    const flyToMarker = (property: RealEstateData) => {
        if (property.location && (viewMode === 'map' || viewMode === 'split')) {
            try {
                const [lat, lng] = property.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Use a smooth fly animation to move to the location
                    if (mapRef.current) {
                        mapRef.current.flyTo({
                            center: [lng, lat],
                            zoom: 14,
                            duration: 1500, // Animation duration in milliseconds
                            essential: true // This animation is considered essential for the user experience
                        });
                    } else {
                        // Fallback if mapRef is not available
                        setViewport({
                            ...viewport,
                            latitude: lat,
                            longitude: lng,
                            zoom: 14
                        });
                    }
                }
            } catch (error) {
                console.error("Error parsing location for map navigation:", error);
            }
        }
    };

    // Handle marker hover
    const handleMarkerHover = (property: RealEstateData) => {
        setHoveredMarkerId(property.id);
        scrollToPropertyCard(property.id);
    };

    // Handle marker leave
    const handleMarkerLeave = () => {
        setHoveredMarkerId(null);
    };

    // Handle property card hover
    const handlePropertyCardHover = (property: RealEstateData) => {
        setHoveredMarkerId(property.id);
        flyToMarker(property);
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Results Count and View Toggle */}
            <div className="flex justify-between items-center">
                <div className="text-gray-600 text-sm">
                    إجمالي النتائج: {filteredData.length} عقار
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        aria-label="عرض القائمة"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('split')}
                        className={`p-2 rounded-lg ${viewMode === 'split' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        aria-label="عرض مقسم"
                    >
                        <div className="w-5 h-5 flex flex-row">
                            <div className="w-1/2 border-r border-current"></div>
                            <div className="w-1/2"></div>
                        </div>
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                        aria-label="عرض الخريطة"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex ${viewMode === 'list' ? 'flex-col' : 'flex-col lg:flex-row'} gap-6 h-[calc(100vh-200px)]`}>
                {/* Map Section */}
                {(viewMode === 'map' || viewMode === 'split') && (
                    <div className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} h-full rounded-2xl overflow-hidden shadow-lg`}>
                        <Map
                            ref={mapRef}
                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
                            initialViewState={viewport}
                            style={{ width: '100%', height: '100%' }}
                            mapStyle="mapbox://styles/mapbox/streets-v11"
                            onMove={evt => setViewport(evt.viewState)}
                        >
                            <NavigationControl position="bottom-right" />

                            {/* Property Markers */}
                            {validMarkers.map((property) => {
                                const [lat, lng] = property.location.split(',').map(Number);
                                const isHighlighted = hoveredMarkerId === property.id || selectedProperty?.id === property.id;

                                return (
                                    <Marker
                                        key={property.id}
                                        latitude={lat}
                                        longitude={lng}
                                        anchor="bottom"
                                        onClick={(e) => {
                                            e.originalEvent.stopPropagation();
                                            setSelectedProperty(property);
                                            scrollToPropertyCard(property.id);
                                        }}
                                    >
                                        <div
                                            className="relative group cursor-pointer"
                                            onMouseEnter={() => handleMarkerHover(property)}
                                            onMouseLeave={handleMarkerLeave}
                                        >
                                            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap transition-opacity ${isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                {property.price.toLocaleString()} ر.ع
                                            </div>
                                            <div className={`bg-white rounded-full p-1 shadow-lg transform transition-all duration-300 ${isHighlighted ? 'scale-125' : 'group-hover:scale-110'}`}>
                                                <div className={`${isHighlighted ? 'bg-blue-500' : (property.mainCategoryName?.includes('إيجار') ? 'bg-green-500' : 'bg-red-500')} rounded-full p-2 text-white flex items-center justify-center`}>
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </Marker>
                                );
                            })}
                        </Map>
                    </div>
                )}

                {/* Properties Grid */}
                {(viewMode === 'list' || viewMode === 'split') && (
                    <div
                        ref={gridContainerRef}
                        className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} overflow-y-auto`}
                    >
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array(4).fill(0).map((_, index) => (
                                    <PropertyCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : filteredData.length > 0 ? (
                            <div className={`grid grid-cols-1 md:grid-cols-${viewMode == "list" ? "3" : "2"} gap-6`}>
                                {filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        ref={el => propertyCardsRef.current[item.id] = (el as any)}
                                    >
                                        <RealEstateCard
                                            item={item}
                                            mainType={currentMainType}
                                            selectedSubType={currentSubType}
                                            onHover={() => handlePropertyCardHover(item)}
                                            onLeave={() => setHoveredMarkerId(null)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <SearchX className="w-12 h-12 text-gray-400" />
                                    <p className="text-gray-600 text-lg">
                                        لا توجد عقارات تطابق معايير البحث
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        إعادة ضبط الفلاتر
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyMapGrid;