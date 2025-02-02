import { CreateMainTypeForm } from "@/lib/types/create";
import { MainType } from "@/lib/types";
import apiClient from ".";
import { UpdateMainTypeForm } from "@/lib/types/update";
import axios from "axios";



export const mainTypeApi = {
    fetchMainType: async (): Promise<MainType[]> => {
        try {
            const response = await apiClient.get<MainType[]>('api/maintypes');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addMainType: async (formData: FormData) => {
        try {
            const response = await axios.post('api/maintypes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });            
            return response.data;
        } catch (error) {
            console.error("Failed to add Main Type:", error);
            throw error;
        }
    },
    updateMainType: async (id: number, mainType: UpdateMainTypeForm) => {
        try {
            const response = await apiClient.put(`api/maintypes/${id}`, mainType);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteMainType: async (id: number) => {
        try {
            const response = await apiClient.delete(`api/maintypes/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }

}