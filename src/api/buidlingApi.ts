import { Building, CreateBuilding, UpdateBuilding } from "@/lib/types";
import apiClient from ".";

export const buildingApi = {
    fetchBuildings: async (): Promise<Building[]> => {
        try {
            const response = await apiClient.get<any[]>('api/buildings');            
            return response.data;
        } catch (error) {
            console.error("Failed to fetch buildings:", error);
            throw error;
        }
    },

    fetchBuildingById: async (id: string): Promise<Building> => {
        try {
            const response = await apiClient.get<Building>(`api/buildings/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch building:", error);
            throw error;
        }
    },

    createBuilding: async (building: CreateBuilding): Promise<Building> => {
        try {
            console.log(building);

            const response = await apiClient.post<Building>('api/buildings', building);
            return response.data;
        } catch (error) {
            console.error("Failed to create building:", error);
            throw error;
        }
    },

    updateBuilding: async (id: string, building: UpdateBuilding): Promise<Building> => {
        try {
            const updateData: UpdateBuilding = {
                title: building.title,
                status: building.status,
                location: building.location
            };
            const response = await apiClient.put(`api/buildings/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error("Failed to update building:", error);
            throw error;
        }
    },

    deleteBuilding: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`api/buildings/${id}`);
        } catch (error) {
            console.error("Failed to delete building:", error);
            throw error;
        }
    }
};
