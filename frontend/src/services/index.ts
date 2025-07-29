import apiClient from './api';
import { Product, Order, CustomerInfo, CartItem } from '../types';

export const productService = {
  // Get all products with filtering and pagination
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    inStock?: boolean;
  }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products/featured/list');
    return response.data;
  },

  // Create product (Admin only)
  createProduct: async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export const orderService = {
  // Create new order
  createOrder: async (orderData: {
    customerInfo: CustomerInfo;
    items: CartItem[];
    totalAmount: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Get all orders (Admin only)
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status (Admin only)
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

export const authService = {
  // Verify admin code
  verifyAdmin: async (code: string) => {
    const response = await apiClient.post('/auth/verify-admin', { code });
    return response.data;
  },
};
