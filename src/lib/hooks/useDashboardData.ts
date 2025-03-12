// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { CityType, NeighborhoodType } from '@/lib/types/index';
import apiClient from '@/api';

export const useDashboardData = (cityId?: number) => {
    const [cities, setCities] = useState<CityType[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get("/api/cities");
                setCities(response.data);
            } catch (err) {
                setError('Failed to fetch cities');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCities();
    }, []);

    useEffect(() => {
        const fetchNeighborhoods = async () => {
            if (!cityId) return;
            
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/api/neighborhoods/city/${cityId}`);
                setNeighborhoods(response.data);
            } catch (err) {
                setError('Failed to fetch neighborhoods');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNeighborhoods();
    }, [cityId]);

    return {
        cities,
        neighborhoods,
        isLoading,
        error
    };
};