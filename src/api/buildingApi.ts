import { Building, CreateBuilding, UpdateBuilding } from "@/lib/types";
import apiClient from ".";

export interface BuildingResponse {
  success: boolean;
  data: Building | Building[];
  message: string;
}

export const buildingApi = {
  fetchBuildings: async (): Promise<Building[]> => {
    try {
      const response = await apiClient.get<BuildingResponse>('/api/buildings');
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch buildings:", error);
      throw error;
    }
  },
  
  fetchBuildingById: async (id: string | number): Promise<Building> => {
    try {
      const response = await apiClient.get<BuildingResponse>(`/api/buildings/${id}`);
      return response.data.data as Building;
    } catch (error) {
      console.error("Failed to fetch building:", error);
      throw error;
    }
  },

  fetchBuildingsByCompany: async (companyId: string | number): Promise<Building[]> => {
    try {
      const response = await apiClient.get<BuildingResponse>(`/api/buildings/company/${companyId}`);
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch buildings by company:", error);
      throw error;
    }
  },

  createBuilding: async (building: CreateBuilding): Promise<Building> => {
    try {
      const response = await apiClient.post<BuildingResponse>('/api/buildings', building);
      return response.data.data as Building;
    } catch (error) {
      console.error("Failed to create building:", error);
      throw error;
    }
  },

  updateBuilding: async (id: string | number, building: UpdateBuilding): Promise<Building> => {
    try {
      const response = await apiClient.put<BuildingResponse>(`/api/buildings/${id}`, building);
      return response.data.data as Building;
    } catch (error) {
      console.error("Failed to update building:", error);
      throw error;
    }
  },

  deleteBuilding: async (id: string | number): Promise<void> => {
    try {
      await apiClient.delete(`/api/buildings/${id}`);
    } catch (error) {
      console.error("Failed to delete building:", error);
      throw error;
    }
  }
};
