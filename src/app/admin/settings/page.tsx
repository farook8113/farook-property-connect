'use client';

import React, { useState, useEffect } from 'react';
import { DbService } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import { 
  Settings, 
  Lock, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  Loader2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Messages states
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    company_name: 'Farook UAE Property Connect',
    logo_url: '',
    phone: '+971 50 777 8888',
    email: 'farook@uaepropertyconnect.ae',
    office_address: 'Al Habtoor City, Amna Tower, Penthouse 4, Dubai, UAE',
    website_title: 'Farook UAE Property Connect - Private Lead Management',
    website_description: 'Luxury real estate property lead management platform for high-value properties in UAE.',
    email_notifications_enabled: false,
    resend_api_key: '',
    recipient_email: '',
    sender_email: 'onboarding@resend.dev'
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Load Settings
    DbService.getSettings().then(res => {
      if (res) {
        setSettingsForm({
          company_name: res.company_name || settingsForm.company_name,
          logo_url: res.logo_url || '',
          phone: res.phone || settingsForm.phone,
          email: res.email || settingsForm.email,
          office_address: res.office_address || settingsForm.office_address,
          website_title: res.website_title || settingsForm.website_title,
          website_description: res.website_description || settingsForm.website_description,
          email_notifications_enabled: res.email_notifications_enabled || false,
          resend_api_key: res.resend_api_key || '',
          recipient_email: res.recipient_email || '',
          sender_email: res.sender_email || 'onboarding@resend.dev'
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await DbService.updateSettings(settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);

    try {
      const session = AuthService.getCurrentSession();
      if (!session) {
        setPasswordError('Session expired. Please log in again.');
        return;
      }

      // Verify current password first
      const verify = await DbService.loginAdmin(session.email, passwordForm.currentPassword);
      if (!verify) {
        setPasswordError('Incorrect current password.');
        setSavingPassword(false);
        return;
      }

      // Perform update
      await DbService.updateAdminPassword(session.email, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-luxury-gold mx-auto mb-4" />
        <span className="text-xs text-foreground/60">Loading settings configurations...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Platform Configurations (2 Columns) */}
      <div className="lg:col-span-2 glass-effect rounded-2xl p-6 sm:p-8 shadow-sm border border-card-border space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center">
            <Settings className="w-5 h-5 text-luxury-gold mr-2" />
            Platform & Company Settings
          </h2>
          <p className="text-xs text-foreground/50 mt-1">Configure site metadata, brand details, and contact coordinates</p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Company Name</label>
              <input
                type="text"
                required
                value={settingsForm.company_name}
                onChange={e => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Logo URL (Optional)</label>
              <input
                type="url"
                value={settingsForm.logo_url}
                onChange={e => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Contact Phone Number</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-foreground/45" />
                </div>
                <input
                  type="text"
                  required
                  value={settingsForm.phone}
                  onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Office Email Address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-foreground/45" />
                </div>
                <input
                  type="email"
                  required
                  value={settingsForm.email}
                  onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Office Headquarters Address</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 items-start pointer-events-none">
                <MapPin className="h-4 w-4 text-foreground/45" />
              </div>
              <textarea
                rows={2}
                required
                value={settingsForm.office_address}
                onChange={e => setSettingsForm({ ...settingsForm, office_address: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
              />
            </div>
          </div>

          <div className="border-t border-card-border pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider flex items-center">
              <Mail className="w-4 h-4 mr-1.5" />
              Email Notifications Setup (Resend integration)
            </h3>
            
            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="email_notifications_enabled"
                checked={settingsForm.email_notifications_enabled}
                onChange={e => setSettingsForm({ ...settingsForm, email_notifications_enabled: e.target.checked })}
                className="w-5 h-5 text-luxury-gold bg-background border-card-border rounded focus:ring-luxury-gold accent-luxury-gold"
              />
              <label htmlFor="email_notifications_enabled" className="text-xs text-foreground/80 font-bold select-none cursor-pointer">
                Enable Instant Email Alerts on submissions
              </label>
            </div>
            <p className="text-[10px] text-foreground/45">
              Credentials are loaded securely from environment variables, keeping your Resend API configurations completely hidden and safe.
            </p>
          </div>

          <div className="border-t border-card-border pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider flex items-center">
              <Globe className="w-4 h-4 mr-1.5" />
              Search Engine Optimization (SEO)
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Website SEO Title</label>
              <input
                type="text"
                required
                value={settingsForm.website_title}
                onChange={e => setSettingsForm({ ...settingsForm, website_title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-2">Website SEO Meta Description</label>
              <textarea
                rows={3}
                required
                value={settingsForm.website_description}
                onChange={e => setSettingsForm({ ...settingsForm, website_description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
              />
            </div>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/35 text-xs font-semibold flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Settings updated successfully. Changes applied dynamically across landing and advisory pages!
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-card-border">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 rounded-lg gold-bg-gradient text-primary-dark font-bold text-xs flex items-center space-x-1.5 hover-gold-glow disabled:opacity-50 transition-all cursor-pointer"
            >
              {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Credentials Control (1 Column) */}
      <div className="glass-effect rounded-2xl p-6 sm:p-8 shadow-sm border border-card-border space-y-6 h-fit">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center">
            <Lock className="w-5 h-5 text-luxury-gold mr-2" />
            Security & Password
          </h2>
          <p className="text-xs text-foreground/50 mt-1">Modify your administrator access key</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
            />
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-lg bg-rose-500/15 text-rose-500 border border-rose-500/35 text-xs font-semibold flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/35 text-xs font-semibold flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Password updated successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-card-border font-bold text-xs flex justify-center items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Change password</span>
          </button>
        </form>

        <div className="p-4 bg-primary-navy/10 border border-primary-navy/40 rounded-xl space-y-2 text-xs">
          <div className="flex items-center text-luxury-gold font-bold">
            <ShieldCheck className="w-4.5 h-4.5 mr-1.5" />
            Secure Authentication
          </div>
          <p className="text-foreground/75 leading-relaxed">
            Changing your password updates it globally. Make sure to keep it secure as you will be logged out of your session on other devices.
          </p>
        </div>
      </div>

    </div>
  );
}
