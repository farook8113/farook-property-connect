'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthService, AdminSession } from '@/lib/auth';
import { DbService } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Home, 
  Briefcase, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  User, 
  Sun, 
  Moon,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await DbService.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Theme sync
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Auth verification
    const activeSession = AuthService.getCurrentSession();
    if (!activeSession) {
      router.push('/admin-login');
      return;
    }
    setSession(activeSession);
    setLoading(false);

    // Load notifications
    loadNotifications();

    // Set interval to poll for new leads notifications (local dashboard notifications)
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleNotificationClick = async (notif: any) => {
    await DbService.markNotificationRead(notif.id);
    loadNotifications();
    setShowNotifications(false);
    
    // Redirect to the appropriate lead page
    if (notif.lead_type === 'seller') {
      router.push('/admin/sellers');
    } else {
      router.push('/admin/buyers');
    }
  };

  const handleMarkAllRead = async () => {
    await DbService.markAllNotificationsRead();
    loadNotifications();
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/admin-login');
  };

  const toggleTheme = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-luxury-gold border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400">
            Verifying Admin Session
          </h2>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Seller Leads', href: '/admin/sellers', icon: Home },
    { name: 'Buyer Leads', href: '/admin/buyers', icon: Briefcase },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-luxury-gray dark:bg-[#070e17] transition-colors duration-300">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-primary-dark text-white border-r border-primary-navy/40">
        <div className="h-20 flex items-center px-6 border-b border-primary-navy/40">
          <Link href="/" className="font-sans font-bold text-lg tracking-wider uppercase gold-text-gradient">
            FAROOK CRM
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-luxury-gold text-primary-dark font-bold shadow-md hover-gold-glow' 
                    : 'text-gray-400 hover:text-white hover:bg-primary-navy/30'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-primary-navy/40 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-9 h-9 rounded-full bg-luxury-gold/15 text-luxury-gold flex items-center justify-center font-bold">
              {session?.name[0].toUpperCase() || 'A'}
            </div>
            <div className="truncate max-w-[150px]">
              <div className="text-sm font-bold truncate">{session?.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{session?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & DRAWER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-background border-b border-card-border dark:bg-primary-dark/30 flex items-center justify-between px-4 sm:px-6 z-30 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-card-border hover:bg-card-border text-foreground/80 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-foreground md:ml-0">
              {pathname === '/admin' && 'CRM Dashboard'}
              {pathname === '/admin/sellers' && 'Seller Leads Panel'}
              {pathname === '/admin/buyers' && 'Buyer Mandates Panel'}
              {pathname === '/admin/settings' && 'System Settings'}
            </h1>
          </div>

          {/* Action header icons */}
          <div className="flex items-center space-x-3 relative">
            
            {/* Theme switch */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-card-border hover:bg-card-border text-foreground/80 hover:text-luxury-gold cursor-pointer"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full border border-card-border hover:bg-card-border text-foreground/80 hover:text-luxury-gold cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border border-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-card-border shadow-2xl glass-effect z-50 py-2">
                  <div className="px-4 py-3 border-b border-card-border flex justify-between items-center">
                    <span className="font-bold text-sm text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-luxury-gold hover:text-luxury-gold-hover cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-foreground/50">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 border-b border-card-border/50 flex space-x-3 cursor-pointer hover:bg-card-border/20 transition-colors ${
                            !notif.is_read ? 'bg-luxury-gold/5 border-l-2 border-l-luxury-gold' : ''
                          }`}
                        >
                          <div className="p-2 rounded bg-luxury-gold/10 text-luxury-gold h-8 w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {notif.lead_type === 'seller' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{notif.title}</div>
                            <p className="text-[11px] text-foreground/70 mt-0.5 line-clamp-2">{notif.message}</p>
                            <span className="text-[9px] text-foreground/40 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop link to main portal */}
            <Link
              href="/"
              className="hidden sm:flex px-4 py-2 border border-luxury-gold/40 hover:border-luxury-gold text-foreground/80 hover:text-luxury-gold text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
            >
              Public Portal
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="relative flex flex-col w-64 bg-primary-dark text-white h-full z-10 shadow-2xl transition-transform">
            <div className="h-20 flex items-center justify-between px-6 border-b border-primary-navy/40">
              <span className="font-sans font-bold text-lg tracking-wider uppercase gold-text-gradient">
                FAROOK CRM
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Links Mobile */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sidebarLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-luxury-gold text-primary-dark font-bold' 
                        : 'text-gray-400 hover:text-white hover:bg-primary-navy/30'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-primary-navy/40 space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
