'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DbService } from '@/lib/supabase';
import { 
  Shield, 
  Key, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Award,
  TrendingUp,
  FileCheck
} from 'lucide-react';

export default function Home() {
  const [settings, setSettings] = useState({
    company_name: 'Farook UAE Property Connect',
    phone: '+971 50 777 8888',
    email: 'farook@uaepropertyconnect.ae',
    office_address: 'Al Habtoor City, Amna Tower, Penthouse 4, Dubai, UAE'
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    DbService.getSettings().then(res => {
      if (res) {
        setSettings({
          company_name: res.company_name || settings.company_name,
          phone: res.phone || settings.phone,
          email: res.email || settings.email,
          office_address: res.office_address || settings.office_address
        });
      }
    });
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate contact form submission
    setContactSuccess(true);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <>
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden navy-bg-gradient py-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url('/dubai_luxury_villa.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-transparent to-primary-dark/50 z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold mb-6">
            ✨ Premium Private Matchmaking
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 max-w-5xl mx-auto leading-tight">
            Find the Right Buyer or Property <span className="gold-text-gradient block sm:inline">with Ease</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 font-light">
            An exclusive, 100% private portal for high-net-worth property sellers and buyers in the UAE. No public listings. No broker spam. Just direct lead matching managed personally by Farook.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              href="/sell"
              className="w-full sm:w-auto px-8 py-4 rounded-lg gold-bg-gradient text-primary-dark font-bold text-lg hover-gold-glow flex items-center justify-center space-x-2 transition-transform duration-300 hover:scale-105"
            >
              <span>🏠 Sell Property</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/buy"
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-transparent border-2 border-luxury-gold text-luxury-gold font-bold text-lg hover:bg-luxury-gold/10 flex items-center justify-center space-x-2 transition-transform duration-300 hover:scale-105"
            >
              <span>🏡 Buy Property</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Transactions Seeded', value: 'AED 3.8B+', icon: Award },
            { label: 'Privacy & Security Guarantee', value: '100%', icon: Shield },
            { label: 'Review & Match Lead Time', value: '24 Hours', icon: Key },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-effect rounded-xl p-8 flex items-center space-x-6 shadow-xl border-t-2 border-t-luxury-gold/40">
                <div className="p-4 rounded-lg bg-luxury-gold/10 text-luxury-gold">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground/60">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Process Flow</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">How It Works</p>
            <div className="h-1 w-20 bg-luxury-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Submit Private Form',
                desc: 'Fill out details about your property for sale or buying budget and requirements. The submission is entirely encrypted and private.',
                icon: FileCheck
              },
              {
                step: '02',
                title: 'Review & Verify',
                desc: 'Farook manually reviews each lead to ensure top quality, validating property locations and buyer budgets to verify compliance.',
                icon: Shield
              },
              {
                step: '03',
                title: 'Direct Private Matching',
                desc: 'We match buyer requirements directly with seller inventory in our database. Deals are closed off-market without public footprint.',
                icon: Users
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative group p-8 rounded-xl border border-card-border hover:border-luxury-gold/40 card-transition bg-luxury-gray dark:bg-primary-dark/40 shadow-sm hover:shadow-lg">
                  <div className="absolute top-4 right-6 text-6xl font-extrabold text-luxury-gold/10 group-hover:text-luxury-gold/25 transition-colors">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-luxury-gold/15 flex items-center justify-center text-luxury-gold mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-foreground/75 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-luxury-gray dark:bg-primary-dark/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Exclusivity Elevated</h2>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">Why High-Net-Worth Individuals Trust Farook Properties</p>
              <div className="h-1 w-20 bg-luxury-gold mb-8" />
              
              <div className="space-y-6">
                {[
                  {
                    title: '100% Absolute Privacy',
                    desc: 'Your listings and search requirements are visible ONLY to the admin. No indexing on Google, no public property boards.'
                  },
                  {
                    title: 'Bespoke Matching Algorithm',
                    desc: 'No automated systems. Farook personally handles the curation to ensure perfect alignment of expectations.'
                  },
                  {
                    title: 'Premium Quality Database',
                    desc: 'Highly verified buyers and ultra-luxury seller leads in prime UAE areas (Palm Jumeirah, Downtown Dubai, Dubai Hills).'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-luxury-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                      <p className="text-foreground/70 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-4/3 max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark/80 to-transparent z-10" />
              <img 
                src="/dubai_luxury_villa.jpg" 
                alt="Luxury UAE property" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                <span className="text-xs uppercase tracking-widest text-luxury-gold font-bold">Featured Listing</span>
                <h3 className="text-2xl font-bold mt-1">Direct Matchmaking Portfolio</h3>
                <p className="text-sm text-gray-300 mt-2">Private Luxury Mansions in Palm Jumeirah & Emirates Hills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT COMPANY */}
      <section id="about" className="py-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">About The Platform</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">Personally Curated by Farook</p>
          <div className="h-1 w-20 bg-luxury-gold mx-auto mb-8" />
          <p className="text-lg text-foreground/80 leading-relaxed font-light mb-8">
            In the UAE property market, privacy is the ultimate luxury. Public listings attract agent spam, drive prices down through duplicate ads, and compromise owner privacy. 
          </p>
          <p className="text-lg text-foreground/80 leading-relaxed font-light mb-8">
            <strong>Farook UAE Property Connect</strong> was established to bridge this gap. We provide a highly confidential real estate matchmaking framework where sellers list directly to Farook, and qualified buyers submit their precise mandates. Farook manages the connections privately, ensuring smooth, spam-free transactions.
          </p>
          <div className="flex justify-center space-x-8 text-left max-w-md mx-auto">
            <div className="border-l-2 border-luxury-gold pl-4">
              <div className="text-2xl font-bold text-foreground">AED 1.2M+</div>
              <div className="text-xs text-foreground/60 font-medium">Average Seller Price</div>
            </div>
            <div className="border-l-2 border-luxury-gold pl-4">
              <div className="text-2xl font-bold text-foreground">48 Hours</div>
              <div className="text-xs text-foreground/60 font-medium">Average Closing Match</div>
            </div>
            <div className="border-l-2 border-luxury-gold pl-4">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs text-foreground/60 font-medium">Spam Free Promise</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-luxury-gray dark:bg-primary-dark/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Client Reviews</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">What Our Clients Say</p>
            <div className="h-1 w-20 bg-luxury-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                quote: "Farook offered me complete privacy when selling my luxury villa in Emirates Hills. There were no public pictures online, which kept my property value intact. Within 48 hours, I was introduced to a verified cash buyer.",
                author: "Villa Owner",
                location: "Emirates Hills, Dubai"
              },
              {
                quote: "Finding off-market residential buildings in UAE is tough. Farook Property Connect allowed me to submit my specific area, budget, and purpose mandates. They connected me directly with the developer's private leads.",
                author: "Institutional Investor",
                location: "Abu Dhabi & Dubai Marina"
              }
            ].map((item, idx) => (
              <div key={idx} className="glass-effect rounded-xl p-8 relative shadow-md">
                <span className="absolute top-6 left-6 text-6xl text-luxury-gold/15 font-serif">“</span>
                <p className="text-foreground/80 italic text-base leading-relaxed mb-6 pl-6 relative z-10">
                  {item.quote}
                </p>
                <div className="flex items-center pl-6">
                  <div className="w-10 h-10 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center font-bold">
                    {item.author[0]}
                  </div>
                  <div className="ml-3">
                    <div className="font-bold text-foreground text-sm">{item.author}</div>
                    <div className="text-xs text-foreground/50">{item.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-24 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Support</h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Frequently Asked Questions</p>
            <div className="h-1 w-20 bg-luxury-gold mx-auto mt-4" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Who can see the property details I submit?",
                a: "Only Farook (the Admin) has access to your submissions. Your details will never be listed publicly, shared with third-party real estate platforms, or indexed by search engines. Row Level Security guarantees absolute data isolation."
              },
              {
                q: "Is there a fee for submitting properties or requirements?",
                a: "Submitting leads and buying requirements through this portal is completely free of charge. Standard transaction fees apply only when a direct matchmaking transaction is successfully closed."
              },
              {
                q: "How does the file upload security work?",
                a: "All images, videos, and PDF brochures are stored in a private Supabase Storage Bucket. The bucket is protected by security policies that restrict read/write access strictly to the Admin."
              },
              {
                q: "What properties are accepted?",
                a: "We accept premium villas, apartments, townhouses, penthouses, commercial buildings, lands, offices, and warehouses across all cities of UAE, including Dubai, Abu Dhabi, and Sharjah."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-card-border bg-luxury-gray/50 dark:bg-primary-dark/10">
                <h4 className="flex items-center text-lg font-bold text-foreground mb-2">
                  <HelpCircle className="w-5 h-5 text-luxury-gold mr-2.5 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-foreground/75 text-sm pl-7 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & OFFICE LOCATION */}
      <section id="contact" className="py-24 bg-luxury-gray dark:bg-primary-dark/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Get In Touch</h2>
              <p className="text-3xl font-bold tracking-tight text-foreground mb-6">Send a Message</p>
              <div className="h-1 w-20 bg-luxury-gold mb-8" />
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                    placeholder="Tell us about your property requirement..."
                  />
                </div>
                
                {contactSuccess && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-sm">
                    Thank you! Your message has been sent successfully. Farook will contact you shortly.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 rounded-lg gold-bg-gradient text-primary-dark font-bold hover-gold-glow transition-transform duration-300 hover:scale-102 flex items-center justify-center cursor-pointer"
                >
                  Send Private Message
                </button>
              </form>
            </div>

            {/* Office Info & Map */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-wider text-luxury-gold uppercase mb-2">Private Office</h2>
                <p className="text-3xl font-bold tracking-tight text-foreground mb-6">Location & Details</p>
                <div className="h-1 w-20 bg-luxury-gold mb-8" />
                
                <p className="text-foreground/80 mb-8 leading-relaxed">
                  Our private client advisory office is situated in Dubai, UAE. We welcome pre-scheduled face-to-face consultations with sellers and institutional buyers.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-luxury-gold mt-1 flex-shrink-0" />
                    <span className="text-foreground/80">{settings.office_address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                    <a href={`tel:${settings.phone}`} className="text-foreground/80 hover:text-luxury-gold transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                    <a href={`mailto:${settings.email}`} className="text-foreground/80 hover:text-luxury-gold transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Map Mock card */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-lg border border-card-border group">
                <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-8 text-center text-white select-none z-10">
                  <MapPin className="w-12 h-12 text-luxury-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-lg mb-2">Dubai Marina advisory hub</h4>
                  <p className="text-xs text-gray-400 max-w-sm mb-4"> Marina Plaza, Suite 2402, Dubai Marina, Dubai, UAE</p>
                  <a 
                    href="https://maps.google.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 rounded bg-luxury-gold text-primary-dark font-semibold text-xs tracking-wider uppercase hover:bg-luxury-gold-hover transition-colors"
                  >
                    Open Google Maps
                  </a>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25 z-0" />
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
