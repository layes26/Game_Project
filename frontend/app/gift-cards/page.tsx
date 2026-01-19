'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  ArrowRight,
  Gift,
  Smartphone,
  Monitor,
  Gamepad2,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';

export default function GiftCardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCartStore();

  const giftCards = [
    {
      id: '1',
      name: 'Google Play',
      category: 'mobile',
      image: '/images/google.jpg',
      description: 'Android Apps & Games',
      price: 100,
      discount: 5,
      rating: 4.9,
      platform: 'Android',
      icon: Smartphone,
    },
    {
      id: '2',
      name: 'Amazon',
      category: 'shopping',
      image: '/images/amazon-removebg-preview.png',
      description: 'Online Shopping',
      price: 200,
      discount: 8,
      rating: 4.8,
      platform: 'Web',
      icon: Monitor,
    },
    {
      id: '3',
      name: 'Steam',
      category: 'gaming',
      image: '/images/steam.jpg',
      description: 'PC Games',
      price: 600,
      discount: 12,
      rating: 4.7,
      platform: 'PC',
      icon: Gamepad2,
    },
    {
      id: '4',
      name: 'PlayStation',
      category: 'gaming',
      image: '/images/steam.jpg',
      description: 'PlayStation Store',
      price: 1000,
      discount: 15,
      rating: 4.8,
      platform: 'PlayStation',
      icon: Gamepad2,
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Gift },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'mobile', name: 'Mobile', icon: Smartphone },
    { id: 'shopping', name: 'Shopping', icon: Monitor },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCards = giftCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Gift Cards
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Digital gift cards for all your favorite platforms and services
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search gift cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 input-gaming"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "gaming" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center"
        >
          <p className="text-muted-foreground">
            Showing {filteredCards.length} of {giftCards.length} gift cards
          </p>
        </motion.div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="product-card text-center group"
              >
                <div className="relative overflow-hidden rounded-lg mb-4 mx-auto w-24 h-24">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Platform Icon */}
                  <div className="absolute top-1 right-1 bg-card/80 rounded-full p-1">
                    <Icon className="h-3 w-3 text-gaming-cyan" />
                  </div>

                  {/* Discount Badge */}
                  {card.discount > 0 && (
                    <Badge className="absolute top-1 left-1 bg-gaming-orange text-xs">
                      -{card.discount}%
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{card.name}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-muted-foreground">{card.rating}</span>
                    </div>
                  </div>
                  
                  <div className="text-xl font-bold text-gaming-cyan">
                    Starting from {formatCurrency(card.price)}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {card.platform}
                    </Badge>
                    {card.discount > 0 && (
                      <Badge variant="gaming" className="text-xs">
                        Save {card.discount}%
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full gaming-button"
                    onClick={() => {
                      addItem({
                        name: card.name,
                        description: card.description,
                        image: card.image,
                        price: card.price,
                        quantity: 1,
                        category: 'gift-card',
                      });
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No gift cards found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-card/30 rounded-2xl p-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">Why Choose Our Gift Cards?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-purple rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Instant Delivery</h3>
                <p className="text-sm text-muted-foreground">Receive your gift card code immediately after purchase</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-cyan rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">100% Authentic</h3>
                <p className="text-sm text-muted-foreground">All gift cards are genuine and verified</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gaming-orange rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Easy to Use</h3>
                <p className="text-sm text-muted-foreground">Simple redemption process for all platforms</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
