import apiClient from ".";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      fullName: string;
      email: string;
      role: 'admin' | 'manager' | 'tenant';
    };
  };
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetManagerPasswordRequest {
  managerId: number;
  newPassword: string;
}

export interface RegisterUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      if (response.data && response.data.data && response.data.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.data.token);
        // Set default header for future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  },

  registerAdmin: async (userData: RegisterUserRequest) => {
    try {
      const response = await apiClient.post('/api/auth/admin/register', userData);
      return response.data;
    } catch (error) {
      console.error("Failed to register admin:", error);
      throw error;
    }
  },

  registerManager: async (userData: RegisterUserRequest) => {
    try {
      const response = await apiClient.post('/api/auth/manager/register', userData);
      return response.data;
    } catch (error) {
      console.error("Failed to register manager:", error);
      throw error;
    }
  },

  changePassword: async (passwordData: ChangePasswordRequest) => {
    try {
      const response = await apiClient.post('/api/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  },

  resetManagerPassword: async (resetData: ResetManagerPasswordRequest) => {
    try {
      const response = await apiClient.post('/api/auth/reset-manager-password', resetData);
      return response.data;
    } catch (error) {
      console.error("Failed to reset manager password:", error);
      throw error;
    }
  }
};
