// User types
export interface User {
  id: string;
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: Date;
}

// Auth tokens
export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image: string;
  images?: string[];
  categoryId: string;
  category?: Category;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  denominations?: Denomination[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

// Denomination types
export interface Denomination {
  id: string;
  productId: string;
  amount: number;
  price: number;
  discount?: number;
  isActive: boolean;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  product?: {
    name: string;
    image: string;
    slug: string;
  };
  denominationId: string;
  denomination?: {
    id: string;
    amount: number;
    price: number;
    discount?: number;
  };
  quantity: number;
  gameUid?: string;
  server?: string;
  playerId?: string;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Order types
export interface OrderItem {
  id: string;
  productId: string;
  denominationId: string;
  productName: string;
  denominationAmount: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gameUid?: string;
  server?: string;
  playerId?: string;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CARD' | 'BKASH' | 'NAGAD';
  billingInfo: BillingInfo;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'CARD' | 'BKASH' | 'NAGAD';
  transactionId: string;
  senderNumber: string;
  senderName?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
  createdAt?: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

