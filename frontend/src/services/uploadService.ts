import apiClient from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl?: string;
  filename?: string;
}

class UploadService {
  // Upload image file
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        message: response.data.message,
        imageUrl: response.data.imageUrl,
        filename: response.data.filename
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل في رفع الصورة'
      };
    }
  }

  // Delete uploaded image
  async deleteImage(filename: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/upload/image/${filename}`);
      
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل في حذف الصورة'
      };
    }
  }

  // Get full image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend the API base URL
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${apiBaseUrl.replace('/api', '')}${imagePath}`;
  }
}

export const uploadService = new UploadService();
export default uploadService;
