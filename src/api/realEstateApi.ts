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
            const formData = new FormData();

            const {
                cityName,
                neighborhoodName,
                mainCategoryName,
                subCategoryName,
                finalTypeName,
                ...cleanedEstate
            } = estate;

            const filteredEstate = { ...cleanedEstate };

            // Handle coverImage - remove if not a File
            if (!(filteredEstate.coverImage instanceof File)) {
                delete filteredEstate.coverImage;
            }

            // Check if there are any File objects in the files array
            const hasFileObjects = filteredEstate.files &&
                Array.isArray(filteredEstate.files) &&
                filteredEstate.files.some((file: any) => file instanceof File);


        

            // Remove files array from filtered estate if no File objects
            if (!hasFileObjects) {
                delete filteredEstate.files;
            }

            // Add all primitive values to the FormData
            Object.entries(filteredEstate).forEach(([key, value]) => {
                // Skip file-related properties that will be handled separately
                if (
                    key !== 'files' &&
                    value !== undefined &&
                    value !== null
                ) {
                    // Convert arrays or objects to strings
                    if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Blob)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value as string | Blob);
                    }
                }
            });

            // Handle additional files - only append if they're File objects (new uploads)
            if (filteredEstate.files && Array.isArray(filteredEstate.files)) {
                filteredEstate.files.forEach((file: any) => {
                    if (file instanceof File) {
                        formData.append('files', file);
                    }
                });
            }

            console.log("FormData keys:");
            for (const key of formData.keys()) {
                console.log(`- ${key}: ${formData.get(key) instanceof File ? 'File object' : formData.get(key)}`);
            }

            const response = await axios.put(`${API_BASE_URL}/api/realestate/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

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



    deleteRealEstate: async (id: number) => {
        try {
            const response = await apiClient.delete(`api/realestate/${id}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete real estate:", error);
            throw error;
        }
    },
};