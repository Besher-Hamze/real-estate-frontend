import { ApiDynamicProperty, ApiPropertyGroup, GroupedProperties } from "@/lib/types";
import apiClient from ".";

export const DynamicPropertiesApi = {
    /**
     * جلب جميع الخصائص
     */
    fetchAllProperties: async (): Promise<ApiDynamicProperty[]> => {
        try {
            const response = await apiClient.get<ApiDynamicProperty[]>('/api/properties');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch all properties:", error);
            throw error;
        }
    },

    /**
     * جلب الخصائص الديناميكية بناءً على finalTypeId
     */
    fetchPropertiesByFinalType: async (finalTypeId: number): Promise<ApiDynamicProperty[]> => {
        try {
            const response = await apiClient.get<ApiDynamicProperty[]>(`/api/properties/final-type/${finalTypeId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch dynamic properties:", error);
            throw error;
        }
    },

    /**
     * جلب الخصائص التي تستخدم في الفلترة فقط
     */
    fetchFilterProperties: async (finalTypeId?: number): Promise<ApiDynamicProperty[]> => {
        try {
            const url = finalTypeId
                ? `/api/properties/filters?finalTypeId=${finalTypeId}`
                : '/api/properties/filters';
            const response = await apiClient.get<ApiDynamicProperty[]>(url);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch filter properties:", error);
            throw error;
        }
    },

    /**
     * جلب مجموعات الخصائص
     */
    fetchPropertyGroups: async (finalTypeId: number): Promise<ApiPropertyGroup[]> => {
        try {
            const response = await apiClient.get<ApiPropertyGroup[]>(`/api/properties/groups/${finalTypeId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch property groups:", error);
            throw error;
        }
    },

    /**
     * جلب خاصية واحدة بالتفصيل
     */
    fetchPropertyById: async (propertyId: number): Promise<ApiDynamicProperty> => {
        try {
            const response = await apiClient.get<ApiDynamicProperty>(`/api/properties/${propertyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch property by ID:", error);
            throw error;
        }
    },

    /**
     * تجميع الخصائص حسب المجموعات
     */
    groupPropertiesByGroup: (properties: ApiDynamicProperty[]): GroupedProperties => {
        const grouped: GroupedProperties = {};

        properties.forEach(property => {
            const groupName = property.groupName || 'عام';
            if (!grouped[groupName]) {
                grouped[groupName] = [];
            }
            grouped[groupName].push(property);
        });

        // ترتيب الخصائص داخل كل مجموعة حسب displayOrder
        Object.keys(grouped).forEach(groupName => {
            grouped[groupName].sort((a, b) => a.displayOrder - b.displayOrder);
        });

        return grouped;
    },

    /**
     * جلب الخصائص مجمعة حسب المجموعات
     */
    fetchGroupedPropertiesByFinalType: async (finalTypeId: number): Promise<GroupedProperties> => {
        try {
            const properties = await DynamicPropertiesApi.fetchPropertiesByFinalType(finalTypeId);
            return DynamicPropertiesApi.groupPropertiesByGroup(properties);
        } catch (error) {
            console.error("Failed to fetch grouped properties:", error);
            throw error;
        }
    },

    /**
     * إنشاء خاصية جديدة
     */
    createProperty: async (propertyData: Partial<ApiDynamicProperty>) => {
        try {
            const response = await apiClient.post('/api/properties', propertyData);
            return response.data;
        } catch (error) {
            console.error("Failed to create property:", error);
            throw error;
        }
    },

    /**
     * تحديث خاصية موجودة
     */
    updateProperty: async (propertyId: number, propertyData: Partial<ApiDynamicProperty>) => {
        try {
            const response = await apiClient.put(`/api/properties/${propertyId}`, propertyData);
            return response.data;
        } catch (error) {
            console.error("Failed to update property:", error);
            throw error;
        }
    },

    /**
     * حذف خاصية
     */
    deleteProperty: async (propertyId: number) => {
        try {
            const response = await apiClient.delete(`/api/properties/${propertyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete property:", error);
            throw error;
        }
    },

    /**
     * إنشاء عدة خصائص دفعة واحدة
     */
    bulkCreateProperties: async (finalTypeId: number, properties: Partial<ApiDynamicProperty>[]) => {
        try {
            const response = await apiClient.post('/api/properties/bulk', {
                finalTypeId,
                properties
            });
            return response.data;
        } catch (error) {
            console.error("Failed to bulk create properties:", error);
            throw error;
        }
    },

    // ========== APIs للملفات ==========

    /**
     * رفع ملف لخاصية معينة
     */
    uploadPropertyFile: async (realEstateId: number, propertyId: number, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post(
                `/api/properties/files/${realEstateId}/${propertyId}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to upload property file:", error);
            throw error;
        }
    },

    /**
     * جلب معلومات ملف خاصية
     */
    getPropertyFileInfo: async (realEstateId: number, propertyId: number) => {
        try {
            const response = await apiClient.get(`/api/properties/files/${realEstateId}/${propertyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to get property file info:", error);
            throw error;
        }
    },

    /**
     * تحديث ملف خاصية
     */
    updatePropertyFile: async (realEstateId: number, propertyId: number, file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.put(
                `/api/properties/files/${realEstateId}/${propertyId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to update property file:", error);
            throw error;
        }
    },

    /**
     * حذف ملف خاصية
     */
    deletePropertyFile: async (realEstateId: number, propertyId: number) => {
        try {
            const response = await apiClient.delete(`/api/properties/files/${realEstateId}/${propertyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete property file:", error);
            throw error;
        }
    },

    /**
     * جلب جميع ملفات الخصائص لعقار معين
     */
    getAllPropertyFiles: async (realEstateId: number) => {
        try {
            const response = await apiClient.get(`/api/properties/files/${realEstateId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to get all property files:", error);
            throw error;
        }
    }
};
