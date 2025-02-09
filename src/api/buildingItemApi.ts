import apiClient from ".";
import { BuildingItem, CreateBuildingItem, UpdateBuildingItem } from "@/lib/types";

export const buildingItemApi = {
    fetchBuildingItems: async (buildingId: string): Promise<BuildingItem[]> => {
        try {
            const response = await apiClient.get<BuildingItem[]>(`api/buildings/${buildingId}/items`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch building items:", error);
            throw error;
        }
    },

    createBuildingItem: async (item: CreateBuildingItem): Promise<BuildingItem> => {
        try {
            const response = await apiClient.post<BuildingItem>('api/building-items', item);
            return response.data;
        } catch (error) {
            console.error("Failed to create building item:", error);
            throw error;
        }
    },

    updateBuildingItem: async (id: string, item: UpdateBuildingItem): Promise<BuildingItem> => {
        try {
            const response = await apiClient.put<BuildingItem>(`api/building-items/${id}`, item);
            return response.data;
        } catch (error) {
            console.error("Failed to update building item:", error);
            throw error;
        }
    },

    deleteBuildingItem: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`api/building-items/${id}`);
        } catch (error) {
            console.error("Failed to delete building item:", error);
            throw error;
        }
    }
};
