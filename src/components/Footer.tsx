'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Lock } from 'lucide-react';
import { DbService } from '@/lib/supabase';

export default function Footer() {
  const [settings, setSettings] = useState({
    company_name: 'Farook UAE Property Connect',
    phone: '+971 50 777 8888',
    email: 'farook@uaepropertyconnect.ae',
    office_address: 'Al Habtoor City, Amna Tower, Penthouse 4, Dubai, UAE',
    website_description: 'Luxury real estate property lead management platform for high-value properties in UAE.'
  });

  useEffect(() => {
    DbService.getSettings().then(res => {
      if (res) {
        setSettings(prev => ({
          ...prev,
          company_name: res.company_name || prev.company_name,
          phone: res.phone || prev.phone,
          email: res.email || prev.email,
          office_address: res.office_address || prev.office_address,
          website_description: res.website_description || prev.website_description
        }));
      }
    });
  }, []);

  return (
    <footer className="bg-primary-dark text-white border-t border-primary-navy/40 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-sans font-bold text-2xl tracking-wide uppercase gold-text-gradient block">
              {settings.company_name}
            </span>
            <p className="text-gray-400 text-sm max-w-sm">
              {settings.website_description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-luxury-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/sell" className="hover:text-luxury-gold transition-colors">
                  Sell Property (Private Submission)
                </Link>
              </li>
              <li>
                <Link href="/buy" className="hover:text-luxury-gold transition-colors">
                  Submit Buy Requirements
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-luxury-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-luxury-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-luxury-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-luxury-gold font-semibold uppercase tracking-wider text-sm mb-4">
              Private Office
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                <span>{settings.office_address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-luxury-gold transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-luxury-gold flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-luxury-gold transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-navy/40 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-luxury-gold transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-luxury-gold transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/admin-login" className="flex items-center space-x-1 hover:text-luxury-gold transition-colors">
              <Lock className="w-3 h-3" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
