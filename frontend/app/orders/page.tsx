'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { getUserOrders, isFirestoreAvailable } from '@/lib/firebase';

// Type definitions for API orders
interface ApiProduct {
  id: string;
  name: string;
  image: string;
}

interface ApiDenomination {
  id: string;
  amount: number;
}

interface ApiOrderItem {
  id: string;
  product?: ApiProduct;
  denomination?: ApiDenomination;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  gameUid?: string;
  server?: string;
  playerId?: string;
}

interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
}

// Type definitions for Firebase orders
interface FirebaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  gameUid?: string;
  server?: string;
  playerId?: string;
  denominationId?: string;
}

interface FirebaseOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderNumber: string;
  items: FirebaseOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  paymentStatus: 'pending' | 'success' | 'failed';
  shippingInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Combined Order type that can be either API or Firebase format
type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  items: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  billingInfo?: BillingInfo;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

interface OrdersResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiDataResponse {
  success: boolean;
  data?: OrdersResponse;
  message?: string;
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [guestOrders, setGuestOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!mounted) return;

    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        const params: Record<string, any> = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (statusFilter !== 'all') {
          params.status = statusFilter.toUpperCase();
        }

        let apiOrders: Order[] = [];
        let firestoreOrders: Order[] = [];

        // Try to get orders from API
        try {
          const response = await apiClient.orders.getUserOrders(params) as ApiDataResponse;

          if (response.success && response.data?.orders) {
            apiOrders = response.data.orders;
          }
        } catch (apiError) {
          console.log('API orders not available, trying Firestore...');
        }

        // Try to get orders from Firestore
        try {
          if (isFirestoreAvailable() && user.uid) {
            firestoreOrders = await getUserOrders(user.uid) as unknown as Order[];
            console.log(`Fetched ${firestoreOrders.length} orders from Firestore`);
          }
        } catch (firestoreError) {
          console.log('Firestore orders not available');
        }

        // Combine orders from both sources, removing duplicates
        const allOrders = [...apiOrders];
        const apiOrderIds = new Set(apiOrders.map(o => o.id || o.orderNumber));

        for (const order of firestoreOrders) {
          const orderId = order.id || order.orderNumber;
          if (!apiOrderIds.has(orderId)) {
            allOrders.push(order);
          }
        }

        setOrders(allOrders);
        setPagination(prev => ({
          ...prev,
          total: allOrders.length,
          totalPages: Math.ceil(allOrders.length / prev.limit),
        }));
      } else {
        if (typeof window !== 'undefined') {
          try {
            const storedGuestOrders = localStorage.getItem('guestOrders');
            if (storedGuestOrders) {
              const parsedOrders = JSON.parse(storedGuestOrders);
              setGuestOrders(parsedOrders);
            } else {
              setGuestOrders([]);
            }
          } catch (e) {
            console.error('Error parsing guest orders:', e);
            setGuestOrders([]);
          }
        }
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, mounted, pagination.page, statusFilter, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'failed', label: 'Failed' },
  ];

  const currentOrders = (isAuthenticated && user) ? orders : guestOrders;

  const filteredOrders = currentOrders.filter(order => {
    return order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PROCESSING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'PENDING':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return 'N/A';
    try {
      let date: Date;
      
      // Handle Firebase Timestamp or Date object
      if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-gaming-cyan mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-8">
              You need to be signed in to view your orders.
            </p>
            <Link href="/login">
              <Button className="gaming-button">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track your gaming purchases and top-up history
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-gaming-cyan mb-2">
              {currentOrders.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {currentOrders.filter(o => o.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {currentOrders.filter(o => o.status === 'PROCESSING' || o.status === 'PENDING').length}
            </div>
            <div className="text-sm text-muted-foreground">Processing/Pending</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {currentOrders.filter(o => o.status === 'FAILED' || o.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed/Cancelled</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 input-gaming"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 input-gaming"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="h-12 w-12 animate-spin text-gaming-cyan mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="gaming-button">
              Try Again
            </Button>
          </motion.div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {statusFilter === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `No ${statusFilter} orders found.`}
                </p>
                <Link href="/products">
                  <Button className="gaming-button">
                    Start Shopping
                  </Button>
                </Link>
              </motion.div>
            ) : (
              filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  className="glass-card p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.orderNumber || 'N/A'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                          {/* Display user info for Firebase orders */}
                          {(order.userName || order.userEmail) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Customer: {order.userName || 'N/A'} {order.userEmail && `(${order.userEmail})`}
                            </p>
                          )}
                          {/* Display billing info for API orders */}
                          {order.billingInfo && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Customer: {order.billingInfo.fullName || 'N/A'} {order.billingInfo.email && `(${order.billingInfo.email})`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status ? order.status.charAt(0) + order.status.slice(1).toLowerCase() : 'Unknown'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod || 'N/A'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items && order.items.map((item, itemIndex) => {
                          // Check if this is a Firebase order item (has productName directly)
                          const isFirebaseItem = !!item.productName;
                          const itemName = isFirebaseItem ? item.productName : item.product?.name || 'Game Top-up';
                          const itemQuantity = item.quantity || 1;
                          // Firebase items have 'price', API items have 'totalPrice' or 'unitPrice'
                          const itemPrice = isFirebaseItem 
                            ? (item.price || 0) * itemQuantity 
                            : (item.totalPrice || item.unitPrice || 0);
                          const itemImage = !isFirebaseItem && item.product?.image;
                          
                          return (
                            <div key={item.id || itemIndex} className="flex items-center space-x-4">
                              {itemImage && (
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{itemName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {isFirebaseItem 
                                    ? `Price: ${formatCurrency(item.price || 0)}`
                                    : (item.denomination?.amount ? `${item.denomination.amount} ` : '')
                                  }
                                  • Qty: {itemQuantity}
                                  {item.gameUid && ` • UID: ${item.gameUid}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gaming-cyan">
                                  {formatCurrency(itemPrice)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:w-48 space-y-3">
                      <div className="text-center lg:text-right">
                        <div className="text-xl font-bold text-gaming-cyan mb-2">
                          {formatCurrency(order.totalAmount || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Button size="sm" variant="outline" className="flex-1 lg:flex-none">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {order.status === 'COMPLETED' && (
                          <Button size="sm" variant="outline" className="flex-1 lg:flex-none">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        
                        {(order.status === 'FAILED' || order.status === 'CANCELLED') && (
                          <Link href="/products">
                            <Button size="sm" className="gaming-button flex-1 lg:flex-none w-full">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {pagination.totalPages > 1 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mt-8"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-card/30 rounded-2xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-center mb-6">Need Help with Your Orders?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-purple rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Track Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Most orders are delivered within 1-5 minutes
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-cyan rounded-full flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Easy Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  Get full refunds for failed transactions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-orange rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Order Support</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team anytime
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/contact">
                <Button className="gaming-button">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

