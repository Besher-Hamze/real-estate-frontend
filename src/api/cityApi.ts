import { CityType } from "@/lib/types";
import { CreateCity } from "@/lib/types/create";
import { UpdateCity } from "@/lib/types/update";

import apiClient from ".";

export const cityApi = {
    fetchCity: async (): Promise<CityType[]> => {
        try {
            const response = await apiClient.get<CityType[]>('api/cities');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addCity: async (city: CreateCity) => {
        try {
            const response = await apiClient.post('api/cities', city);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    updateCity: async (id:number,city: UpdateCity) => {
        try {
            const response = await apiClient.put(`api/cities/${id}`, city,);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteCity: async (id:number) => {
        try {
            const response = await apiClient.delete(`api/cities/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }
}