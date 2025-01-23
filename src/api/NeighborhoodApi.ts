import { NeighborhoodType } from "@/lib/types";
import { CreateNeighborhood } from "@/lib/types/create";
import { UpdateNeighborhood } from "@/lib/types/update";
import apiClient from ".";

export const neighborhoodApi = {
    fetchNeighborhood: async (): Promise<NeighborhoodType[]> => {
        try {
            const response = await apiClient.get<NeighborhoodType[]>('api/neighborhoods');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    fetchNeighborhoodByCityId: async (cityId:number): Promise<NeighborhoodType[]> => {
        try {
            const response = await apiClient.get<NeighborhoodType[]>(`api/neighborhoods/${cityId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addNeighborhood: async (createNeighborhood: CreateNeighborhood) => {
        try {
            const response = await apiClient.post('api/neighborhoods', createNeighborhood);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    updagteNeighborhood: async (id:number,createNeighborhood: UpdateNeighborhood) => {
        try {
            const response = await apiClient.put(`api/neighborhoods/${id}`, createNeighborhood);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteNeighborhood: async (id:number) => {
        try {
            const response = await apiClient.delete(`api/neighborhoods/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }
}