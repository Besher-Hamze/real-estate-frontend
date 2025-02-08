import React, { useEffect, useState } from 'react';
import { FormField } from "@/components/ui/form/FormField";
import { Loader } from 'lucide-react';

interface Location {
    lat: number;
    lng: number;
}

interface MapSelectorProps {
    onLocationSelect: (location: Location) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onLocationSelect }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Default center (Saudi Arabia)
    const defaultCenter: Location = { lat: 23.5880, lng: 58.3829 };

    useEffect(() => {
        // Load Google Maps Script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCmc-Nnia85YY163JTPgYLNyhAxBIhtSzQ&libraries=places`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);

        return () => {
            // Check if the script still exists before removing
            const scriptElement = document.querySelector(`script[src="${script.src}"]`);
            if (scriptElement) {
                document.head.removeChild(scriptElement);
            }
        };
    }, []);

    const initializeMap = () => {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;

        const mapInstance = new window.google.maps.Map(mapElement, {
            center: defaultCenter,
            zoom: 8,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        const markerInstance = new window.google.maps.Marker({
            map: mapInstance,
            draggable: true,
            position: defaultCenter
        });

        // Add click event to map
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            const clickedLocation = e.latLng;
            if (clickedLocation && markerInstance) {
                markerInstance.setPosition(clickedLocation);
                onLocationSelect({
                    lat: clickedLocation.lat(),
                    lng: clickedLocation.lng()
                });
            }
        });

        // Add drag end event to marker
        markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            if (position) {
                onLocationSelect({
                    lat: position.lat(),
                    lng: position.lng()
                });
            }
        });

        // Add search box
        const inputElement = document.getElementById('pac-input') as HTMLInputElement;
        if (!inputElement) return;

        const searchBox = new window.google.maps.places.SearchBox(inputElement);

        mapInstance.addListener('bounds_changed', () => {
            searchBox.setBounds(mapInstance.getBounds() || null);
        });

        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places?.length === 0) return;

            const place = places![0];
            if (!place.geometry || !place.geometry.location) return;

            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);
            markerInstance.setPosition(place.geometry.location);

            onLocationSelect({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            });
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setIsLoading(false);
    };

    return (
        <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-300">
            <input
                id="pac-input"
                className="absolute z-10 top-2 left-2 w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white"
                type="text"
                placeholder="ابحث عن موقع..."
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}
            <div id="map" className="w-full h-full" />
        </div>
    );
};

export default MapSelector;