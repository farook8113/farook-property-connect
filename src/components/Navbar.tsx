'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, Home, Briefcase, Lock } from 'lucide-react';
import { DbService } from '@/lib/supabase';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [companyName, setCompanyName] = useState('Farook UAE Property Connect');

  useEffect(() => {
    // Dark mode sync
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Load Settings
    DbService.getSettings().then(settings => {
      if (settings && settings.company_name) {
        setCompanyName(settings.company_name);
      }
    });
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-header w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-sans font-bold text-lg sm:text-2xl tracking-wide uppercase gold-text-gradient">
                {companyName}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link
              href="/sell"
              className="text-foreground/80 hover:text-luxury-gold font-medium transition-colors flex items-center space-x-1"
            >
              <Home className="w-4 h-4" />
              <span>Sell Property</span>
            </Link>
            <Link
              href="/buy"
              className="text-foreground/80 hover:text-luxury-gold font-medium transition-colors flex items-center space-x-1"
            >
              <Briefcase className="w-4 h-4" />
              <span>Buy Property</span>
            </Link>
            <Link
              href="#about"
              className="text-foreground/80 hover:text-luxury-gold font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-foreground/80 hover:text-luxury-gold font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Actions: Theme Toggle & Admin Login */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 rounded-full border border-card-border hover:bg-card-border transition-colors text-foreground/80 hover:text-luxury-gold cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <Link
              href="/admin-login"
              className="flex items-center space-x-1 p-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-foreground/60 hover:text-luxury-gold transition-colors"
              title="Admin Portal"
            >
              <Lock className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-luxury-gold sm:text-inherit" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>

            <Link
              href="/sell"
              className="px-5 py-2.5 rounded-md gold-bg-gradient text-primary-dark font-semibold text-sm transition-transform duration-300 hover:scale-105 hover-gold-glow flex items-center space-x-1"
            >
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
