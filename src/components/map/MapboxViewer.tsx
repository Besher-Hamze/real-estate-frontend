import React, { useState, useMemo } from 'react';
import Map, {
    Marker,
    Popup,
    NavigationControl,
    FullscreenControl,
    ScaleControl
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    MapPin,
    Maximize,
    Minimize,
    RefreshCw,
    AlertCircle,
    Navigation,
    Layers,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapboxViewerProps {
    latitude?: number;
    longitude?: number;
    address?: string;
    cityName?: string;
    neighborhoodName?: string;
}

type MapStyleOption = {
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
};

const MapboxViewer: React.FC<MapboxViewerProps> = ({
    latitude,
    longitude,
    address,
    cityName,
    neighborhoodName
}) => {
    const [showPopup, setShowPopup] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentStyleId, setCurrentStyleId] = useState<string>('streets');
    const [showStyleSelector, setShowStyleSelector] = useState(false);

    // Validate coordinates
    const isValidCoordinates = useMemo(() =>
        latitude && longitude &&
        !isNaN(latitude) && !isNaN(longitude) &&
        latitude !== 0 && longitude !== 0
        , [latitude, longitude]);

    // Map style options
    const mapStyles: MapStyleOption[] = [
        { id: 'streets', name: 'شوارع', url: 'mapbox://styles/mapbox/streets-v12' },
        { id: 'satellite', name: 'قمر صناعي', url: 'mapbox://styles/mapbox/satellite-v9' },
        { id: 'satellite-streets', name: 'قمر صناعي مع شوارع', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
        { id: 'outdoors', name: 'خارجي', url: 'mapbox://styles/mapbox/outdoors-v12' },
        { id: 'light', name: 'فاتح', url: 'mapbox://styles/mapbox/light-v11' },
        { id: 'dark', name: 'داكن', url: 'mapbox://styles/mapbox/dark-v11' },
        { id: 'navigation-day', name: 'ملاحة نهاري', url: 'mapbox://styles/mapbox/navigation-day-v1' },
        { id: 'navigation-night', name: 'ملاحة ليلي', url: 'mapbox://styles/mapbox/navigation-night-v1' },
        { id: 'traffic-day', name: 'حركة المرور نهاري', url: 'mapbox://styles/mapbox/traffic-day-v2' },
        { id: 'traffic-night', name: 'حركة المرور ليلي', url: 'mapbox://styles/mapbox/traffic-night-v2' },
        { id: 'terrain', name: 'تضاريس', url: 'mapbox://styles/mapbox/terrain' },
        { id: 'monochrome', name: 'أحادي اللون', url: 'mapbox://styles/mapbox/monochrome' }
    ];

    // Get current style URL
    const currentMapStyle = useMemo(() => {
        return mapStyles.find(style => style.id === currentStyleId)?.url || mapStyles[0].url;
    }, [currentStyleId]);

    // If no valid coordinates, return error view
    if (!isValidCoordinates) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-96 bg-gray-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300"
            >
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">الموقع غير متوفر</p>
                <p className="text-gray-500 text-sm mt-2">تأكد من صحة إحداثيات الموقع</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full ${isFullScreen ? 'fixed inset-0 z-50 p-4 bg-black/50' : 'rounded-2xl overflow-hidden shadow-lg'} relative`}
        >
            <div
                className={`relative ${isFullScreen ? 'h-[calc(100vh-2rem)]' : 'h-96'}`}
            >
                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    {/* Full Screen Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                        aria-label={isFullScreen ? "تصغير" : "تكبير"}
                    >
                        {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </motion.button>

                    {/* Map Style Selector Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStyleSelector(!showStyleSelector)}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                        aria-label="أنماط الخريطة"
                    >
                        <Layers className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Style Selector Panel */}
                <AnimatePresence>
                    {showStyleSelector && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs max-h-80 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-800">أنماط الخريطة</h3>
                                <button 
                                    onClick={() => setShowStyleSelector(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {mapStyles.map((style) => (
                                    <motion.button
                                        key={style.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setCurrentStyleId(style.id);
                                            setShowStyleSelector(false);
                                        }}
                                        className={`p-2 rounded text-xs text-right transition-colors ${
                                            currentStyleId === style.id
                                                ? 'bg-blue-100 text-blue-700 font-medium'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {style.name}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Location Button */}
                <div className="absolute bottom-24 right-4 z-10">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
                        aria-label="موقعي الحالي"
                        onClick={() => {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    // This would normally update the map view
                                    console.log("Current location:", position.coords);
                                },
                                (error) => {
                                    console.error("Error getting location:", error);
                                }
                            );
                        }}
                    >
                        <Navigation className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Address Display */}
                {address && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
                    >
                        <div className="text-gray-800 font-medium text-sm">{address}</div>
                        {(cityName || neighborhoodName) && (
                            <div className="text-gray-600 text-xs mt-1">
                                {neighborhoodName && <span>{neighborhoodName}</span>}
                                {cityName && neighborhoodName && <span> - </span>}
                                {cityName && <span>{cityName}</span>}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Mapbox Map */}
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
                    initialViewState={{
                        latitude: latitude!,
                        longitude: longitude!,
                        zoom: 14
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={currentMapStyle}
                    attributionControl={true}
                >
                    {/* Navigation Controls */}
                    <NavigationControl position="bottom-right" />
                    <FullscreenControl position="bottom-right" />
                    <ScaleControl />

                    {/* Property Marker */}
                    <Marker
                        latitude={latitude!}
                        longitude={longitude!}
                        anchor="bottom"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative group"
                        >
                            <MapPin
                                size={48}
                                className="fill-blue-600 stroke-white stroke-2 drop-shadow-lg group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 animate-ping bg-blue-600 rounded-full opacity-50"></div>
                        </motion.div>
                    </Marker>

                    {/* Optional Popup */}
                    {showPopup && address && (
                        <Popup
                            latitude={latitude!}
                            longitude={longitude!}
                            anchor="bottom"
                            onClose={() => setShowPopup(false)}
                            closeButton={false}
                            closeOnClick={false}
                            className="z-20"
                        >
                            <div className="p-2 text-sm text-center">
                                <div className="font-medium">{address}</div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
        </motion.div>
    );
};

export default MapboxViewer;