import { CreateFinalTypeForm } from "@/lib/types/create";
import { FinalType } from "@/lib/types";
import apiClient from ".";
import { UpdateFinalTypeForm } from "@/lib/types/update";



export const finalTypeTypeApi = {
    fetchFinalTypeType: async (): Promise<FinalType[]> => {
        try {
            const response = await apiClient.get<FinalType[]>('api/finaltypes');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    fetchFinalTypeBySubId: async (subId: number): Promise<FinalType[]> => {
        try {
            const response = await apiClient.get<FinalType[]>(`api/finaltypes/${subId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    addFinalTypeType: async (finalType: CreateFinalTypeForm) => {
        try {
            const response = await apiClient.post('api/finaltypes', finalType);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    updateFinalTypeType: async (id: number, finalType: UpdateFinalTypeForm) => {
        try {
            const response = await apiClient.put(`api/finaltypes/${id}`, finalType);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    },
    deleteFinaltypes: async (id: number) => {
        try {
            const response = await apiClient.delete(`api/finaltypes/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Main Types:", error);
            throw error;
        }
    }

}