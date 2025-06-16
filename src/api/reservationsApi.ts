import { RealEstateData } from "@/lib/types";
import axios from "axios";
import apiClient from ".";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const RealEstateApi = {
  fetchRealEstate: async (): Promise<RealEstateData[]> => {
    try {
      const response = await apiClient.get<RealEstateData[]>('api/realestate');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch real estate:", error);
      throw error;
    }
  },

  addRealEstate: async (estate: FormData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/realestate`, estate, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to add real estate:", error);
      throw error;
    }
  },
  updateRealEstate: async (id: number, estate: any) => {
    try {

      const {
        cityName,
        neighborhoodName,
        mainCategoryName,
        subCategoryName,
        finalTypeName,
        finalCityName,
        ...cleanedEstate
      } = estate;

      const filteredEstate = { ...cleanedEstate };




      const response = await apiClient.put(`${API_BASE_URL}/api/realestate/${id}`, filteredEstate);

      return response.data;
    } catch (error) {
      console.error("Failed to update real estate:", error);
      throw error;
    }
  },

  fetchRealEstateById: async (id: number): Promise<RealEstateData> => {
    try {
      const response = await apiClient.get<RealEstateData>(`api/realestate/${id}`);

      return response.data;
    } catch (error) {
      console.error("Failed to fetch real estate by ID:", error);
      throw error;
    }
  },


  fetchSimilarRealEstate: async (id: number): Promise<RealEstateData[]> => {
    try {
      const response = await apiClient.get<RealEstateData[]>(`/api/realestate/similar/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch similar real estate:", error);
      return [];
    }
  },


  fetchRealEstateByBuildingItemId: async (buildingItemId: string): Promise<RealEstateData[]> => {
    try {

      const response = await apiClient.get<RealEstateData[]>(`api/realestate/items/${buildingItemId}`);
      if ((response.data as any).message) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch real estate by ID:", error);
      throw error;
    }
  },

  fetchRealEstateByBuildingId: async (buildingItemId: string): Promise<RealEstateData[]> => {
    try {

      const response = await apiClient.get<RealEstateData[]>(`api/realestate/items/${buildingItemId}`);
      if ((response.data as any).message) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Failed to fetch real estate by ID:", error);
      throw error;
    }
  },


  deleteRealEstate: async (id: number) => {
    try {
      const response = await apiClient.delete(`api/realestate/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete real estate:", error);
      throw error;
    }
  },

  fetchFilter: async (mainTypName: string, subTypeName?: string, finalTypeName?: string) => {
    try {
      const response = await apiClient.post(`api/realestate/filter`, {
        main: mainTypName,
        sub: subTypeName,
        finall: finalTypeName,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch filter ");
      console.log(error);

      throw error;
    }
  },
};