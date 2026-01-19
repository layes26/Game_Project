'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Gamepad2, 
  Crown, 
  Zap, 
  Car, 
  Trophy, 
  Brain,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem: addToCart } = useCartStore();

  // All games data
  const allGames = [
    { id: '1', name: 'PUBG Mobile', category: 'battle-royale', image: '/images/pubg.png', description: 'Battle Royale Game', price: 500, discount: 15, rating: 4.8, players: '2.3M+', tags: ['Popular', 'Instant'] },
    { id: '2', name: 'Free Fire', category: 'battle-royale', image: '/images/freefire.jpg', description: 'Battle Royale Game', price: 350, discount: 20, rating: 4.6, players: '1.8M+', tags: ['Hot', 'Fast Delivery'] },
    { id: '3', name: 'Call of Duty Mobile', category: 'fps', image: '/images/Cod.png', description: 'FPS Battle Game', price: 800, discount: 10, rating: 4.7, players: '1.2M+', tags: ['Premium', '24/7'] },
    { id: '4', name: 'Mobile Legends', category: 'mobile-legends', image: '/images/mobile legend.jpg', description: 'MOBA Game', price: 200, discount: 25, rating: 4.5, players: '900K+', tags: ['Best Value'] },
    { id: '5', name: 'Clash of Clans', category: 'strategy', image: '/images/Clash of clans.jpg', description: 'Strategy Game', price: 300, discount: 18, rating: 4.7, players: '1.5M+', tags: ['Addictive', 'Popular'] },
    { id: '6', name: 'Genshin Impact', category: 'rpg', image: '/images/genshin impact.jpg', description: 'RPG Adventure Game', price: 600, discount: 12, rating: 4.9, players: '3.2M+', tags: ['Best Graphics', 'Premium'] },
    { id: '7', name: 'Arena Breakout', category: 'fps', image: '/images/Arena Breakout.jpg', description: 'Tactical FPS Game', price: 450, discount: 16, rating: 4.6, players: '1.1M+', tags: ['Tactical', 'Competitive'] },
    { id: '8', name: 'Delta Force', category: 'fps', image: '/images/delta force.jpg', description: 'Military FPS Game', price: 550, discount: 22, rating: 4.8, players: '2.0M+', tags: ['Action', 'Multiplayer'] },
    { id: '9', name: 'Clash Royale', category: 'strategy', image: '/images/CLASH ROYALE.jpg', description: 'Card Strategy Game', price: 250, discount: 20, rating: 4.8, players: '2.8M+', tags: ['Card Game', 'Strategy'] },
    { id: '10', name: 'eFootball', category: 'sports', image: '/images/efootball .jpg', description: 'Sports Football Game', price: 280, discount: 15, rating: 4.6, players: '1.9M+', tags: ['Sports', 'Football'] },
    { id: '11', name: 'FIFA Mobile', category: 'sports', image: '/images/fifa mobile.jpg', description: 'Soccer Sports Game', price: 320, discount: 17, rating: 4.7, players: '2.2M+', tags: ['Soccer', 'Sports'] },
    { id: '12', name: 'Asphalt 9 Legends', category: 'racing', image: '/images/Get Asphalt 9_ Legends .jpg', description: 'Racing Game', price: 400, discount: 14, rating: 4.8, players: '1.7M+', tags: ['Racing', 'Action'] },
    { id: '13', name: 'NBA Live Mobile', category: 'sports', image: '/images/nba live mobile.jpg', description: 'Basketball Game', price: 270, discount: 19, rating: 4.5, players: '1.3M+', tags: ['Basketball', 'Sports'] },
    { id: '14', name: 'Need For Speed No Limit', category: 'racing', image: '/images/need for speed no limit.jpg', description: 'Racing Game', price: 380, discount: 21, rating: 4.7, players: '1.6M+', tags: ['Racing', 'Speed'] },
  ];

  const categories = [
    {
      id: 'battle-royale',
      name: 'Battle Royale',
      description: 'Survive and be the last one standing',
      icon: Crown,
      gameCount: 2,
      image: '/images/pubg.png',
      color: 'from-gaming-purple to-gaming-cyan',
      popular: true,
      featured: true,
    },
    {
      id: 'fps',
      name: 'FPS Games',
      description: 'First-person shooter action games',
      icon: Zap,
      gameCount: 3,
      image: '/images/Cod.png',
      color: 'from-gaming-cyan to-gaming-orange',
      popular: true,
      featured: true,
    },
    {
      id: 'mobile-legends',
      name: 'Mobile Legends',
      description: 'MOBA strategic team battles',
      icon: Trophy,
      gameCount: 1,
      image: '/images/mobile legend.jpg',
      color: 'from-gaming-orange to-gaming-purple',
      popular: false,
      featured: false,
    },
    {
      id: 'strategy',
      name: 'Strategy Games',
      description: 'Strategic thinking and planning',
      icon: Brain,
      gameCount: 2,
      image: '/images/Clash of clans.jpg',
      color: 'from-blue-500 to-gaming-purple',
      popular: false,
      featured: false,
    },
    {
      id: 'sports',
      name: 'Sports Games',
      description: 'Football, basketball, and more',
      icon: Trophy,
      gameCount: 3,
      image: '/images/eFootball.jpg',
      color: 'from-green-500 to-gaming-cyan',
      popular: false,
      featured: false,
    },
    {
      id: 'racing',
      name: 'Racing Games',
      description: 'High-speed racing and cars',
      icon: Car,
      gameCount: 2,
      image: '/images/asphalt9.jpg',
      color: 'from-red-500 to-gaming-orange',
      popular: false,
      featured: false,
    },
    {
      id: 'rpg',
      name: 'RPG Games',
      description: 'Role-playing and adventure games',
      icon: Gamepad2,
      gameCount: 1,
      image: '/images/genshin.jpg',
      color: 'from-purple-500 to-pink-500',
      popular: false,
      featured: false,
    },
  ];

  const featuredCategories = categories.filter(cat => cat.featured);
  const popularCategories = categories.filter(cat => cat.popular);

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
            Game Categories
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of game categories and find your favorite gaming experiences
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="text-center glass-card p-6">
            <div className="text-3xl font-bold text-gaming-cyan mb-2">8</div>
            <div className="text-sm text-muted-foreground">Game Categories</div>
          </div>
          <div className="text-center glass-card p-6">
            <div className="text-3xl font-bold text-gaming-purple mb-2">14</div>
            <div className="text-sm text-muted-foreground">Total Games</div>
          </div>
          <div className="text-center glass-card p-6">
            <div className="text-3xl font-bold text-gaming-orange mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Service Available</div>
          </div>
        </motion.div>

        {/* Featured Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Categories</h2>
            <Badge variant="gaming" className="text-sm">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products?category=${category.id}`}>
                    <div className="product-card group cursor-pointer relative overflow-hidden">
                      {/* Background Image */}
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {category.gameCount} games
                            </Badge>
                            <Badge variant="gaming" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Hot
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Browse Games
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* All Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-8">All Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products?category=${category.id}`}>
                    <div className="category-card group cursor-pointer">
                      <div className="text-center space-y-4">
                        <div className={`w-20 h-20 mx-auto rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          
                          <div className="flex items-center justify-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {category.gameCount} games
                            </Badge>
                            {category.popular && (
                              <Badge variant="gaming" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Explore Games
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Games by Category Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-8">Browse Games by Category</h2>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'gaming' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="flex items-center space-x-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>All Games</span>
            </Button>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'gaming' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Filtered Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allGames
              .filter(game => selectedCategory === 'all' || game.category === selectedCategory)
              .map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="product-card group"
                >
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="product-card-image"
                    />
                    {game.discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-gaming-orange">
                        -{game.discount}%
                      </Badge>
                    )}
                    <div className="absolute flex items-center px-2 py-1 space-x-1 rounded-full bottom-2 right-2 bg-black/50">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-white">{game.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">{game.name}</h3>
                    <p className="text-xs text-muted-foreground">{game.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm font-bold text-gaming-cyan">
                        {formatCurrency(game.price)}
                      </div>
                      <Link href="/products">
                        <Button size="sm" variant="gaming" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Can&apos;t Find Your Game?</h2>
            <p className="text-muted-foreground mb-6">
              We&apos;re constantly adding new games and categories. Contact us if you&apos;d like to see a specific game or category featured.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="gaming-button w-full sm:w-auto">
                  Contact Us
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  View All Games
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
