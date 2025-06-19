import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SearchX, MapPin, List, MapIcon, Grid, ArrowRight, Filter, Loader } from 'lucide-react';
import RealEstateCard from './PropertyCard';
import { RealEstateData, MainType, SubType } from '@/lib/types';
import { PropertyCardSkeleton } from '@/components/home/home';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('list');
    const [selectedProperty, setSelectedProperty] = useState<RealEstateData | null>(null);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapContainerDimensions, setMapContainerDimensions] = useState({ width: '100%', height: '100%' });

    // Refs for property card elements
    const propertyCardsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Initial map viewport
    const [viewport, setViewport] = useState({
        latitude: 23.5880, // Default coordinates for Oman
        longitude: 58.3829,
        zoom: 10
    });


    function getPinColor(mainCategoryName: string) {
        if (mainCategoryName.includes("إيجار")) {
            return "bg-green-600";
        } else if (mainCategoryName.includes("بيع")) {
            return "bg-red-600";
        } else {
            return "bg-yellow-600";
        }
    }
    useEffect(() => {
        const checkIsMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);

            if (mobile && viewMode === 'split') {
                setViewMode('list');
            }
        };

        // Initial check
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIsMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIsMobile);
    }, [viewMode]);

    // Track window resize and update map dimensions
    useEffect(() => {
        const handleResize = () => {
            if (mapContainerRef.current) {
                // Force the map to fill its container
                setMapContainerDimensions({
                    width: '100%',
                    height: '100%'
                });
            }
        };

        // Add event listener for resize
        window.addEventListener('resize', handleResize);

        // Initial setup
        handleResize();

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

    // Listen for zoom events and update container size
    useEffect(() => {
        if (mapRef.current && mapRef.current.getMap) {
            const map = mapRef.current.getMap();

            const handleZoom = () => {
                // Force reflow by updating the dimensions state
                setMapContainerDimensions(prev => ({ ...prev }));
            };

            // Add zoom start and zoom end event listeners
            map.on('zoomstart', handleZoom);
            map.on('zoomend', handleZoom);
            map.on('movestart', handleZoom);
            map.on('moveend', handleZoom);

            return () => {
                map.off('zoomstart', handleZoom);
                map.off('zoomend', handleZoom);
                map.off('movestart', handleZoom);
                map.off('moveend', handleZoom);
            };
        }
    }, [mapRef.current, mapLoaded]);

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

    // Function to navigate to property details page
    const navigateToPropertyDetails = (propertyId: number) => {
        router.push(`/properties/${propertyId}`);
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

    // Handle view mode change with mobile check
    const handleViewModeChange = (mode: 'split' | 'list' | 'map') => {
        // Don't allow split mode on mobile
        if (mode === 'split' && isMobile) {
            setViewMode('list');
        } else {
            setViewMode(mode);
        }

        // If switching to map mode, center on first property
        if (mode === 'map') {
            if (validMarkers[0]) {
                flyToMarker(validMarkers[0]);
            } else {
                setViewport({
                    latitude: 23.5880, // Default coordinates for Oman
                    longitude: 58.3829,
                    zoom: 10
                });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col space-y-4"
        >
            {/* Results Count and View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-4 sticky top-0 z-10">
                <div className="flex items-center gap-2 mb-3 md:mb-0">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <div className="text-gray-700 font-medium">
                        <span className="text-blue-600 font-bold">{filteredData.length}</span> عقار
                        {currentMainType && (
                            <span className="mr-2 text-gray-500">
                                | {currentMainType.name}
                                {currentSubType && <span> - {currentSubType.name}</span>}
                            </span>
                        )}
                    </div>

                    {(currentMainType || currentSubType) && (
                        <button
                            onClick={resetFilters}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center mr-3"
                        >
                            <span>إعادة ضبط</span>
                            <ArrowRight className="w-4 h-4 mr-1" />
                        </button>
                    )}
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-lg self-center md:self-auto">
                    <button
                        onClick={() => handleViewModeChange('list')}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        aria-label="عرض القائمة"
                    >
                        <List className="w-4 h-4" />
                        <span className="text-sm font-medium">قائمة</span>
                    </button>

                    {/* Only show split option on desktop */}
                    {!isMobile && (
                        <button
                            onClick={() => handleViewModeChange('split')}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                            aria-label="عرض مقسم"
                        >
                            <Grid className="w-4 h-4" />
                            <span className="text-sm font-medium">مقسم</span>
                        </button>
                    )}

                    <button
                        onClick={() => handleViewModeChange('map')}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                        aria-label="عرض الخريطة"
                    >
                        <MapIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">خريطة</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container - Set to full height and width with flex */}
            <div className={`flex ${viewMode === 'list' ? 'flex-col' : 'flex-col lg:flex-row'} gap-4 ${viewMode === 'list' ? 'h-full' : 'h-[calc(100vh-220px)]'} w-full`}>
                {/* Map Section */}
                <AnimatePresence>
                    {(viewMode === 'map' || viewMode === 'split') && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            ref={mapContainerRef}
                            className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} h-full relative rounded-2xl overflow-hidden shadow-lg`}
                            style={{
                                minHeight: '400px',
                                position: 'relative'
                            }}
                        >
                            {!mapLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                    <div className="flex flex-col items-center">
                                        <Loader className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                                        <span className="text-gray-600">جاري تحميل الخريطة...</span>
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-0">
                                <Map
                                    ref={mapRef}
                                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
                                    initialViewState={viewport}
                                    style={{
                                        width: mapContainerDimensions.width,
                                        height: mapContainerDimensions.height,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0
                                    }}
                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                    onMove={evt => {
                                        setViewport(evt.viewState);
                                        // Force map resize on every move
                                        if (mapRef.current?.getMap) {
                                            setTimeout(() => {
                                                mapRef.current.getMap().resize();
                                            }, 0);
                                        }
                                    }}
                                    onLoad={() => {
                                        setMapLoaded(true);
                                        // Ensure map takes full size on load
                                        if (mapRef.current?.getMap) {
                                            setTimeout(() => {
                                                mapRef.current.getMap().resize();
                                            }, 100);
                                        }
                                    }}
                                    onZoom={() => {
                                        // Force map resize on zoom
                                        if (mapRef.current?.getMap) {
                                            setTimeout(() => {
                                                mapRef.current.getMap().resize();
                                            }, 0);
                                        }
                                    }}
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
                                                    // Navigate to property details page when clicking on marker
                                                    navigateToPropertyDetails(property.id);
                                                }}
                                            >
                                                <div
                                                    className="relative cursor-pointer"
                                                    onMouseEnter={() => handleMarkerHover(property)}
                                                    onMouseLeave={handleMarkerLeave}
                                                >
                                                    <AnimatePresence>
                                                        {isHighlighted && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: 10 }}
                                                                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10"
                                                            >
                                                                <div className="font-bold text-blue-600">{property.price.toLocaleString()} ر.ع</div>
                                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform"></div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <motion.div
                                                        animate={{
                                                            scale: isHighlighted ? 1.3 : 1,
                                                        }}
                                                        whileHover={{ scale: 1.2 }}
                                                        className={`${isHighlighted ? 'z-20' : 'z-10'} transition-all duration-200`}
                                                    >
                                                        <div className={`${getPinColor(property.mainCategoryName ?? "")} rounded-full p-2 text-white flex items-center justify-center shadow-md`}>
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </Marker>
                                        );
                                    })}
                                </Map>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Properties Grid */}
                <AnimatePresence>
                    {(viewMode === 'list' || viewMode === 'split') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            ref={gridContainerRef}
                            className={`${viewMode === 'split' ? 'lg:w-1/2' : 'w-full'} ${viewMode === 'split' ? 'overflow-y-auto' : ''} bg-gray-50 rounded-xl p-4`}>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array(4).fill(0).map((_, index) => (
                                        <PropertyCardSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredData.length > 0 ? (
                                <div className={`grid grid-cols-1 ${viewMode === "list" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                                    {filteredData.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            ref={el => propertyCardsRef.current[item.id] = (el as any)}
                                            whileHover={{
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                            animate={{
                                                boxShadow: hoveredMarkerId === item.id ? '0 10px 25px -5px rgba(59, 130, 246, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            className={`rounded-xl transition-all ${hoveredMarkerId === item.id ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => navigateToPropertyDetails(item.id)}
                                        >
                                            <RealEstateCard
                                                item={item}
                                                mainType={currentMainType}
                                                selectedSubType={currentSubType}
                                                onHover={() => handlePropertyCardHover(item)}
                                                onLeave={() => setHoveredMarkerId(null)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center h-full py-12"
                                >
                                    <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center max-w-md">
                                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                                            <SearchX className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نتائج</h3>
                                        <p className="text-gray-600 text-center mb-6">
                                            لا توجد عقارات تطابق معايير البحث الخاصة بك. يرجى تعديل الفلاتر والمحاولة مرة أخرى.
                                        </p>
                                        <button
                                            onClick={resetFilters}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                                        >
                                            إعادة ضبط الفلاتر
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PropertyMapGrid;