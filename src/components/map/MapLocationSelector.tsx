// components/map/MapLocationSelector.tsx
import React, { useState, useCallback, useEffect, KeyboardEvent } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { FormField } from '@/components/ui/form/FormField';
import { InputField } from '@/components/ui/form/InputField';

interface MapLocationSelectorProps {
  initialLocation?: string;
  onChange: (location: string) => void;
}

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 23.5880,
  lng: 58.3829
};

export function MapLocationSelector({ initialLocation, onChange }: MapLocationSelectorProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    version: "weekly",
    language: "ar",
    region: "OM"

  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral>(() => {
    if (initialLocation) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      return { lat, lng };
    }
    return defaultCenter;
  });
  const [address, setAddress] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Convert location to string format
  const locationToString = (location: google.maps.LatLngLiteral): string => {
    return `${location.lat},${location.lng}`;
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setSelectedLocation(newLocation);
      onChange(locationToString(newLocation));
      getAddressFromCoordinates(newLocation);
    }
  }, [onChange]);

  const getAddressFromCoordinates = async (location: google.maps.LatLngLiteral) => {
    if (!isLoaded) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: location
      });

      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isLoaded) return;

    setIsSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address: searchQuery });

      if (result.results[0]?.geometry?.location) {
        const newLocation = {
          lat: result.results[0].geometry.location.lat(),
          lng: result.results[0].geometry.location.lng()
        };

        setSelectedLocation(newLocation);
        setAddress(result.results[0].formatted_address);
        onChange(locationToString(newLocation));

        map?.panTo(newLocation);
        map?.setZoom(15);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    if (initialLocation && map) {
      const [lat, lng] = initialLocation.split(',').map(Number);
      const location = { lat, lng };
      setSelectedLocation(location);
      map.panTo(location);
      map.setZoom(15);
      getAddressFromCoordinates(location);
    }
  }, [initialLocation, map, isLoaded]);

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        Error loading Google Maps. Please check your API key and try again.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
        <FormField label="البحث عن موقع">
          <div className="relative">
            <InputField
              type="text"
              value={searchQuery}
              onChange={(value: any) => setSearchQuery(value)}
              placeholder="أدخل العنوان للبحث"
              onKeyDown={handleKeyDown}
              required={false}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </FormField>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 self-end"
        >
          {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
          بحث
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation}
        zoom={13}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        <Marker
          position={selectedLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#2563EB',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      </GoogleMap>

      {address && (
        <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p>{address}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <span className="font-medium">الإحداثيات:</span> {locationToString(selectedLocation)}
      </div>
    </div>
  );
}