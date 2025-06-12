import apiClient from ".";

export interface RealEstateUnit {
  id: number;
  buildingId: number;
  unitNumber: string;
  unitType: 'studio' | 'apartment' | 'shop' | 'office' | 'villa' | 'room';
  unitLayout: 'studio' | '1bhk' | '2bhk' | '3bhk' | '4bhk' | '5bhk' | '6bhk' | '7bhk' | 'other' | null;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  status: 'available' | 'rented' | 'maintenance';
  description: string;
  createdAt: string;
  updatedAt: string;
  building?: {
    id: number;
    name: string;
    buildingNumber: string;
    address: string;
    companyId: number;
  };
}

export interface CreateUnitRequest {
  buildingId: number;
  unitNumber: string;
  unitType: RealEstateUnit['unitType'];
  unitLayout?: RealEstateUnit['unitLayout'];
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  status: RealEstateUnit['status'];
  description: string;
}

export interface UpdateUnitRequest {
  unitNumber?: string;
  unitType?: RealEstateUnit['unitType'];
  unitLayout?: RealEstateUnit['unitLayout'];
  floor?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  status?: RealEstateUnit['status'];
  description?: string;
}

export interface UnitsFilter {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  buildingId?: number;
  companyId?: number;
  unitType?: string;
  unitLayout?: string;
}

export interface UnitResponse {
  success: boolean;
  data: RealEstateUnit | RealEstateUnit[];
  message: string;
}

export const unitsApi = {
  getAllUnits: async (): Promise<RealEstateUnit[]> => {
    try {
      const response = await apiClient.get<UnitResponse>('/api/units');
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch all units:", error);
      throw error;
    }
  },

  getAvailableUnits: async (filters?: UnitsFilter): Promise<RealEstateUnit[]> => {
    try {
      let queryParams = '';
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      const response = await apiClient.get<UnitResponse>(`/api/units/available${queryParams}`);
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error("Failed to fetch available units:", error);
      throw error;
    }
  },

  getUnitById: async (id: number): Promise<RealEstateUnit> => {
    try {
      const response = await apiClient.get<UnitResponse>(`/api/units/${id}`);
      return response.data.data as RealEstateUnit;
    } catch (error) {
      console.error(`Failed to fetch unit with id ${id}:`, error);
      throw error;
    }
  },

  getUnitsByBuildingId: async (buildingId: number): Promise<RealEstateUnit[]> => {
    try {
      const response = await apiClient.get<UnitResponse>(`/api/units/building/${buildingId}`);
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } catch (error) {
      console.error(`Failed to fetch units for building ${buildingId}:`, error);
      throw error;
    }
  },

  createUnit: async (unitData: CreateUnitRequest): Promise<RealEstateUnit> => {
    try {
      const response = await apiClient.post<UnitResponse>('/api/units', unitData);
      return response.data.data as RealEstateUnit;
    } catch (error) {
      console.error("Failed to create unit:", error);
      throw error;
    }
  },

  updateUnit: async (id: number, unitData: UpdateUnitRequest): Promise<RealEstateUnit> => {
    try {
      const response = await apiClient.put<UnitResponse>(`/api/units/${id}`, unitData);
      return response.data.data as RealEstateUnit;
    } catch (error) {
      console.error(`Failed to update unit with id ${id}:`, error);
      throw error;
    }
  },

  deleteUnit: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/units/${id}`);
    } catch (error) {
      console.error(`Failed to delete unit with id ${id}:`, error);
      throw error;
    }
  }
};
