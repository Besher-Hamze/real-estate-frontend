import apiClient from ".";

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logoImage: string;
  logoImageUrl: string;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  managerFullName: string;
  managerEmail: string;
  managerPhone: string;
  logoImage?: File;
}

export interface UpdateCompanyRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoImage?: File;
}

export interface CompanyResponse {
  success: boolean;
  data: Company | Company[];
  message: string;
}

export const companiesApi = {
  getAllCompanies: async (): Promise<Company[]> => {
    try {
      const response = await apiClient.get<CompanyResponse>('/api/companies');
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch all companies:", error);
      throw error;
    }
  },

  getCompanyById: async (id: number, includeManager: boolean = false): Promise<Company> => {
    try {
      const queryParams = includeManager ? '?includeManager=true' : '';
      const response = await apiClient.get<CompanyResponse>(`/api/companies/${id}${queryParams}`);
      return response.data.data as Company;
    } catch (error) {
      console.error(`Failed to fetch company with id ${id}:`, error);
      throw error;
    }
  },

  createCompany: async (companyData: CreateCompanyRequest): Promise<Company> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(companyData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post<CompanyResponse>('/api/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as Company;
    } catch (error) {
      console.error("Failed to create company:", error);
      throw error;
    }
  },

  updateCompany: async (id: number, companyData: UpdateCompanyRequest): Promise<Company> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(companyData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.put<CompanyResponse>(`/api/companies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as Company;
    } catch (error) {
      console.error(`Failed to update company with id ${id}:`, error);
      throw error;
    }
  },

  deleteCompany: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/companies/${id}`);
    } catch (error) {
      console.error(`Failed to delete company with id ${id}:`, error);
      throw error;
    }
  }
};
