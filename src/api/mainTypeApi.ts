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
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/maintypes`, formData, {
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
            // Create FormData for the update
            const formData = new FormData();

            // Add name field
            if (mainType.name) {
                formData.append('name', mainType.name);
            }

            // Handle icon as a File or string
            if (mainType.icon) {
                if ((mainType.icon as any) instanceof File) {
                    formData.append('icon', mainType.icon);
                } else if (typeof mainType.icon === 'string') {
                    // If it's a string but not a new upload, just pass the filename
                    formData.append('existingIcon', mainType.icon);
                }
            }

            // Log FormData keys for debugging
            console.log("FormData keys for update:");
            for (const key of formData.keys()) {
                console.log(`- ${key}: ${formData.get(key) instanceof File ? 'File object' : formData.get(key)}`);
            }
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/maintypes/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to update Main Type:", error);
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