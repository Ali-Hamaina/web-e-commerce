import apiClient from './api';

export interface WhatsAppOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerInfo: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
  };
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  whatsappData: {
    message: string;
    phoneNumber: string;
    totalAmount: number;
    itemCount: number;
  };
}

class WhatsAppService {
  /**
   * Generate WhatsApp message for order
   */
  async generateOrderMessage(orderData: WhatsAppOrderData): Promise<WhatsAppResponse> {
    try {
      const response = await apiClient.post('/whatsapp/order', orderData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate WhatsApp message');
    }
  }

  /**
   * Open WhatsApp with the generated message
   */
  openWhatsApp(phoneNumber: string, message: string): boolean {
    try {
      // Ensure phone number is properly formatted (remove + if present)
      const cleanPhoneNumber = phoneNumber.replace(/\+/g, '');
      
      // Encode message for URL - preserve line breaks and special characters
      const encodedMessage = encodeURIComponent(message);
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
      
      console.log('Opening WhatsApp URL:', whatsappUrl); // Debug log
      
      // Detect if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, directly navigate to WhatsApp
        window.location.href = whatsappUrl;
        return true;
      } else {
        // On desktop, try to open in new window/tab
        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (whatsappWindow) {
          // Successfully opened
          return true;
        } else {
          // Popup blocked - try direct navigation
          window.location.href = whatsappUrl;
          return true;
        }
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      return false;
    }
  }

  /**
   * Copy message to clipboard as fallback
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Format phone number for WhatsApp (remove spaces, handle +212 format)
   */
  formatPhoneNumber(phone: string): string {
    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Handle different formats
    if (cleanPhone.startsWith('+212')) {
      return cleanPhone.substring(1); // Remove +
    } else if (cleanPhone.startsWith('212')) {
      return cleanPhone; // Already correct
    } else if (cleanPhone.startsWith('0')) {
      return '212' + cleanPhone.substring(1); // Replace 0 with 212
    }
    
    return '212' + cleanPhone; // Default prepend 212
  }
}

export const whatsappService = new WhatsAppService();
