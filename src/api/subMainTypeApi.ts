import { CreateSubTypeForm } from "@/lib/types/create";
import { SubType } from "@/lib/types";
import apiClient from ".";
import { UpdateSubTypeForm } from "@/lib/types/update";



export const subMainTypeApi = {
    fetchSubMainType: async (): Promise<SubType[]> => {
        try {
            const response = await apiClient.get<SubType[]>('api/subtypes');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addSubMainType: async (mainType: CreateSubTypeForm) => {
        try {
            const response = await apiClient.post('api/subtypes', mainType);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    updateSubMainType: async (id: number, mainType: UpdateSubTypeForm) => {
        try {
            const response = await apiClient.put(`api/subtypes/${id}`, mainType);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteSubMainType: async (id: number) => {
        try {
            const response = await apiClient.delete(`api/subtypes/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }

}