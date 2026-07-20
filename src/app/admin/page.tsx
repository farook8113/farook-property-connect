'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DbService } from '@/lib/supabase';
import { 
  Users, 
  Home, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  ArrowUpRight,
  TrendingDown,
  Building
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [buyerLeads, setBuyerLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      DbService.getSellerLeads(),
      DbService.getBuyerLeads()
    ]).then(([sellers, buyers]) => {
      setSellerLeads(sellers || []);
      setBuyerLeads(buyers || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-card-border/30 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-card-border/30 rounded-xl" />
          <div className="h-96 bg-card-border/30 rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculating stats
  const totalSellers = sellerLeads.length;
  const totalBuyers = buyerLeads.length;
  const totalLeads = totalSellers + totalBuyers;

  const today = new Date().toISOString().split('T')[0];
  const isToday = (dateStr: string) => dateStr.startsWith(today);
  const isThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };
  const isThisMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const todayLeadsCount = [
    ...sellerLeads.filter(l => isToday(l.created_at)),
    ...buyerLeads.filter(l => isToday(l.created_at))
  ].length;

  const weeklyLeadsCount = [
    ...sellerLeads.filter(l => isThisWeek(l.created_at)),
    ...buyerLeads.filter(l => isThisWeek(l.created_at))
  ].length;

  const monthlyLeadsCount = [
    ...sellerLeads.filter(l => isThisMonth(l.created_at)),
    ...buyerLeads.filter(l => isThisMonth(l.created_at))
  ].length;

  // Average budget and pricing calculations
  const avgAskingPrice = totalSellers > 0 
    ? Math.round(sellerLeads.reduce((acc, curr) => acc + Number(curr.price || 0), 0) / totalSellers)
    : 0;

  const avgBuyerBudget = totalBuyers > 0 
    ? Math.round(buyerLeads.reduce((acc, curr) => acc + Number(curr.max_budget || 0), 0) / totalBuyers)
    : 0;

  // Location popularity compilation
  const locationCounts: Record<string, number> = {};
  sellerLeads.forEach(l => {
    if (l.community) {
      locationCounts[l.community] = (locationCounts[l.community] || 0) + 1;
    }
  });
  buyerLeads.forEach(l => {
    if (l.preferred_community) {
      locationCounts[l.preferred_community] = (locationCounts[l.preferred_community] || 0) + 1;
    }
  });

  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Property type demand compilation
  const typeCounts: Record<string, number> = {};
  sellerLeads.forEach(l => {
    if (l.property_type) {
      typeCounts[l.property_type] = (typeCounts[l.property_type] || 0) + 1;
    }
  });
  buyerLeads.forEach(l => {
    if (l.property_type_needed) {
      typeCounts[l.property_type_needed] = (typeCounts[l.property_type_needed] || 0) + 1;
    }
  });

  const totalTypesCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  // Combine recent activities
  const recentActivities = [
    ...sellerLeads.map(l => ({
      id: l.id,
      name: l.full_name,
      type: 'Seller Lead',
      detail: `${l.property_type} in ${l.city}`,
      time: new Date(l.created_at),
      status: l.status,
      href: '/admin/sellers'
    })),
    ...buyerLeads.map(l => ({
      id: l.id,
      name: l.full_name,
      type: 'Buyer Lead',
      detail: `${l.property_type_needed} preferred in ${l.preferred_city}`,
      time: new Date(l.created_at),
      status: l.status,
      href: '/admin/buyers'
    }))
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);

  // Growth percentages (simulated trend compared to past months, or simple metrics)
  const growthRate = totalLeads > 5 ? '+18.4%' : '+0%';

  return (
    <div className="space-y-8">
      
      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Seller Leads', 
            value: totalSellers, 
            desc: `${avgAskingPrice > 0 ? `Avg Asking AED ${avgAskingPrice.toLocaleString()}` : 'No active listings'}`, 
            icon: Home,
            color: 'text-blue-500 bg-blue-500/10'
          },
          { 
            title: 'Buyer Mandates', 
            value: totalBuyers, 
            desc: `${avgBuyerBudget > 0 ? `Avg Budget AED ${avgBuyerBudget.toLocaleString()}` : 'No mandates yet'}`, 
            icon: Briefcase,
            color: 'text-amber-500 bg-amber-500/10'
          },
          { 
            title: 'Leads Received Today', 
            value: todayLeadsCount, 
            desc: `${weeklyLeadsCount} received this week`, 
            icon: Calendar,
            color: 'text-emerald-500 bg-emerald-500/10'
          },
          { 
            title: 'Monthly Active Submissions', 
            value: monthlyLeadsCount, 
            desc: `Growth Trend: ${growthRate}`, 
            icon: TrendingUp,
            color: 'text-luxury-gold bg-luxury-gold/10'
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-effect rounded-xl p-6 shadow-sm border border-card-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-extrabold text-foreground mt-2">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-foreground/60 mt-4 font-medium">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CHARTS & DISTRIBUTION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEADS RATIO & ANALYSIS (LEFT PANEL) */}
        <div className="lg:col-span-2 glass-effect rounded-xl p-6 shadow-sm border border-card-border flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground mb-1">Lead Conversion & Distribution</h3>
            <p className="text-xs text-foreground/50 mb-6 font-medium">Comparison of buyer budget capabilities vs seller values</p>
          </div>

          <div className="space-y-6">
            
            {/* Visual Ratio Indicator */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-blue-500">SELLER LEADS ({totalSellers})</span>
                <span className="text-amber-500">BUYER LEADS ({totalBuyers})</span>
              </div>
              <div className="h-4 w-full bg-card-border rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 transition-all" 
                  style={{ width: `${totalLeads > 0 ? (totalSellers / totalLeads) * 100 : 50}%` }}
                  title="Sellers"
                />
                <div 
                  className="bg-amber-500 transition-all flex-1" 
                  title="Buyers"
                />
              </div>
            </div>

            {/* Custom SVG Trend Line Mock */}
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-foreground/60 mb-4 uppercase tracking-wider">Leads Receipt Trend (Last 6 Months)</h4>
              <div className="h-44 w-full relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(226, 232, 240, 0.15)" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="rgba(226, 232, 240, 0.15)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(226, 232, 240, 0.15)" strokeWidth="1" />
                  
                  {/* Paths */}
                  <path 
                    d="M 10 130 Q 100 110 200 80 T 400 40 T 490 20" 
                    fill="none" 
                    stroke="#D4AF37" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 10 130 Q 100 110 200 80 T 400 40 T 490 20 L 490 150 L 10 150 Z" 
                    fill="url(#goldGradient)" 
                    opacity="0.08" 
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Trend Dots */}
                  <circle cx="10" cy="130" r="4.5" fill="#0B192C" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="120" cy="105" r="4.5" fill="#0B192C" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="240" cy="75" r="4.5" fill="#0B192C" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="360" cy="45" r="4.5" fill="#0B192C" stroke="#D4AF37" strokeWidth="2" />
                  <circle cx="490" cy="20" r="4.5" fill="#0B192C" stroke="#D4AF37" strokeWidth="2" />
                </svg>
                
                {/* Labels */}
                <div className="flex justify-between text-[10px] text-foreground/40 mt-3 font-semibold px-2">
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DEMAND BY PROPERTY TYPE (RIGHT PANEL) */}
        <div className="glass-effect rounded-xl p-6 shadow-sm border border-card-border">
          <h3 className="font-bold text-base text-foreground mb-1">Demanded Property Types</h3>
          <p className="text-xs text-foreground/50 mb-6 font-medium">Distribution across all lead mandates</p>
          
          <div className="space-y-4">
            {Object.keys(typeCounts).length === 0 ? (
              <div className="text-center py-12 text-xs text-foreground/40">No lead categories found.</div>
            ) : (
              Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([type, count]) => {
                  const percent = totalTypesCount > 0 ? Math.round((count / totalTypesCount) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-xs font-semibold text-foreground/80 mb-1.5">
                        <span className="flex items-center">
                          <Building className="w-3.5 h-3.5 text-luxury-gold mr-1.5" />
                          {type}
                        </span>
                        <span>{percent}% ({count})</span>
                      </div>
                      <div className="h-2 w-full bg-card-border rounded-full overflow-hidden">
                        <div 
                          className="h-full gold-bg-gradient transition-all" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

      </div>

      {/* RECENT SUBMISSIONS & TOP COMMUNITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT LEADS (LEFT SIDE - 2 COLS) */}
        <div className="lg:col-span-2 glass-effect rounded-xl p-6 shadow-sm border border-card-border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-base text-foreground">Recent Submissions</h3>
              <p className="text-xs text-foreground/50 mt-0.5">Confidential database updates</p>
            </div>
            <Link 
              href="/admin/sellers"
              className="text-xs font-bold text-luxury-gold hover:text-luxury-gold-hover flex items-center space-x-1"
            >
              <span>View All Seller Leads</span>
              <ArrowUpRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border/60 text-foreground/50 uppercase font-semibold">
                  <th className="pb-3 font-semibold">Contact / Owner</th>
                  <th className="pb-3 font-semibold">Lead Type</th>
                  <th className="pb-3 font-semibold">Requirement Details</th>
                  <th className="pb-3 font-semibold">Submission Date</th>
                  <th className="pb-3 font-semibold">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-foreground/40">No lead activities registered.</td>
                  </tr>
                ) : (
                  recentActivities.map(act => (
                    <tr key={act.id} className="hover:bg-card-border/5 transition-colors">
                      <td className="py-3.5 font-bold text-foreground">{act.name}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.type === 'Seller Lead' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-foreground/75 truncate max-w-[180px]">{act.detail}</td>
                      <td className="py-3.5 text-foreground/60">{act.time.toLocaleDateString()}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          act.status === 'New' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP COMMUNITIES MAP (RIGHT SIDE - 1 COL) */}
        <div className="glass-effect rounded-xl p-6 shadow-sm border border-card-border flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground mb-1">Top UAE Communities</h3>
            <p className="text-xs text-foreground/50 mb-6 font-medium">Most active locations submitted</p>
          </div>

          <div className="space-y-4">
            {sortedLocations.length === 0 ? (
              <div className="text-center py-12 text-xs text-foreground/40">No locations logged.</div>
            ) : (
              sortedLocations.map(([loc, count], idx) => (
                <div key={loc} className="flex justify-between items-center py-2 border-b border-card-border/40 last:border-0">
                  <div className="flex items-center text-xs font-semibold text-foreground/80">
                    <span className="w-5 h-5 rounded-full bg-luxury-gold/15 text-luxury-gold flex items-center justify-center font-bold text-[10px] mr-2">
                      {idx + 1}
                    </span>
                    <span>{loc}</span>
                  </div>
                  <span className="text-xs text-foreground/50 font-bold">{count} {count === 1 ? 'Lead' : 'Leads'}</span>
                </div>
              ))
            )}
          </div>

          {/* Empty spacer just to keep aesthetic align */}
          <div className="h-4" />
        </div>

      </div>

    </div>
  );
}
