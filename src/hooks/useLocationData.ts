import { useState, useEffect, useMemo } from 'react';
import { LocationApi } from '@/api/locationApi';

// Define interfaces for type safety (assuming these are defined in '@/lib/types')
interface CityType {
    id: number;
    name: string;
}

interface NeighborhoodType {
    id: number;
    name: string;
}

interface FinalCityType {
    id: number;
    name: string;
}

export const useLocationData = () => {
    // State management
    const [cities, setCities] = useState<CityType[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
    const [finalCities, setFinalCities] = useState<FinalCityType[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all cities on initial mount
    useEffect(() => {
        const abortController = new AbortController();

        const fetchCities = async () => {
            try {
                setLoading(true);
                setError(null);
                const citiesData = await LocationApi.fetchCities({ signal: abortController.signal });
                setCities(citiesData);
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    const errorMessage = err.message || 'Failed to fetch cities';
                    setError(errorMessage);
                    console.error('Error fetching cities:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCities();

        return () => abortController.abort(); // Cleanup on unmount
    }, []);

    // Fetch neighborhoods when a city is selected
    useEffect(() => {
        if (!selectedCityId) {
            setNeighborhoods([]);
            setSelectedNeighborhoodId(null);
            return;
        }

        const abortController = new AbortController();

        const fetchNeighborhoods = async () => {
            try {
                setLoading(true);
                setError(null);
                const neighborhoodsData = await LocationApi.fetchNeighborhoods(selectedCityId, {
                    signal: abortController.signal,
                });
                setNeighborhoods(neighborhoodsData);
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    const errorMessage = err.message || 'Failed to fetch neighborhoods';
                    setError(errorMessage);
                    console.error('Error fetching neighborhoods:', err);
                    setNeighborhoods([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNeighborhoods();

        return () => abortController.abort(); // Cleanup on unmount or city change
    }, [selectedCityId]);

    // Fetch final cities when a neighborhood is selected
    useEffect(() => {
        if (!selectedNeighborhoodId) {
            setFinalCities([]);
            return;
        }

        const abortController = new AbortController();

        const fetchFinalCities = async () => {
            try {
                setLoading(true);
                setError(null);
                const finalCitiesData = await LocationApi.fetchFinalCities(selectedNeighborhoodId, {
                    signal: abortController.signal,
                });
                setFinalCities(finalCitiesData);
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    const errorMessage = err.message || 'Failed to fetch final cities';
                    setError(errorMessage);
                    console.error('Error fetching final cities:', err);
                    setFinalCities([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFinalCities();

        return () => abortController.abort(); // Cleanup on unmount or neighborhood change
    }, [selectedNeighborhoodId]);

    // Reset all selections
    const resetSelections = () => {
        setSelectedCityId(null);
        setSelectedNeighborhoodId(null);
        setNeighborhoods([]);
        setFinalCities([]);
        setError(null);
    };

    // Get selected city name
    const getSelectedCityName = useMemo(() => {
        return (): string | null => {
            if (!selectedCityId) return null;
            const city = cities.find((c) => c.id === selectedCityId);
            return city ? city.name : null;
        };
    }, [cities, selectedCityId]);

    // Get selected neighborhood name
    const getSelectedNeighborhoodName = useMemo(() => {
        return (): string | null => {
            if (!selectedNeighborhoodId) return null;
            const neighborhood = neighborhoods.find((n) => n.id === selectedNeighborhoodId);
            return neighborhood ? neighborhood.name : null;
        };
    }, [neighborhoods, selectedNeighborhoodId]);

    // Get final city by ID
    const getFinalCityById = useMemo(() => {
        return (finalCityId: number): FinalCityType | null => {
            return finalCities.find((fc) => fc.id === finalCityId) || null;
        };
    }, [finalCities]);

    // Set location from IDs
    const setLocationFromIds = async (
        cityId: number,
        neighborhoodId?: number,
        finalCityId?: number
    ) => {
        const abortController = new AbortController();
        try {
            setLoading(true);
            setError(null);

            // Set city
            setSelectedCityId(cityId);

            if (neighborhoodId) {
                // Fetch and set neighborhoods
                const neighborhoodsData = await LocationApi.fetchNeighborhoods(cityId, {
                    signal: abortController.signal,
                });
                setNeighborhoods(neighborhoodsData);
                setSelectedNeighborhoodId(neighborhoodId);

                if (finalCityId) {
                    // Fetch and set final cities
                    const finalCitiesData = await LocationApi.fetchFinalCities(neighborhoodId, {
                        signal: abortController.signal,
                    });
                    setFinalCities(finalCitiesData);
                }
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                const errorMessage = err.message || 'Failed to set location';
                setError(errorMessage);
                console.error('Error setting location from IDs:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Search cities
    const searchCities = useMemo(() => {
        return (query: string): CityType[] => {
            if (!query.trim()) return cities;
            return cities.filter((city) =>
                city.name.toLowerCase().includes(query.toLowerCase())
            );
        };
    }, [cities]);

    // Search neighborhoods
    const searchNeighborhoods = useMemo(() => {
        return (query: string): NeighborhoodType[] => {
            if (!query.trim()) return neighborhoods;
            return neighborhoods.filter((neighborhood) =>
                neighborhood.name.toLowerCase().includes(query.toLowerCase())
            );
        };
    }, [neighborhoods]);

    // Search final cities
    const searchFinalCities = useMemo(() => {
        return (query: string): FinalCityType[] => {
            if (!query.trim()) return finalCities;
            return finalCities.filter((finalCity) =>
                finalCity.name.toLowerCase().includes(query.toLowerCase())
            );
        };
    }, [finalCities]);

    // Validate selections
    const validateSelections = useMemo(() => {
        return (): { isValid: boolean; errors: string[] } => {
            const errors: string[] = [];

            if (!selectedCityId) {
                errors.push('Please select a city');
            }

            if (!selectedNeighborhoodId && neighborhoods.length > 0) {
                errors.push('Please select a neighborhood');
            }

            return {
                isValid: errors.length === 0,
                errors,
            };
        };
    }, [selectedCityId, selectedNeighborhoodId, neighborhoods]);

    // Get full location path
    const getLocationPath = useMemo(() => {
        return (): string => {
            const parts: string[] = [];

            const cityName = getSelectedCityName();
            if (cityName) parts.push(cityName);

            const neighborhoodName = getSelectedNeighborhoodName();
            if (neighborhoodName) parts.push(neighborhoodName);

            return parts.join(' - ') || 'No location selected';
        };
    }, [getSelectedCityName, getSelectedNeighborhoodName]);

    return {
        // Data
        cities,
        neighborhoods,
        finalCities,
        selectedCityId,
        selectedNeighborhoodId,

        // Loading and error states
        loading,
        error,

        // Setter functions
        setSelectedCityId,
        setSelectedNeighborhoodId,
        resetSelections,
        setLocationFromIds,

        // Utility functions
        getSelectedCityName,
        getSelectedNeighborhoodName,
        getFinalCityById,
        searchCities,
        searchNeighborhoods,
        searchFinalCities,
        validateSelections,
        getLocationPath,

        // Helpful states
        hasSelectedCity: selectedCityId !== null,
        hasSelectedNeighborhood: selectedNeighborhoodId !== null,
        isLocationComplete: selectedCityId !== null && selectedNeighborhoodId !== null,

        // Statistics
        citiesCount: cities.length,
        neighborhoodsCount: neighborhoods.length,
        finalCitiesCount: finalCities.length,
    };
};