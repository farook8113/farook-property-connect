'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthService } from '@/lib/auth';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If already authenticated, redirect to admin dashboard
    if (AuthService.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const success = await AuthService.login(email, password);
      if (success) {
        router.push('/admin');
      } else {
        setErrorMsg('Invalid email address or password.');
      }
    } catch (err: any) {
      setErrorMsg('An authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative navy-bg-gradient select-none">
      
      {/* Background visual overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3e62_1px,transparent_1px)] [background-size:24px_24px] opacity-10 z-0" />
      
      {/* Header back to home link */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          href="/" 
          className="flex items-center space-x-1 text-xs font-semibold tracking-wider text-gray-400 hover:text-white uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home Portal</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <span className="font-sans font-bold text-3xl tracking-wider uppercase gold-text-gradient">
            Farook UAE
          </span>
          <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-white uppercase">
            Private Lead Management CRM
          </h2>
          <p className="mt-2 text-center text-xs text-gray-400">
            Advisory Administration Portal Login
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-effect py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-card-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/35 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-card-border bg-slate-900/60 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold text-sm"
                  placeholder="admin@yourdomain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-card-border bg-slate-900/60 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold text-sm"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-dark gold-bg-gradient hover-gold-glow disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Log In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick instructions for preview */}
          <div className="mt-8 pt-6 border-t border-card-border/50 text-center">
            <h4 className="text-xs font-semibold text-luxury-gold uppercase tracking-wider mb-2">Default Preview Credentials</h4>
            <p className="text-[11px] text-gray-400">
              Email: <span className="text-white select-all font-mono">admin@yourdomain.com</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Password: <span className="text-white select-all font-mono">ChangeMe123</span>
            </p>
            <p className="text-[9px] text-gray-500 mt-4 leading-relaxed">
              These credentials can be updated from the settings tab in the CRM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
