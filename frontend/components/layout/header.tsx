'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ShoppingCart, 
  Search, 
  Menu, 
  X,
  Gamepad2,
  LogOut,
  Settings,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Game data for suggestions
  const games = [
    { id: '1', name: 'PUBG Mobile' },
    { id: '2', name: 'Free Fire' },
    { id: '3', name: 'Call of Duty Mobile' },
    { id: '4', name: 'Mobile Legends' },
    { id: '5', name: 'Clash of Clans' },
    { id: '6', name: 'Genshin Impact' },
    { id: '7', name: 'Arena Breakout' },
    { id: '8', name: 'Delta Force' },
    { id: '9', name: 'Clash Royale' },
    { id: '10', name: 'eFootball' },
    { id: '11', name: 'FIFA Mobile' },
    { id: '12', name: 'Asphalt 9 Legends' },
    { id: '13', name: 'NBA Live Mobile' },
    { id: '14', name: 'Need For Speed No Limit' },
  ];

  const navigation = [
    { name: 'Home', href: '/', icon: Gamepad2 },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Menu },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (gameName: string) => {
    router.push(`/products?search=${encodeURIComponent(gameName)}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Filter suggestions based on search query
  const suggestions = searchQuery.trim()
    ? games.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Gamepad2 className="h-8 w-8 text-gaming-cyan" />
            <div className="absolute inset-0 h-8 w-8 bg-gaming-cyan/20 blur-sm rounded-full"></div>
          </div>
          <span className="font-bold text-xl font-orbitron text-gaming-cyan neon-text">
            GameTopUp
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-gaming-cyan",
                  pathname === item.href 
                    ? "text-gaming-cyan" 
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <input
              type="text"
              placeholder="Search games, gift cards..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-12 py-2 bg-card/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:border-transparent"
            />
            
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:text-gaming-cyan transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50">
                {suggestions.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleSuggestionClick(game.name)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent/50 transition-colors flex items-center space-x-2 border-b border-border/50 last:border-b-0"
                  >
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span>{game.name}</span>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-gaming-orange"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">{user.firstName}</span>
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Package className="h-4 w-4 mr-3" />
                    My Orders
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gaming-button">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games, gift cards..."
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gaming-purple focus:border-transparent"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      pathname === item.href 
                        ? "bg-gaming-purple/20 text-gaming-cyan" 
                        : "text-muted-foreground hover:bg-accent"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Actions */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-border space-y-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full gaming-button">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
