'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { 
  createOrder as createOrderFirestore,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createPayment as createPaymentFirestore,
  getUserPayments,
  isFirestoreAvailable
} from '@/lib/firebase';

// Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'processing' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus?: 'pending' | 'success' | 'failed';
  shippingInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  transactionId?: string;
  status: PaymentStatus;
  paymentDetails?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderState {
  orders: Order[];
  payments: Payment[];
  currentOrder: Order | null;
  isLoading: boolean;
  
  // Actions
  createOrder: (data: {
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod: string;
    status: OrderStatus;
    shippingInfo?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
  }) => Promise<string>;
  fetchUserOrders: (userId: string) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  createPayment: (data: {
    orderId: string;
    userId: string;
    amount: number;
    method: string;
    transactionId?: string;
    status: PaymentStatus;
    paymentDetails?: Record<string, any>;
  }) => Promise<string>;
  fetchUserPayments: (userId: string) => Promise<void>;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      payments: [],
      currentOrder: null,
      isLoading: false,

      createOrder: async (orderData) => {
        try {
          set({ isLoading: true });
          
          if (!isFirestoreAvailable()) {
            throw new Error('Firestore is not available');
          }

          // Generate order number if not provided
          const orderNumber = `ORD-${Date.now()}`;
          
          const orderId = await createOrderFirestore({
            userId: orderData.userId,
            userEmail: orderData.userEmail,
            userName: orderData.userName,
            orderNumber,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            paymentMethod: orderData.paymentMethod,
            status: (orderData.status === 'processing' || orderData.status === 'cancelled') ? 'pending' : orderData.status,
            paymentStatus: orderData.paymentStatus,
            shippingInfo: orderData.shippingInfo,
            notes: orderData.notes,
          });
          
          const newOrder: Order = {
            ...orderData,
            id: orderId,
            orderNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            orders: [newOrder, ...state.orders],
            currentOrder: newOrder,
            isLoading: false,
          }));

          toast.success('Order created successfully!');
          return orderId;
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Failed to create order';
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchUserOrders: async (userId) => {
        try {
          set({ isLoading: true });
          
          if (!isFirestoreAvailable()) {
            console.log('Firestore not available, using demo mode');
            set({ isLoading: false });
            return;
          }

          const orders = await getUserOrders(userId) as Order[];
          set({ orders, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to fetch orders:', error);
        }
      },

      fetchOrderById: async (orderId) => {
        try {
          set({ isLoading: true });
          
          if (!isFirestoreAvailable()) {
            set({ isLoading: false });
            return null;
          }

          const order = await getOrderById(orderId) as Order | null;
          set({ currentOrder: order, isLoading: false });
          return order;
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to fetch order:', error);
          return null;
        }
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          if (!isFirestoreAvailable()) {
            throw new Error('Firestore not available');
          }

          await updateOrderStatus(orderId, status);
          
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId
                ? { ...order, status, updatedAt: new Date() }
                : order
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? { ...state.currentOrder, status, updatedAt: new Date() }
                : state.currentOrder,
          }));

          toast.success(`Order status updated to ${status}`);
        } catch (error: any) {
          console.error('Failed to update order status:', error);
        }
      },

      createPayment: async (paymentData) => {
        try {
          set({ isLoading: true });
          
          if (!isFirestoreAvailable()) {
            throw new Error('Firestore is not available');
          }

          const paymentId = await createPaymentFirestore(paymentData);
          
          const newPayment: Payment = {
            ...paymentData,
            id: paymentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            payments: [newPayment, ...state.payments],
            isLoading: false,
          }));

          toast.success('Payment recorded successfully!');
          return paymentId;
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.message || 'Failed to record payment';
          toast.error(errorMessage);
          throw error;
        }
      },

      fetchUserPayments: async (userId) => {
        try {
          set({ isLoading: true });
          
          if (!isFirestoreAvailable()) {
            console.log('Firestore not available, using demo mode');
            set({ isLoading: false });
            return;
          }

          const payments = await getUserPayments(userId) as Payment[];
          set({ payments, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          console.error('Failed to fetch payments:', error);
        }
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
        payments: state.payments,
      }),
    }
  )
);

