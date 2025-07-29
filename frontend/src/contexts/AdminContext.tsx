import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminService } from '../services/adminService';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check admin status on mount
    const adminStatus = adminService.isAdmin();
    setIsAdmin(adminStatus);
    setIsLoading(false);
  }, []);

  const login = async (code: string) => {
    setIsLoading(true);
    try {
      const result = await adminService.verifyAdmin(code);
      if (result.success) {
        adminService.setAdminStatus(true);
        setIsAdmin(true);
      }
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: 'حدث خطأ في الاتصال'
      };
    }
  };

  const logout = () => {
    adminService.logout();
    setIsAdmin(false);
  };

  const value: AdminContextType = {
    isAdmin,
    isLoading,
    login,
    logout
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
