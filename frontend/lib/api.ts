import { User, AuthTokens, ApiResponse } from '@/types';

// API Base URL - Change this to your Node.js backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to get Firebase ID token
async function getAuthHeaders(): Promise<Record<string, string>> {
  // Check if we're in browser
  if (typeof window === 'undefined') {
    return {};
  }
  
  const token = localStorage.getItem('firebaseToken');
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: data,
        },
        message: data.message || 'An error occurred',
      };
    }

    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// API functions
export const apiClient = {
  // Auth
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await fetchApi<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response;
    },

    register: async (data: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      password: string;
    }): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await fetchApi<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },

    logout: async (): Promise<ApiResponse> => {
      const response = await fetchApi('/auth/logout', {
        method: 'POST',
      });
      return response;
    },

    me: async (): Promise<ApiResponse<User>> => {
      const response = await fetchApi<User>('/auth/me');
      return response;
    },

    updateProfile: async (data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatar?: string;
    }): Promise<ApiResponse<User>> => {
      const response = await fetchApi<User>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response;
    },

    resetPassword: async (email: string): Promise<ApiResponse> => {
      const response = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    },
  },

  // Products
  products: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      categoryId?: string;
      search?: string;
      featured?: boolean;
    }): Promise<ApiResponse<{ products: any[]; pagination: any }>> => {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const query = queryParams.toString();
      const endpoint = `/products${query ? `?${query}` : ''}`;
      
      return fetchApi(endpoint);
    },

    getById: async (id: string): Promise<ApiResponse<{ product: any }>> => {
      return fetchApi(`/products/${id}`);
    },

    getByCategory: async (slug: string, params?: any): Promise<ApiResponse<any>> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return fetchApi(`/products/category/${slug}${query ? `?${query}` : ''}`);
    },

    getFeatured: async (): Promise<ApiResponse<{ products: any[] }>> => {
      return fetchApi('/products/featured');
    },

    // Admin
    create: async (data: any): Promise<ApiResponse<{ id: string }>> => {
      return fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any): Promise<ApiResponse> => {
      return fetchApi(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<ApiResponse> => {
      return fetchApi(`/products/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Categories
  categories: {
    getAll: async (): Promise<ApiResponse<{ categories: any[] }>> => {
      return fetchApi('/categories');
    },

    getById: async (id: string): Promise<ApiResponse<{ category: any }>> => {
      return fetchApi(`/categories/${id}`);
    },

    // Admin
    create: async (data: any): Promise<ApiResponse<{ id: string }>> => {
      return fetchApi('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: any): Promise<ApiResponse> => {
      return fetchApi(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string): Promise<ApiResponse> => {
      return fetchApi(`/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Cart
  cart: {
    get: async (): Promise<ApiResponse<any>> => {
      return fetchApi('/cart');
    },

    add: async (data: {
      productId: string;
      denominationId: string;
      gameUid: string;
      quantity?: number;
      server?: string;
      playerId?: string;
    }): Promise<ApiResponse> => {
      return fetchApi('/cart', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { quantity: number }): Promise<ApiResponse> => {
      return fetchApi(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    remove: async (id: string): Promise<ApiResponse> => {
      return fetchApi(`/cart/${id}`, {
        method: 'DELETE',
      });
    },

    clear: async (): Promise<ApiResponse> => {
      return fetchApi('/cart', {
        method: 'DELETE',
      });
    },
  },

  // Orders
  orders: {
    create: async (data: {
      billingInfo: {
        fullName: string;
        email: string;
        phone: string;
      };
      paymentMethod: 'CARD' | 'BKASH' | 'NAGAD';
      items: any[];
      notes?: string;
    }): Promise<ApiResponse<{ order: any }>> => {
      return fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    createGuestOrder: async (data: {
      billingInfo: {
        fullName: string;
        email: string;
        phone: string;
      };
      paymentMethod: 'CARD' | 'BKASH' | 'NAGAD';
      items: any[];
      notes?: string;
    }): Promise<ApiResponse<{ order: any }>> => {
      return fetchApi('/orders/guest', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getUserOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ orders: any[]; pagination: any }>> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return fetchApi(`/orders${query ? `?${query}` : ''}`);
    },

    getById: async (id: string): Promise<ApiResponse<{ order: any }>> => {
      return fetchApi(`/orders/${id}`);
    },

    getByOrderNumber: async (orderNumber: string): Promise<ApiResponse<{ order: any }>> => {
      return fetchApi(`/orders/number/${orderNumber}`);
    },
  },

  // Payments
  payments: {
    submitManual: async (data: {
      orderId: string;
      paymentMethod: 'BKASH' | 'NAGAD';
      senderNumber: string;
      transactionId: string;
      amount: number;
      senderName?: string;
    }): Promise<ApiResponse<{ payment: any }>> => {
      return fetchApi('/payments/manual', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    initiateCard: async (data: {
      orderId: string;
    }): Promise<ApiResponse> => {
      return fetchApi('/payments/card', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getStatus: async (orderId: string): Promise<ApiResponse<any>> => {
      return fetchApi(`/payments/order/${orderId}`);
    },
  },

  // Admin
  admin: {
    getDashboard: async (): Promise<ApiResponse<{ stats: any; recentOrders: any[]; topProducts: any[] }>> => {
      return fetchApi('/admin/dashboard');
    },

    getOrders: async (params?: { page?: number; limit?: number; status?: string; paymentStatus?: string }): Promise<ApiResponse<{ orders: any[]; pagination: any }>> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return fetchApi(`/admin/orders${query ? `?${query}` : ''}`);
    },

    updateOrder: async (id: string, data: { status?: string; paymentStatus?: string; notes?: string }): Promise<ApiResponse> => {
      return fetchApi(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    completeOrder: async (id: string): Promise<ApiResponse> => {
      return fetchApi(`/admin/orders/${id}/complete`, {
        method: 'POST',
      });
    },

    cancelOrder: async (id: string, reason?: string): Promise<ApiResponse> => {
      return fetchApi(`/admin/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },

    getUsers: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ users: any[]; pagination: any }>> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return fetchApi(`/admin/users${query ? `?${query}` : ''}`);
    },

    updateUserRole: async (id: string, role: string): Promise<ApiResponse> => {
      return fetchApi(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },

    getProducts: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<{ products: any[]; pagination: any }>> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value));
          }
        });
      }
      const query = queryParams.toString();
      return fetchApi(`/admin/products${query ? `?${query}` : ''}`);
    },
  },
};

export default apiClient;

