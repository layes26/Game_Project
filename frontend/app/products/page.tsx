'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

/* 🔹 CHILD COMPONENT */
function ProductsContent() {
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

  const games = [ /* 🔹 keep your games array EXACTLY as it is */ ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (game: typeof games[0]) => {
    addToCart({
      name: game.name,
      description: game.description,
      image: game.image,
      price: game.price,
      quantity: 1,
      category: game.category,
      discount: game.discount,
    });
  };

  return (
    /* 🔹 KEEP YOUR EXISTING JSX HERE (UNCHANGED) */
    <div className="min-h-screen py-8">
      {/* everything you already wrote stays */}
    </div>
  );
}

/* 🔹 PAGE EXPORT WITH SUSPENSE */
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
