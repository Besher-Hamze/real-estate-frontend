import apiClient from ".";

export interface Tenant {
  id: number;
  userId: number;
  tenantType: 'partnership' | 'commercial_register' | 'person' | 'embassy' | 'foreign_company' | 'government' | 'inheritance' | 'civil_registry';
  businessActivities: string | null;
  contactPerson: string | null;
  contactPosition: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    whatsappNumber: string;
    idNumber: string;
    identityImageFrontUrl: string;
    identityImageBackUrl: string;
    commercialRegisterImageUrl: string;
  };
}

export interface CreateTenantRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  idNumber: string;
  tenantType: Tenant['tenantType'];
  businessActivities?: string;
  contactPerson?: string;
  contactPosition?: string;
  notes?: string;
  identityImageFront?: File;
  identityImageBack?: File;
  commercialRegisterImage?: File;
}

export interface UpdateTenantRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  idNumber?: string;
  tenantType?: Tenant['tenantType'];
  businessActivities?: string;
  contactPerson?: string;
  contactPosition?: string;
  notes?: string;
  identityImageFront?: File;
  identityImageBack?: File;
  commercialRegisterImage?: File;
}

export interface TenantResponse {
  success: boolean;
  data: Tenant | Tenant[];
  message: string;
}

export const tenantsApi = {
  getAllTenants: async (): Promise<Tenant[]> => {
    try {
      const response = await apiClient.get<TenantResponse>('/api/tenants');
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch all tenants:", error);
      throw error;
    }
  },

  getTenantById: async (id: number): Promise<Tenant> => {
    try {
      const response = await apiClient.get<TenantResponse>(`/api/tenants/${id}`);
      return response.data.data as Tenant;
    } catch (error) {
      console.error(`Failed to fetch tenant with id ${id}:`, error);
      throw error;
    }
  },

  getTenantByUserId: async (userId: number): Promise<Tenant> => {
    try {
      const response = await apiClient.get<TenantResponse>(`/api/tenants/user/${userId}`);
      return response.data.data as Tenant;
    } catch (error) {
      console.error(`Failed to fetch tenant for user ${userId}:`, error);
      throw error;
    }
  },

  getMyTenantInfo: async (): Promise<Tenant> => {
    try {
      const response = await apiClient.get<TenantResponse>('/api/tenants/my-info');
      return response.data.data as Tenant;
    } catch (error) {
      console.error("Failed to fetch current tenant info:", error);
      throw error;
    }
  },

  createTenant: async (tenantData: CreateTenantRequest): Promise<Tenant> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(tenantData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post<TenantResponse>('/api/tenants', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as Tenant;
    } catch (error) {
      console.error("Failed to create tenant:", error);
      throw error;
    }
  },

  updateTenant: async (id: number, tenantData: UpdateTenantRequest): Promise<Tenant> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(tenantData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put<TenantResponse>(`/api/tenants/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as Tenant;
    } catch (error) {
      console.error(`Failed to update tenant with id ${id}:`, error);
      throw error;
    }
  },

  deleteTenant: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/tenants/${id}`);
    } catch (error) {
      console.error(`Failed to delete tenant with id ${id}:`, error);
      throw error;
    }
  }
};
