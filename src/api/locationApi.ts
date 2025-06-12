import apiClient from '.';

// Define interfaces for type safety (assuming these are defined in '@/lib/types')
interface CityType {
    id: number;
    name: string;
}

interface NeighborhoodType {
    id: number;
    name: string;
    cityId?: number; // Optional for methods that fetch all neighborhoods
}

interface FinalCityType {
    id: number;
    name: string;
    neighborhoodId?: number; // Optional for methods that fetch all final cities
}

interface LocationStats {
    citiesCount: number;
    neighborhoodsCount: number;
    finalCitiesCount: number;
}

interface LocationHierarchy {
    cities: (CityType & {
        neighborhoods: (NeighborhoodType & {
            finalCities: FinalCityType[];
        })[];
    })[];
}

interface LocationByCoordinates {
    city?: CityType;
    neighborhood?: NeighborhoodType;
    finalCity?: FinalCityType;
}

interface RequestOptions {
    signal?: AbortSignal;
}

export const LocationApi = {
    /**
     * Fetch all cities
     */
    fetchCities: async (options: RequestOptions = {}): Promise<CityType[]> => {
        try {
            const response = await apiClient.get<CityType[]>('/api/cities', {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cities';
            console.error('Failed to fetch cities:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch a single city by ID
     */
    fetchCityById: async (id: number, options: RequestOptions = {}): Promise<CityType> => {
        try {
            const response = await apiClient.get<CityType>(`/api/cities/${id}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch city with ID ${id}`;
            console.error('Failed to fetch city by ID:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch neighborhoods by city ID
     */
    fetchNeighborhoods: async (cityId: number, options: RequestOptions = {}): Promise<NeighborhoodType[]> => {
        try {
            const response = await apiClient.get<NeighborhoodType[]>(`/api/neighborhoods/${cityId}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch neighborhoods for city ${cityId}`;
            console.error('Failed to fetch neighborhoods:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch all neighborhoods
     */
    fetchAllNeighborhoods: async (options: RequestOptions = {}): Promise<NeighborhoodType[]> => {
        try {
            const response = await apiClient.get<NeighborhoodType[]>('/api/neighborhoods', {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch all neighborhoods';
            console.error('Failed to fetch all neighborhoods:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch a single neighborhood by ID
     */
    fetchNeighborhoodById: async (id: number, options: RequestOptions = {}): Promise<NeighborhoodType> => {
        try {
            const response = await apiClient.get<NeighborhoodType>(`/api/neighborhoods/${id}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch neighborhood with ID ${id}`;
            console.error('Failed to fetch neighborhood by ID:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch final cities by neighborhood ID
     */
    fetchFinalCities: async (neighborhoodId: number, options: RequestOptions = {}): Promise<FinalCityType[]> => {
        try {
            const response = await apiClient.get<FinalCityType[]>(`/api/finalCity/${neighborhoodId}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch final cities for neighborhood ${neighborhoodId}`;
            console.error('Failed to fetch final cities:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch all final cities
     */
    fetchAllFinalCities: async (options: RequestOptions = {}): Promise<FinalCityType[]> => {
        try {
            const response = await apiClient.get<FinalCityType[]>('/api/final-cities', {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch all final cities';
            console.error('Failed to fetch all final cities:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch a single final city by ID
     */
    fetchFinalCityById: async (id: number, options: RequestOptions = {}): Promise<FinalCityType> => {
        try {
            const response = await apiClient.get<FinalCityType>(`/api/final-cities/${id}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to fetch final city with ID ${id}`;
            console.error('Failed to fetch final city by ID:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Search cities by query
     */
    searchCities: async (query: string, options: RequestOptions = {}): Promise<CityType[]> => {
        try {
            const response = await apiClient.get<CityType[]>(`/api/cities/search?q=${encodeURIComponent(query)}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to search cities with query "${query}"`;
            console.error('Failed to search cities:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Search neighborhoods by query and optional city ID
     */
    searchNeighborhoods: async (query: string, cityId?: number, options: RequestOptions = {}): Promise<NeighborhoodType[]> => {
        try {
            const params = new URLSearchParams({ q: query });
            if (cityId) {
                params.append('cityId', cityId.toString());
            }
            const response = await apiClient.get<NeighborhoodType[]>(`/api/neighborhoods/search?${params.toString()}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to search neighborhoods with query "${query}"`;
            console.error('Failed to search neighborhoods:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Search final cities by query and optional neighborhood ID
     */
    searchFinalCities: async (query: string, neighborhoodId?: number, options: RequestOptions = {}): Promise<FinalCityType[]> => {
        try {
            const params = new URLSearchParams({ q: query });
            if (neighborhoodId) {
                params.append('neighborhoodId', neighborhoodId.toString());
            }
            const response = await apiClient.get<FinalCityType[]>(`/api/final-cities/search?${params.toString()}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to search final cities with query "${query}"`;
            console.error('Failed to search final cities:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Create a new city
     */
    createCity: async (cityData: Omit<CityType, 'id'>, options: RequestOptions = {}): Promise<CityType> => {
        try {
            const response = await apiClient.post<CityType>('/api/cities', cityData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create city';
            console.error('Failed to create city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Update a city
     */
    updateCity: async (id: number, cityData: Partial<CityType>, options: RequestOptions = {}): Promise<CityType> => {
        try {
            const response = await apiClient.put<CityType>(`/api/cities/${id}`, cityData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to update city with ID ${id}`;
            console.error('Failed to update city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Delete a city
     */
    deleteCity: async (id: number, options: RequestOptions = {}): Promise<void> => {
        try {
            await apiClient.delete(`/api/cities/${id}`, {
                signal: options.signal,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to delete city with ID ${id}`;
            console.error('Failed to delete city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Create a new neighborhood
     */
    createNeighborhood: async (neighborhoodData: Omit<NeighborhoodType, 'id'>, options: RequestOptions = {}): Promise<NeighborhoodType> => {
        try {
            const response = await apiClient.post<NeighborhoodType>('/api/neighborhoods', neighborhoodData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create neighborhood';
            console.error('Failed to create neighborhood:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Update a neighborhood
     */
    updateNeighborhood: async (id: number, neighborhoodData: Partial<NeighborhoodType>, options: RequestOptions = {}): Promise<NeighborhoodType> => {
        try {
            const response = await apiClient.put<NeighborhoodType>(`/api/neighborhoods/${id}`, neighborhoodData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to update neighborhood with ID ${id}`;
            console.error('Failed to update neighborhood:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Delete a neighborhood
     */
    deleteNeighborhood: async (id: number, options: RequestOptions = {}): Promise<void> => {
        try {
            await apiClient.delete(`/api/neighborhoods/${id}`, {
                signal: options.signal,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to delete neighborhood with ID ${id}`;
            console.error('Failed to delete neighborhood:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Create a new final city
     */
    createFinalCity: async (finalCityData: Omit<FinalCityType, 'id'>, options: RequestOptions = {}): Promise<FinalCityType> => {
        try {
            const response = await apiClient.post<FinalCityType>('/api/final-cities', finalCityData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create final city';
            console.error('Failed to create final city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Update a final city
     */
    updateFinalCity: async (id: number, finalCityData: Partial<FinalCityType>, options: RequestOptions = {}): Promise<FinalCityType> => {
        try {
            const response = await apiClient.put<FinalCityType>(`/api/final-cities/${id}`, finalCityData, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to update final city with ID ${id}`;
            console.error('Failed to update final city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Delete a final city
     */
    deleteFinalCity: async (id: number, options: RequestOptions = {}): Promise<void> => {
        try {
            await apiClient.delete(`/api/final-cities/${id}`, {
                signal: options.signal,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to delete final city with ID ${id}`;
            console.error('Failed to delete final city:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch location statistics
     */
    fetchLocationStats: async (options: RequestOptions = {}): Promise<LocationStats> => {
        try {
            const response = await apiClient.get<LocationStats>('/api/locations/stats', {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch location stats';
            console.error('Failed to fetch location stats:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Fetch full location hierarchy
     */
    fetchLocationHierarchy: async (options: RequestOptions = {}): Promise<LocationHierarchy> => {
        try {
            const response = await apiClient.get<LocationHierarchy>('/api/locations/hierarchy', {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch location hierarchy';
            console.error('Failed to fetch location hierarchy:', error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Find location by coordinates
     */
    findLocationByCoordinates: async (lat: number, lng: number, options: RequestOptions = {}): Promise<LocationByCoordinates> => {
        try {
            const response = await apiClient.get<LocationByCoordinates>(`/api/locations/coordinates?lat=${lat}&lng=${lng}`, {
                signal: options.signal,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to find location by coordinates (${lat}, ${lng})`;
            console.error('Failed to find location by coordinates:', error);
            throw new Error(errorMessage);
        }
    },
};