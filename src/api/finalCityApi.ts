import { FinalCityType } from "@/lib/types";
import { CreateFinalCity } from "@/lib/types/create";
import { UpdateFinalCity } from "@/lib/types/update";
import apiClient from ".";

export const finalCityApi = {
    fetchFinalCity: async (): Promise<FinalCityType[]> => {
        try {
            const response = await apiClient.get<FinalCityType[]>('api/finalCity');
            
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    fetchFinalCityByNeighborhoodId: async (neighborhoodId:number): Promise<FinalCityType[]> => {
        try {
            const response = await apiClient.get<FinalCityType[]>(`api/finalCity/${neighborhoodId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addFinalCity: async (createFinalCity: CreateFinalCity) => {
        try {
            const response = await apiClient.post('api/finalCity', createFinalCity);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    updagteFinalCity: async (id:number,createFinalCity: UpdateFinalCity) => {
        try {
            const response = await apiClient.put(`api/finalCity/${id}`, createFinalCity);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteFinalCity: async (id:number) => {
        try {
            const response = await apiClient.delete(`api/finalCity/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }
}