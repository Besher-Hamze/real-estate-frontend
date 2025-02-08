import React, { useState } from 'react';
import { Building2, Search, Filter, MapPin, Loader2 } from 'lucide-react';
import MapSelector from '../ui/form/MapSelector';

interface Building {
    id: string;
    position: {
        lat: number;
        lng: number;
    };
    title: string;
    price: number;
    type: string;
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    image: string;
}

const BuildingMapView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);

    const propertyTypes = [
        { id: 'all', label: 'الكل' },
        { id: 'Apartment', label: 'شقق' },
        { id: 'Villa', label: 'فلل' },
        { id: 'Commercial', label: 'تجاري' }
    ];

    const handleLocationSelect = ({ lat, lng }: { lat: number; lng: number }) => {
        console.log('Selected location:', { lat, lng });
    };

    return (
        <div className="w-full h-[calc(100vh-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Building2 className="w-6 h-6" />
                        <h2 className="text-xl font-semibold">خريطة المباني</h2>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative flex-grow">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ابحث عن المباني..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 items-center">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <div className="flex gap-2">
                            {propertyTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`px-4 py-1 rounded-full text-sm font-medium transition-colors
                                        ${selectedType === type.id 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative h-[calc(100%-5rem)]">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <MapSelector onLocationSelect={handleLocationSelect} />
                )}
            </div>
        </div>
    );
};

export default BuildingMapView;