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
    Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapboxViewerProps {
    latitude?: number;
    longitude?: number;
    cityName?: string;
    neighborhoodName?: string;
}

const MapboxViewer: React.FC<MapboxViewerProps> = ({
    latitude,
    longitude,
    cityName,
    neighborhoodName
}) => {
    const [showPopup, setShowPopup] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

    // Validate coordinates
    const isValidCoordinates = useMemo(() =>
        latitude && longitude &&
        !isNaN(latitude) && !isNaN(longitude) &&
        latitude !== 0 && longitude !== 0
        , [latitude, longitude]);

    // Map style options
    const mapStyles = {
        streets: 'mapbox://styles/mapbox/streets-v11',
        satellite: 'mapbox://styles/mapbox/satellite-v9'
    };

    // Toggle map style
    const toggleMapStyle = () => {
        setMapStyle(prev => prev === 'streets' ? 'satellite' : 'streets');
    };

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

                    {/* Map Style Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMapStyle}
                        className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
                        aria-label="تغيير نمط الخريطة"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Mapbox Map */}
                <Map
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
                    initialViewState={{
                        latitude: latitude!,
                        longitude: longitude!,
                        zoom: 14
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={mapStyles[mapStyle]}
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

                    {/* Popup with Address */}
                    <AnimatePresence>
                        {showPopup && (
                            <Popup
                                latitude={latitude!}
                                longitude={longitude!}
                                anchor="top"
                                onClose={() => setShowPopup(false)}
                                maxWidth="300px"
                                className="custom-popup"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-4 bg-white rounded-xl shadow-lg"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Navigation className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-bold text-gray-800">موقع العقار</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-semibold">المدينة:</span> {cityName}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-semibold">الحي:</span> {neighborhoodName}
                                        </p>
                                    </div>
                                </motion.div>
                            </Popup>
                        )}
                    </AnimatePresence>
                </Map>
            </div>
        </motion.div>
    );
};

export default MapboxViewer;