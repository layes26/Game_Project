'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Gift,
  Star,
  Shield,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. 
              Start shopping to find your favorite games and gift cards!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="gaming-button w-full sm:w-auto">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Games
                </Button>
              </Link>
              <Link href="/gift-cards">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Gift className="h-4 w-4 mr-2" />
                  Gift Cards
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            Review your items and proceed to checkout
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h2 className="text-xl font-semibold">
                  Cart Items ({totalItems})
                </h2>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.discount && item.discount > 0 && (
                              <Badge variant="gaming" className="mt-1 text-xs">
                                {item.discount}% OFF
                              </Badge>
                            )}
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <div className="text-xl font-bold text-gaming-cyan">
                              {formatCurrency(item.totalPrice)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(item.price)} each
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-24"
            >
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold text-green-400">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-gaming-cyan">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full gaming-button mb-4">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Features */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Shield className="h-4 w-4 text-gaming-green" />
                    <span className="text-muted-foreground">Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Truck className="h-4 w-4 text-gaming-cyan" />
                    <span className="text-muted-foreground">Instant Delivery</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Star className="h-4 w-4 text-gaming-orange" />
                    <span className="text-muted-foreground">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold mb-3">Have a Promo Code?</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 input-gaming text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recommended Products */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sample recommended items */}
            <div className="product-card text-center">
              <img
                src="/images/pubg.png"
                alt="PUBG Mobile"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">PUBG Mobile UC</h3>
              <p className="text-sm text-muted-foreground mb-3">1800 UC Package</p>
              <div className="text-lg font-bold text-gaming-cyan mb-3">
                {formatCurrency(800)}
              </div>
              <Button size="sm" className="w-full gaming-button">
                Add to Cart
              </Button>
            </div>
            
            <div className="product-card text-center">
              <img
                src="/images/google.jpg"
                alt="Google Play"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">Google Play</h3>
              <p className="text-sm text-muted-foreground mb-3">$25 Gift Card</p>
              <div className="text-lg font-bold text-gaming-cyan mb-3">
                {formatCurrency(1200)}
              </div>
              <Button size="sm" className="w-full gaming-button">
                Add to Cart
              </Button>
            </div>
            
            <div className="product-card text-center">
              <img
                src="/images/freefire.jpg"
                alt="Free Fire"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">Free Fire</h3>
              <p className="text-sm text-muted-foreground mb-3">520 Diamonds</p>
              <div className="text-lg font-bold text-gaming-cyan mb-3">
                {formatCurrency(600)}
              </div>
              <Button size="sm" className="w-full gaming-button">
                Add to Cart
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

