'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp,
  ArrowRight,
  Gamepad2,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(decodeURIComponent(query));
    }
  }, [searchParams]);

  const categories = [
    { id: 'all', name: 'All Games', icon: Gamepad2 },
    { id: 'battle-royale', name: 'Battle Royale', icon: Crown },
    { id: 'fps', name: 'FPS Games', icon: Zap },
    { id: 'mobile-legends', name: 'Mobile Legends', icon: Crown },
    { id: 'strategy', name: 'Strategy Games', icon: Gamepad2 },
    { id: 'sports', name: 'Sports Games', icon: Zap },
    { id: 'racing', name: 'Racing Games', icon: Crown },
    { id: 'rpg', name: 'RPG Games', icon: Gamepad2 },
  ];

  const games = [
    {
      id: '1',
      name: 'PUBG Mobile',
      category: 'battle-royale',
      image: '/images/pubg.png',
      description: 'Battle Royale Game',
      price: 500,
      discount: 15,
      rating: 4.8,
      players: '2.3M+',
      tags: ['Popular', 'Instant'],
    },
    {
      id: '2',
      name: 'Free Fire',
      category: 'battle-royale',
      image: '/images/freefire.jpg',
      description: 'Battle Royale Game',
      price: 350,
      discount: 20,
      rating: 4.6,
      players: '1.8M+',
      tags: ['Hot', 'Fast Delivery'],
    },
    {
      id: '3',
      name: 'Call of Duty Mobile',
      category: 'fps',
      image: '/images/Cod.png',
      description: 'FPS Battle Game',
      price: 800,
      discount: 10,
      rating: 4.7,
      players: '1.2M+',
      tags: ['Premium', '24/7'],
    },
    {
      id: '4',
      name: 'Mobile Legends',
      category: 'mobile-legends',
      image: '/images/mobile legend.jpg',
      description: 'MOBA Game',
      price: 200,
      discount: 25,
      rating: 4.5,
      players: '900K+',
      tags: ['Best Value'],
    },
    {
      id: '5',
      name: 'Clash of Clans',
      category: 'strategy',
      image: '/images/Clash of clans.jpg',
      description: 'Strategy Game',
      price: 300,
      discount: 18,
      rating: 4.7,
      players: '1.5M+',
      tags: ['Addictive', 'Popular'],
    },
    {
      id: '6',
      name: 'Genshin Impact',
      category: 'rpg',
      image: '/images/genshin impact.jpg',
      description: 'RPG Adventure Game',
      price: 600,
      discount: 12,
      rating: 4.9,
      players: '3.2M+',
      tags: ['Best Graphics', 'Premium'],
    },
    {
      id: '7',
      name: 'Arena Breakout',
      category: 'fps',
      image: '/images/Arena Breakout.jpg',
      description: 'Tactical FPS Game',
      price: 450,
      discount: 16,
      rating: 4.6,
      players: '1.1M+',
      tags: ['Tactical', 'Competitive'],
    },
    {
      id: '8',
      name: 'Delta Force',
      category: 'fps',
      image: '/images/delta force.jpg',
      description: 'Military FPS Game',
      price: 550,
      discount: 22,
      rating: 4.8,
      players: '2.0M+',
      tags: ['Action', 'Multiplayer'],
    },
    {
      id: '9',
      name: 'Clash Royale',
      category: 'strategy',
      image: '/images/CLASH ROYALE.jpg',
      description: 'Card Strategy Game',
      price: 250,
      discount: 20,
      rating: 4.8,
      players: '2.8M+',
      tags: ['Card Game', 'Strategy'],
    },
    {
      id: '10',
      name: 'eFootball',
      category: 'sports',
      image: '/images/efootball .jpg',
      description: 'Sports Football Game',
      price: 280,
      discount: 15,
      rating: 4.6,
      players: '1.9M+',
      tags: ['Sports', 'Football'],
    },
    {
      id: '11',
      name: 'FIFA Mobile',
      category: 'sports',
      image: '/images/fifa mobile.jpg',
      description: 'Soccer Sports Game',
      price: 320,
      discount: 17,
      rating: 4.7,
      players: '2.2M+',
      tags: ['Soccer', 'Sports'],
    },
    {
      id: '12',
      name: 'Asphalt 9 Legends',
      category: 'racing',
      image: '/images/Get Asphalt 9_ Legends .jpg',
      description: 'Racing Game',
      price: 400,
      discount: 14,
      rating: 4.8,
      players: '1.7M+',
      tags: ['Racing', 'Action'],
    },
    {
      id: '13',
      name: 'NBA Live Mobile',
      category: 'sports',
      image: '/images/nba live mobile.jpg',
      description: 'Basketball Game',
      price: 270,
      discount: 19,
      rating: 4.5,
      players: '1.3M+',
      tags: ['Basketball', 'Sports'],
    },
    {
      id: '14',
      name: 'Need For Speed No Limit',
      category: 'racing',
      image: '/images/need for speed no limit.jpg',
      description: 'Racing Game',
      price: 380,
      discount: 21,
      rating: 4.7,
      players: '1.6M+',
      tags: ['Racing', 'Speed'],
    },
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (game: typeof games[0]) => {
    const cartItem = {
      name: game.name,
      description: game.description,
      image: game.image,
      price: game.price,
      quantity: 1,
      category: game.category,
      discount: game.discount,
    };
    
    addToCart(cartItem);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold md:text-5xl font-orbitron">
            Game Products
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Discover our extensive collection of games with instant top-up services
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col items-center gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-10 pr-4 input-gaming"
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
                    <Icon className="w-4 h-4" />
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
          className="mb-6"
        >
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-gaming-cyan">{filteredGames.length}</span> of {games.length} games {selectedCategory !== 'all' && `in ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
          </p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGames.map((game, index) => (
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
                
                {/* Tags */}
                <div className="absolute flex flex-wrap gap-1 top-2 left-2">
                  {game.tags.map((tag) => (
                    <Badge key={tag} variant="gaming" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Discount Badge */}
                {game.discount > 0 && (
                  <Badge className="absolute top-2 right-2 bg-gaming-orange">
                    -{game.discount}%
                  </Badge>
                )}

                {/* Rating */}
                <div className="absolute flex items-center px-2 py-1 space-x-1 rounded-full bottom-2 right-2 bg-black/50">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-white">{game.rating}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{game.name}</h3>
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
                      <TrendingUp className="w-3 h-3" />
                      <span>{game.players}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full gaming-button"
                  onClick={() => handleAddToCart(game)}
                >
                  Add to Cart
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No games found</h3>
            <p className="mb-6 text-muted-foreground">
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

        {/* Load More Button (for future pagination) */}
        {filteredGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Button variant="outline" size="lg">
              Load More Games
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
