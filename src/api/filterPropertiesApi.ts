// api/filterPropertiesApi.ts
import { FilterProperty } from '@/lib/types/filterProperties';
import apiClient from './index';

// Interface for the groups endpoint response
export interface PropertyGroupCount {
    _count: {
        groupName: number;
    };
    groupName: string;
}

// Interface for group summary with proper names
export interface GroupSummary {
    groupName: string;
    displayName: string;
    count: number;
}

export const FilterPropertiesApi = {
    /**
     * Get filter properties for a specific final type
     * GET /api/properties/filters?finalTypeId={finalTypeId}
     * Returns array of properties that we'll group in the component
     */
    getFilterProperties: async (finalTypeId: number): Promise<FilterProperty[]> => {
        try {
            const response = await apiClient.get<FilterProperty[]>(
                `/api/properties/filters?finalTypeId=${finalTypeId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch filter properties:', error);
            throw error;
        }
    },

    /**
     * Get property groups with counts for a specific final type
     * GET /api/properties/groups/{finalTypeId}
     * Returns group names and their property counts
     */
    getPropertyGroups: async (finalTypeId: number): Promise<PropertyGroupCount[]> => {
        try {
            const response = await apiClient.get<PropertyGroupCount[]>(
                `/api/properties/groups/${finalTypeId}`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to fetch property groups:', error);
            throw error;
        }
    },

    /**
     * Get group summaries with proper display names
     * Combines the groups endpoint data with better naming
     */
    getGroupSummaries: async (finalTypeId: number): Promise<GroupSummary[]> => {
        try {
            const groups = await FilterPropertiesApi.getPropertyGroups(finalTypeId);

            return groups.map(group => ({
                groupName: group.groupName,
                displayName: group.groupName && group.groupName.trim() !== ''
                    ? group.groupName
                    : 'خصائص أساسية',
                count: group._count.groupName
            }));
        } catch (error) {
            console.error('Failed to fetch group summaries:', error);
            throw error;
        }
    },

    /**
     * Get properties with group preview (combines both endpoints)
     * First gets groups to show summary, then gets full properties when needed
     */
    getPropertiesWithGroupPreview: async (finalTypeId: number) => {
        try {
            const [groups, properties] = await Promise.all([
                FilterPropertiesApi.getPropertyGroups(finalTypeId),
                FilterPropertiesApi.getFilterProperties(finalTypeId)
            ]);

            // Create group summaries
            const groupSummaries = groups.map(group => ({
                groupName: group.groupName,
                displayName: group.groupName && group.groupName.trim() !== ''
                    ? group.groupName
                    : 'خصائص أساسية',
                count: group._count.groupName
            }));

            // Group the actual properties
            const groupedProperties = properties.reduce((groups: Record<string, FilterProperty[]>, property) => {
                const groupName = property.groupName && property.groupName.trim() !== ''
                    ? property.groupName
                    : 'خصائص أساسية';

                if (!groups[groupName]) {
                    groups[groupName] = [];
                }

                groups[groupName].push(property);
                return groups;
            }, {});

            return {
                groupSummaries,
                groupedProperties,
                totalProperties: properties.length,
                filterableProperties: properties.filter(p => p.isFilter).length
            };
        } catch (error) {
            console.error('Failed to fetch properties with group preview:', error);
            throw error;
        }
    }
};

// React Hook for using filter properties with both endpoints
import { useState, useEffect } from 'react';
import { FilterGroup } from '@/lib/types/filterProperties';

export const useFilterPropertiesWithGroups = (finalTypeId: number | null) => {
    const [filterProperties, setFilterProperties] = useState<FilterProperty[]>([]);
    const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
    const [groupSummaries, setGroupSummaries] = useState<GroupSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!finalTypeId) {
            setFilterProperties([]);
            setFilterGroups([]);
            setGroupSummaries([]);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Get both groups and properties
                const result = await FilterPropertiesApi.getPropertiesWithGroupPreview(finalTypeId);

                setFilterProperties(Object.values(result.groupedProperties).flat());
                setGroupSummaries(result.groupSummaries);

                // Convert grouped properties to FilterGroup format
                const filterGroups: FilterGroup[] = Object.entries(result.groupedProperties).map(([groupName, properties]) => ({
                    groupName,
                    displayOrder: Math.min(...properties.map(p => p.displayOrder)),
                    properties: properties.sort((a, b) => a.displayOrder - b.displayOrder)
                })).sort((a, b) => a.displayOrder - b.displayOrder);

                setFilterGroups(filterGroups);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'فشل في جلب خصائص الفلترة');
                setFilterProperties([]);
                setFilterGroups([]);
                setGroupSummaries([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [finalTypeId]);

    return {
        filterProperties,
        filterGroups,
        groupSummaries,
        isLoading,
        error
    };
};

// Lightweight hook for just getting group counts (useful for overview)
export const usePropertyGroupCounts = (finalTypeId: number | null) => {
    const [groupCounts, setGroupCounts] = useState<GroupSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!finalTypeId) {
            setGroupCounts([]);
            return;
        }

        const fetchGroupCounts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const summaries = await FilterPropertiesApi.getGroupSummaries(finalTypeId);
                setGroupCounts(summaries);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'فشل في جلب ملخص المجموعات');
                setGroupCounts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupCounts();
    }, [finalTypeId]);

    return { groupCounts, isLoading, error };
};

export default FilterPropertiesApi;