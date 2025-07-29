import apiClient from './api';

export interface AdminAuth {
  success: boolean;
  message: string;
}

export const adminService = {
  // Verify admin code
  async verifyAdmin(code: string): Promise<AdminAuth> {
    try {
      const response = await apiClient.post('/auth/verify-admin', { code });
      return {
        success: true,
        message: response.data.message || 'تم التحقق بنجاح'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'كود غير صحيح'
      };
    }
  },

  // Check if user is admin (from localStorage)
  isAdmin(): boolean {
    return localStorage.getItem('isAdmin') === 'true';
  },

  // Set admin status
  setAdminStatus(isAdmin: boolean): void {
    if (isAdmin) {
      localStorage.setItem('isAdmin', 'true');
    } else {
      localStorage.removeItem('isAdmin');
    }
  },

  // Logout admin
  logout(): void {
    localStorage.removeItem('isAdmin');
  }
};
