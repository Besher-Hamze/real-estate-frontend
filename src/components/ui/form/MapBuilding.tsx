import React, { useEffect, useState } from 'react';
import { FormField } from "@/components/ui/form/FormField";
import { Loader, Building2, X } from 'lucide-react';

interface Location {
    lat: number;
    lng: number;
}

interface Building {
    id: string;
    position: Location;
    title: string;
    price: number;
    type: string;
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    image: string;
}



// Dummy data for buildings in Oman
const dummyBuildings: Building[] = [
    {
        id: '1',
        position: { lat: 23.5880, lng: 58.3829 },
        title: 'Luxury Apartment in Muscat',
        price: 85000,
        type: 'Apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        image: '/api/placeholder/400/300'
    },
    {
        id: '2',
        position: { lat: 23.5930, lng: 58.3850 },
        title: 'Modern Villa in Al Khuwair',
        price: 150000,
        type: 'Villa',
        bedrooms: 5,
        bathrooms: 4,
        area: 300,
        image: '/api/placeholder/400/300'
    },
    {
        id: '3',
        position: { lat: 23.5850, lng: 58.3800 },
        title: 'Commercial Building in CBD',
        price: 500000,
        type: 'Commercial',
        area: 1000,
        image: '/api/placeholder/400/300'
    },
    {
        id: '4',
        position: { lat: 23.5920, lng: 58.3780 },
        title: 'Beachfront Apartment',
        price: 120000,
        type: 'Apartment',
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        image: '/api/placeholder/400/300'
    },
    {
        id: '5',
        position: { lat: 23.5840, lng: 58.3890 },
        title: 'Retail Space in Qurum',
        price: 250000,
        type: 'Commercial',
        area: 500,
        image: '/api/placeholder/400/300'
    }
];

const BuildingMap  = () => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

    const defaultCenter: Location = { lat: 23.5880, lng: 58.3829 };

    const createCustomMarker = (type: string) => {
        const color = type === 'Commercial' ? '#4CAF50' : 
                     type === 'Apartment' ? '#2196F3' : '#FFC107';
                     
        return {
            path: 'M18.121,9.88l-7.832-7.836c-0.155-0.158-0.428-0.158-0.583,0L1.842,9.88c-0.262,0.263-0.073,0.705,0.292,0.705h2.069v7.042c0,0.227,0.187,0.414,0.414,0.414h3.725v-5.537h2.267v5.537h3.725c0.228,0,0.414-0.188,0.414-0.414v-7.042h2.068C17.86,10.586,18.382,10.143,18.121,9.88z',
            fillColor: color,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#FFFFFF',
            scale: 1.5,
            anchor: new google.maps.Point(10, 10)
        };
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCmc-Nnia85YY163JTPgYLNyhAxBIhtSzQ&libraries=places`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);

        return () => {
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
            zoom: 14,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Create markers for each building
        const buildingMarkers = dummyBuildings.map(building => {
            const marker = new google.maps.Marker({
                position: building.position,
                map: mapInstance,
                icon: createCustomMarker(building.type),
                title: building.title
            });

            marker.addListener('click', () => {
                setSelectedBuilding(building);
            });

            return marker;
        });

        setMarkers(buildingMarkers);
        setMap(mapInstance);
        setIsLoading(false);
    };

    return (
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-gray-300">
            <input
                id="pac-input"
                className="absolute z-10 top-2 left-2 w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white"
                type="text"
                placeholder="ابحث عن موقع..."
            />
            
            {/* Building Info Card */}
            {selectedBuilding && (
                <div className="absolute top-2 right-2 w-80 bg-white rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="relative h-40">
                        <img 
                            src={selectedBuilding.image} 
                            alt={selectedBuilding.title}
                            className="w-full h-full object-cover"
                        />
                        <button 
                            onClick={() => setSelectedBuilding(null)}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-blue-600">{selectedBuilding.type}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{selectedBuilding.title}</h3>
                        <div className="text-lg font-bold text-green-600 mb-3">
                            {selectedBuilding.price.toLocaleString()} OMR
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {selectedBuilding.bedrooms && (
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Bedrooms:</span>
                                    <span>{selectedBuilding.bedrooms}</span>
                                </div>
                            )}
                            {selectedBuilding.bathrooms && (
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold">Bathrooms:</span>
                                    <span>{selectedBuilding.bathrooms}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <span className="font-semibold">Area:</span>
                                <span>{selectedBuilding.area} m²</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}
            <div id="map" className="w-full h-full" />
        </div>
    );
};

export default BuildingMap;