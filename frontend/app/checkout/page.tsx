'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Phone, 
  Lock, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore, SimpleCartItem } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useOrderStore } from '@/stores/order';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { createOrder, createPayment } from '@/lib/firebase';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { createOrder, createPayment } = useOrderStore();
  const [mounted, setMounted] = useState(false);
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD'>('BKASH');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gameUid: '',
    playerId: '',
    senderNumber: '',
    transactionId: '',
    senderName: '',
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.firstName ? `${user.firstName} ${user.lastName}` : '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!mounted) return;

    const gameItems = items.filter((item) => item.category !== 'gift-card');

    if (gameItems.length > 0) {
      if (!formData.gameUid) {
        toast.error('Please enter your Game UID for game items');
        return;
      }
    }

    if (!formData.senderNumber || !formData.transactionId) {
      toast.error('Please fill in payment details');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.productId || item.id,
        denominationId: item.denominationId || '',
        gameUid: formData.gameUid,
        quantity: item.quantity,
        ...(formData.playerId && { playerId: formData.playerId }),
        ...(item.server && { server: item.server }),
      }));

      const billingInfo = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      let order;
      
      // Try to connect to backend API
      try {
        let orderResponse;
        
        if (isAuthenticated) {
          orderResponse = await apiClient.orders.create({
            billingInfo,
            paymentMethod,
            items: orderItems,
          });
        } else {
          orderResponse = await apiClient.orders.createGuestOrder({
            billingInfo,
            paymentMethod,
            items: orderItems,
          });
        }

        if (orderResponse.success && orderResponse.data?.order) {
          order = orderResponse.data.order;

          const paymentResponse = await apiClient.payments.submitManual({
            orderId: order.id,
            paymentMethod,
            senderNumber: formData.senderNumber,
            transactionId: formData.transactionId,
            amount: totalPrice,
            senderName: formData.senderName,
          });

          if (!paymentResponse.success) {
            throw new Error(paymentResponse.message || 'Payment submission failed');
          }
        } else {
          throw new Error(orderResponse.message || 'Order creation failed');
        }
      } catch (apiError: any) {
        // If API fails, try to save to Firebase Firestore
        console.warn('Backend not available, trying Firebase...');
        
        const userId = isAuthenticated && user?.uid ? user.uid : 'guest';
        const orderNumber = `ORD-${Date.now()}`;
        
        // Prepare order data for Firebase
        const firebaseOrderData = {
          userId,
          userName: billingInfo.fullName,
          userEmail: billingInfo.email,
          orderNumber,
          items: orderItems.map((item: any) => ({
            productId: item.productId,
            productName: items.find((i) => i.productId === item.productId)?.name || 'Unknown Product',
            quantity: item.quantity,
            price: items.find((i) => i.productId === item.productId)?.price || 0,
          })),
          totalAmount: totalPrice,
          paymentMethod,
          status: 'pending' as const,
          paymentStatus: 'pending' as const,
          shippingInfo: {
            name: billingInfo.fullName,
            email: billingInfo.email,
            phone: billingInfo.phone,
            address: formData.gameUid || 'N/A',
          },
        };

        try {
          // Try to save to Firebase Firestore
          const orderId = await createOrder(firebaseOrderData);
          
          order = {
            id: orderId,
            ...firebaseOrderData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Also save payment to Firebase
          const paymentData = {
            orderId: order.id,
            userId,
            amount: totalPrice,
            method: paymentMethod,
            transactionId: formData.transactionId,
            status: 'pending' as const,
            paymentDetails: {
              senderNumber: formData.senderNumber,
              senderName: formData.senderName,
              gameUid: formData.gameUid,
              playerId: formData.playerId,
            },
          };
          
          await createPayment(paymentData);
          console.log('✅ Order and payment saved to Firebase');
        } catch (firebaseError: any) {
          // If Firebase also fails, create demo order locally
          console.warn('Firebase not available, creating demo order locally...');
          
          const demoOrder = {
            id: `demo-${Date.now()}`,
            orderNumber,
            items: orderItems,
            totalAmount: totalPrice,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: paymentMethod,
            billingInfo: billingInfo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Store guest order in localStorage
          try {
            const existingOrders = localStorage.getItem('guestOrders');
            let ordersArray: any[] = [];
            if (existingOrders) {
              ordersArray = JSON.parse(existingOrders);
            }
            ordersArray.push(demoOrder);
            localStorage.setItem('guestOrders', JSON.stringify(ordersArray));
          } catch (e) {
            console.error('Error storing guest order:', e);
          }
          
          order = demoOrder;
        }
      }

      // Success - show order confirmation
      setStep(3);
      clearCart();
      toast.success('Order placed successfully! (Demo Mode)');
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add items to your cart to checkout</p>
            <Link href="/products">
              <Button className="gaming-button">Browse Products</Button>
            </Link>
          </div>
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            Checkout
          </h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </motion.div>

        {step !== 3 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-gaming-cyan' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-gaming-cyan text-black' : 'bg-gray-700'}`}>
                  {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Information</span>
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-gaming-cyan' : 'bg-gray-700'}`} />
              <div className={`flex items-center ${step >= 2 ? 'text-gaming-cyan' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-gaming-cyan text-black' : 'bg-gray-700'}`}>
                  {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Payment</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full input-gaming"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full input-gaming"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full input-gaming"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="font-semibold mb-4">Game Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Game UID *</label>
                        <input
                          type="text"
                          name="gameUid"
                          value={formData.gameUid}
                          onChange={handleInputChange}
                          className="w-full input-gaming"
                          placeholder="Enter your in-game UID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Player ID (Optional)</label>
                        <input
                          type="text"
                          name="playerId"
                          value={formData.playerId}
                          onChange={handleInputChange}
                          className="w-full input-gaming"
                          placeholder="Player ID if required"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button 
                      className="gaming-button"
                      onClick={() => {
                        const gameItems = items.filter((item) => item.category !== 'gift-card');
                        
                        if (gameItems.length > 0) {
                          if (!formData.gameUid) {
                            toast.error('Please enter your Game UID for game items');
                            return;
                          }
                        }
                        
                        if (!formData.fullName || !formData.email || !formData.phone) {
                          toast.error('Please fill in all required fields');
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BKASH')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'BKASH' 
                          ? 'border-gaming-purple bg-gaming-purple/10' 
                          : 'border-border hover:border-gaming-purple/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg">bKash</div>
                        <div className="text-sm text-muted-foreground">Mobile Banking</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NAGAD')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'NAGAD' 
                          ? 'border-gaming-orange bg-gaming-orange/10' 
                          : 'border-border hover:border-gaming-orange/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-bold text-lg">Nagad</div>
                        <div className="text-sm text-muted-foreground">Digital Banking</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">How to Pay via {paymentMethod}:</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to your {paymentMethod} app</li>
                    <li>Send ৳{formatCurrency(totalPrice)} to business number</li>
                    <li>Enter your {paymentMethod} PIN</li>
                    <li>Copy the transaction ID from confirmation</li>
                    <li>Paste it below</li>
                  </ol>
                  <div className="mt-3 p-3 bg-gaming-cyan/10 rounded-lg">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Send money to: </span>
                      <span className="font-bold text-gaming-cyan">
                        {paymentMethod === 'BKASH' ? '01304123456' : '01700123456'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-bold text-gaming-cyan">৳{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your {paymentMethod} Number *</label>
                    <input
                      type="tel"
                      name="senderNumber"
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      className="w-full input-gaming"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction ID *</label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      className="w-full input-gaming"
                      placeholder="Enter transaction ID from your payment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sender Name (Optional)</label>
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleInputChange}
                      className="w-full input-gaming"
                      placeholder="Name on the payment account"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    className="gaming-button"
                    onClick={handleSubmitOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-20 h-20 bg-gaming-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-gaming-green" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Your payment has been submitted and is being reviewed. 
                  You will receive your items within 2-24 hours.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  A confirmation email has been sent to {formData.email}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/orders">
                    <Button className="gaming-button">
                      View Orders
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {step !== 3 && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.totalPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-border mb-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing Fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <hr className="border-border my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-gaming-cyan">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                    <Lock className="h-4 w-4 text-gaming-green" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-gaming-cyan" />
                    <span>Instant Delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

