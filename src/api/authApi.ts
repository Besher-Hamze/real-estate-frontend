// src/api/authApi.ts - نظام المصادقة المحدث
import apiClient from ".";

export type UserRole = 'user' | 'user_vip' | 'admin' | 'company';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  companyName?: string;
  companyLicense?: string;
  vipExpiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  companyLicense?: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  companyName?: string;
  companyLicense?: string;
  vipExpiryDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  userId: number;
  newPassword: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

let currentUser: User | null = null;
let authToken: string | null = null;

export const authApi = {
  // تسجيل الدخول
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

      if (response.data.success) {
        authToken = response.data.data.token;
        currentUser = response.data.data.user;

        // حفظ التوكن في localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'حدث خطأ في تسجيل الدخول');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // تسجيل مستخدم جديد
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);

      if (response.data.success) {
        authToken = response.data.data.token;
        currentUser = response.data.data.user;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'حدث خطأ في إنشاء الحساب');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>('/api/auth/me');
      currentUser = response.data;
      authToken = localStorage.getItem('authToken');

      // تحديث localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      // إذا فشل التحقق من التوكن، قم بتسجيل الخروج
      authApi.logout();
      return null;
    }
  },

  // تسجيل الخروج
  logout: (): void => {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // الحصول على جميع المستخدمين (للأدمن فقط)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<User[]>('/api/auth/users');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'غير مصرح لك بالوصول لهذه البيانات');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // تحديث بيانات المستخدم (للأدمن فقط)
  updateUser: async (userId: number, updateData: UpdateUserRequest): Promise<User> => {
    try {
      const response = await apiClient.put<User>(`/api/auth/users/${userId}`, updateData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'حدث خطأ في تحديث بيانات المستخدم');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // تغيير كلمة المرور
  changePassword: async (passwordData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/api/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'حدث خطأ في تغيير كلمة المرور');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // إعادة تعيين كلمة المرور (للأدمن)
  resetPassword: async (resetData: ResetPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/api/auth/reset-password', resetData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error?.message || 'حدث خطأ في إعادة تعيين كلمة المرور');
      }
      throw new Error('حدث خطأ في الاتصال بالخادم');
    }
  },

  // التحقق من صحة التوكن
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/api/auth/me');
      return true;
    } catch (error) {
      return false;
    }
  },

  // التحقق من الصلاحيات
  hasPermission: (requiredRole: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(currentUser.role);
  },

  // الحصول على الدور الحالي
  getCurrentRole: (): UserRole | null => {
    return currentUser?.role || null;
  },

  // الحصول على المستخدم الحالي من localStorage (للاستخدام المحلي)
  getCurrentUserFromStorage: (): User | null => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
      return null;
    }
  },

  // الحصول على التوكن من localStorage
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  }
};
