'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Games',
      links: [
        { name: 'PUBG Mobile', href: '/products/pubg-mobile' },
        { name: 'Free Fire', href: '/products/free-fire' },
        { name: 'Call of Duty Mobile', href: '/products/cod-mobile' },
        { name: 'Mobile Legends', href: '/products/mobile-legends' },
      ],
    },
    {
      title: 'Gift Cards',
      links: [
        { name: 'Google Play', href: '/products/google-play' },
        { name: 'Amazon', href: '/products/amazon' },
        { name: 'Steam', href: '/products/steam' },
        { name: 'PlayStation', href: '/products/playstation' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Track Order', href: '/track' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Refund Policy', href: '/refund' },
      ],
    },
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Gamepad2 className="h-8 w-8 text-gaming-cyan" />
                <div className="absolute inset-0 h-8 w-8 bg-gaming-cyan/20 blur-sm rounded-full"></div>
              </div>
              <span className="font-bold text-xl font-orbitron text-gaming-cyan neon-text">
                GameTopUp
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Your trusted gaming platform for instant top-ups and gift cards. 
              Fast, secure, and reliable digital game currency delivery.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-gaming-purple" />
                <span>support@gametopup.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-gaming-purple" />
                <span>+880 1234-567890</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gaming-purple" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-gaming-cyan transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="trust-badge">
              <div className="trust-icon">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground">Secure Payment</h4>
              <p className="text-sm text-muted-foreground">SSL encrypted transactions</p>
            </div>

            <div className="trust-badge">
              <div className="trust-icon">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground">Instant Delivery</h4>
              <p className="text-sm text-muted-foreground">Get your items immediately</p>
            </div>

            <div className="trust-badge">
              <div className="trust-icon">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-foreground">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">Always here to help you</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} GameTopUp. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-gaming-cyan transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-gaming-cyan transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-sm text-muted-foreground hover:text-gaming-cyan transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
