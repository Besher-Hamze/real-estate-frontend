import React, { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Target } from 'lucide-react';

interface LocationPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (latitude: number, longitude: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  initialLatitude, 
  initialLongitude, 
  onLocationSelect 
}) => {
  // Default to Muscat, Oman if no initial coordinates
  const [viewport, setViewport] = useState({
    latitude: initialLatitude || 23.5880,
    longitude: initialLongitude || 58.3829,
    zoom: initialLatitude ? 14 : 10
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude || 23.5880,
    longitude: initialLongitude || 58.3829
  });

  const handleMapClick = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    setMarkerPosition({ latitude: lat, longitude: lng });
    onLocationSelect(lat, lng);
    
    // Update viewport to center on the new marker
    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 14
    }));
  }, [onLocationSelect]);

  const handleCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition({ latitude, longitude });
        onLocationSelect(latitude, longitude);
        
        setViewport(prev => ({
          ...prev,
          latitude,
          longitude,
          zoom: 14
        }));
      }, (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="w-full h-96 relative rounded-2xl overflow-hidden shadow-lg">
      {/* Current Location Button */}
      <button 
        onClick={handleCurrentLocation}
        className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
        aria-label="الموقع الحالي"
      >
        <Target className="w-5 h-5 text-blue-600" />
      </button>

      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY}
        initialViewState={viewport}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onClick={handleMapClick}
        onMove={evt => setViewport(evt.viewState)}
      >
        <NavigationControl position="bottom-right" />

        {/* Marker */}
        <Marker
          latitude={markerPosition.latitude}
          longitude={markerPosition.longitude}
          draggable
          onDragEnd={(event) => {
            const { lat, lng } = event.lngLat;
            setMarkerPosition({ latitude: lat, longitude: lng });
            onLocationSelect(lat, lng);
          }}
        >
          <div className="relative group">
            <MapPin 
              size={48} 
              className="fill-blue-600 stroke-white stroke-2 drop-shadow-lg group-hover:scale-110 transition-transform" 
            />
            <div className="absolute inset-0 animate-ping bg-blue-600 rounded-full opacity-50"></div>
          </div>
        </Marker>
      </Map>

      {/* Location Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
        <p className="text-sm text-gray-800">
          Lat: {markerPosition.latitude.toFixed(4)}, 
          Lng: {markerPosition.longitude.toFixed(4)}
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;