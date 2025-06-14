import { useState, useEffect } from 'react';
import { FilterPropertiesApi } from '@/api/filterPropertiesApi';
import { FilterPropertiesResponse } from '@/lib/types/filterProperties';

export const useFilterProperties = (finalTypeId: number | null) => {
    const [filterProperties, setFilterProperties] = useState<FilterPropertiesResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!finalTypeId) {
            setFilterProperties(null);
            return;
        }

        const fetchFilterProperties = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await FilterPropertiesApi.getFilterProperties(finalTypeId);
                setFilterProperties(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'فشل في جلب خصائص الفلترة');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilterProperties();
    }, [finalTypeId]);

    return { filterProperties, isLoading, error };
};

