import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Target } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

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
  const mapRef = useRef<any>(null);

  const [viewport, setViewport] = useState({
    latitude: initialLatitude || 23.5880,
    longitude: initialLongitude || 58.3829,
    zoom: initialLatitude ? 14 : 10
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude || 23.5880,
    longitude: initialLongitude || 58.3829
  });

  // Update viewport and marker when props change
  useEffect(() => {
    if (initialLatitude !== undefined && initialLongitude !== undefined) {
      const newViewport = {
        latitude: initialLatitude,
        longitude: initialLongitude,
        zoom: 14
      };

      setViewport(newViewport);
      setMarkerPosition({
        latitude: initialLatitude,
        longitude: initialLongitude
      });

      // Update map center if map is available
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [initialLongitude, initialLatitude],
          zoom: 14,
          duration: 1000
        });
      }
    }
  }, [initialLatitude, initialLongitude]);

  const handleMapClick = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    setMarkerPosition({ latitude: lat, longitude: lng });
    onLocationSelect(lat, lng);

    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 14
    }));
  }, [onLocationSelect]);

  const handleCurrentLocation = (e?: React.MouseEvent) => {
    // Prevent default form submission if event is passed
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Update marker position
          setMarkerPosition({ latitude, longitude });

          // Call location select callback
          onLocationSelect(latitude, longitude);

          // Update viewport
          setViewport({
            latitude,
            longitude,
            zoom: 14
          });

          // If map ref exists, fly to the location
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000 // 2 seconds smooth transition
            });
          }
        },
        (error) => {
          console.error("Error getting location", error);

          // Detailed error handling in Arabic
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("الموقع مرفوض. يرجى السماح بالوصول إلى الموقع.");
              break;
            case error.POSITION_UNAVAILABLE:
              alert("معلومات الموقع غير متاحة.");
              break;
            case error.TIMEOUT:
              alert("انتهى وقت طلب الموقع.");
              break;
            default:
              alert("حدث خطأ في تحديد الموقع.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("الموقع الجغرافي غير مدعوم في هذا المتصفح.");
    }
  };

  return (
    <div className="w-full h-96 relative rounded-2xl overflow-hidden shadow-lg">
      {/* Current Location Button */}
      <button
        type="button" // Prevent form submission
        onClick={handleCurrentLocation}
        className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
        aria-label="الموقع الحالي"
      >
        <Target className="w-5 h-5 text-blue-600" />
      </button>

      <Map
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
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
          خط العرض: {markerPosition.latitude.toFixed(4)},
          خط الطول: {markerPosition.longitude.toFixed(4)}
        </p>
      </div>
    </div>
  );
};

export default LocationPicker;