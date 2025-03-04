import React, { useState, useCallback, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Target } from 'lucide-react';

interface MapLocationSelectorProps {
  initialLocation?: string;
  onChange: (location: string) => void;
}

export function MapLocationSelector({ initialLocation, onChange }: MapLocationSelectorProps) {
  const mapRef = useRef<any>(null);

  // Parse initial location or use default
  const initialLat = initialLocation ? parseFloat(initialLocation.split(',')[0]) : 23.5880;
  const initialLng = initialLocation ? parseFloat(initialLocation.split(',')[1]) : 58.3829;

  const [viewport, setViewport] = useState({
    latitude: initialLat,
    longitude: initialLng,
    zoom: initialLocation ? 14 : 10
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLat,
    longitude: initialLng
  });

  // Handle map click
  const handleMapClick = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    setMarkerPosition({ latitude: lat, longitude: lng });
    onChange(`${lat},${lng}`);

    setViewport(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 14
    }));
  }, [onChange]);

  // Get current location
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
          onChange(`${latitude},${longitude}`);

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
            onChange(`${lat},${lng}`);
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
}