'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Zap, 
  Shield, 
  Headphones, 
  Star, 
  TrendingUp,
  Clock,
  ArrowRight,
  Gift,
  Coins,
  User,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatGameName } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const { addItem: addToCart } = useCartStore();

  // All games data (kept for future use if needed)
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

  // Mock data - in real app this would come from API
  const featuredGames = [
    {
      id: '1',
      name: 'PUBG Mobile',
      image: '/images/pubg.png',
      description: 'Battle Royale Game',
      price: 500,
      discount: 15,
      rating: 4.8,
      players: '2.3M+',
    },
    {
      id: '2',
      name: 'Free Fire',
      image: '/images/freefire.jpg',
      description: 'Battle Royale Game',
      price: 350,
      discount: 20,
      rating: 4.6,
      players: '1.8M+',
    },
    {
      id: '3',
      name: 'Call of Duty Mobile',
      image: '/images/Cod.png',
      description: 'FPS Battle Game',
      price: 800,
      discount: 10,
      rating: 4.7,
      players: '1.2M+',
    },
  ];

  const giftCards = [
    {
      id: '1',
      name: 'Google Play',
      image: '/images/google.jpg',
      description: 'Android Apps & Games',
      price: 100,
      discount: 5,
    },
    {
      id: '2',
      name: 'Amazon',
      image: '/images/amazon-removebg-preview.png',
      description: 'Online Shopping',
      price: 200,
      discount: 8,
    },
    {
      id: '3',
      name: 'Steam',
      image: '/images/steam.jpg',
      description: 'PC Games',
      price: 600,
      discount: 12,
    },
  ];

  const categories = [
    { name: 'Battle Royale', count: 2, icon: '🎮', id: 'battle-royale' },
    { name: 'FPS Games', count: 3, icon: '🔫', id: 'fps' },
    { name: 'Mobile Legends', count: 1, icon: '👑', id: 'mobile-legends' },
    { name: 'Strategy Games', count: 2, icon: '🧠', id: 'strategy' },
    { name: 'Sports Games', count: 3, icon: '⚽', id: 'sports' },
    { name: 'Racing Games', count: 2, icon: '🏎️', id: 'racing' },
    { name: 'RPG Games', count: 1, icon: '🎯', id: 'rpg' },
  ];

  const trustFeatures = [
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Get your items in seconds',
      color: 'text-yellow-400',
    },
    {
      icon: Shield,
      title: '100% Secure',
      description: 'SSL encrypted transactions',
      color: 'text-green-400',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/Hero.png')] bg-contain bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gaming-dark/80 via-gaming-navy/70 to-gaming-dark/80"></div>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10"></div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="gaming" className="text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Instant Top-up Service
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold font-orbitron leading-tight">
                  Level Up Your
                  <span className="neon-text block">Gaming Experience</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-lg">
                  Get instant top-ups for your favorite games and gift cards. 
                  Fast, secure, and trusted by millions of gamers worldwide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" variant="gaming" className="w-full sm:w-auto">
                    <Gamepad2 className="h-5 w-5 mr-2" />
                    Browse Games
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/gift-cards">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Gift className="h-5 w-5 mr-2" />
                    Gift Cards
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gaming-cyan">2M+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gaming-purple">14+</div>
                  <div className="text-sm text-muted-foreground">Games Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gaming-orange">99.9%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gaming-purple rounded-xl p-4 shadow-glow"
              >
                <Coins className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gaming-cyan rounded-xl p-4 shadow-glow-cyan"
              >
                <Star className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="trust-badge"
                >
                  <div className="trust-icon">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
              Popular Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the most played and loved game categories by our community
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/products?category=${category.id}`}>
                  <div className="category-card">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} games</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
                Featured Games
              </h2>
              <p className="text-muted-foreground">
                Top-rated games with instant top-up service
              </p>
            </motion.div>
            
            <Link href="/products">
              <Button variant="outline" className="hidden md:flex">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/products/${game.id}`}>
                  <div className="product-card">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="product-card-image"
                      />
                      {game.discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-gaming-orange">
                          -{game.discount}%
                        </Badge>
                      )}
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white">{game.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{formatGameName(game.name)}</h3>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Starting from</div>
                          <div className="text-xl font-bold text-gaming-cyan">
                            {formatCurrency(game.price)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{game.players}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full">
                View All Games
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gift Cards */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
                Popular Gift Cards
              </h2>
              <p className="text-muted-foreground">
                Digital gift cards for all your favorite platforms
              </p>
            </motion.div>
            
            <Link href="/gift-cards">
              <Button variant="outline" className="hidden md:flex">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {giftCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/gift-cards/${card.id}`}>
                  <div className="product-card text-center">
                    <div className="relative overflow-hidden rounded-lg mb-4 mx-auto w-24 h-24">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">{card.description}</p>
                      </div>
                      
                      <div className="text-xl font-bold text-gaming-cyan">
                        Starting from {formatCurrency(card.price)}
                      </div>
                      
                      {card.discount > 0 && (
                        <Badge variant="gaming" className="text-xs">
                          Save {card.discount}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/gift-cards">
              <Button variant="outline" className="w-full">
                View All Gift Cards
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-orbitron mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your gaming items in just three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Your Game',
                description: 'Browse our extensive catalog and select your favorite game or gift card',
                icon: Gamepad2,
                color: 'text-gaming-purple',
              },
              {
                step: '02',
                title: 'Enter Details',
                description: 'Provide your game UID/player ID and select the top-up amount',
                icon: User,
                color: 'text-gaming-cyan',
              },
              {
                step: '03',
                title: 'Instant Delivery',
                description: 'Complete payment and receive your items instantly in your game',
                icon: Zap,
                color: 'text-gaming-orange',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center space-y-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gaming-purple to-gaming-cyan rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gaming-dark border-2 border-gaming-cyan rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gaming-cyan">{item.step}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 bg-gradient-to-r from-gaming-purple/10 to-gaming-cyan/10 rounded-2xl p-12 border border-gaming-purple/20"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-orbitron">
                Ready to Level Up?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join millions of satisfied gamers who trust GameTopUp for instant, 
                secure, and reliable gaming services.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="gaming" className="w-full sm:w-auto">
                  Start Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Headphones className="h-4 w-4 mr-2" />
                  Get Support
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gaming-cyan" />
                <span>24/7 Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gaming-green" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gaming-orange" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
