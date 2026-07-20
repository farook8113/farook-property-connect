'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DbService } from '@/lib/supabase';
import { EmailNotificationService } from '@/lib/notifications';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  Home, 
  Tag, 
  Upload, 
  Loader2,
  Trash2,
  Image as ImageIcon,
  FileText,
  Video,
  ShieldCheck
} from 'lucide-react';

export default function SellPropertyForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: '',
    phone: '',
    email: '',
    nationality: '',
    // Step 2: Basic Property
    property_type: 'Apartment',
    title: '',
    description: '',
    city: 'Dubai',
    community: '',
    area: '',
    address: '',
    google_maps_link: '',
    // Step 3: Specs & Price
    bedrooms: '2',
    bathrooms: '2',
    built_up_area: '',
    plot_area: '',
    parking_spaces: '1',
    furnished: false,
    ready_property: true,
    condition: 'Excellent',
    price: '',
    service_charges: '',
    additional_features: [] as string[],
    additional_notes: '',
    agree_contact: false
  });

  // Files State
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Features list
  const availableFeatures = [
    'Private Pool', 'Shared Gym', 'Maid\'s Room', 'Study Room', 
    'Sea View', 'Golf Course View', 'Private Garden', 'Beach Access',
    'Balcony', 'Covered Parking', 'Central A/C', 'Security 24/7'
  ];

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const exists = prev.additional_features.includes(feature);
      const updated = exists 
        ? prev.additional_features.filter(f => f !== feature)
        : [...prev.additional_features, feature];
      return { ...prev, additional_features: updated };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video' | 'pdf') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fileType === 'image' && uploadedFiles.filter(f => f.type === 'image').length + files.length > 20) {
      alert('You can upload up to 20 images maximum.');
      return;
    }

    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newUploads: { name: string; url: string; type: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        newUploads.push({
          name: file.name,
          url: URL.createObjectURL(file), // Mock URL
          type: fileType
        });
      }
      setUploadedFiles(prev => [...prev, ...newUploads]);
      setUploading(false);
    }, 2000);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.phone || !formData.email) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    } else if (step === 2) {
      if (!formData.title || !formData.description || !formData.city || !formData.community) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
    } else if (step === 3) {
      if (!formData.price) {
        setErrorMsg('Please enter your asking price.');
        return;
      }
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agree_contact) {
      setErrorMsg('You must agree to be contacted to submit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        nationality: formData.nationality,
        property_type: formData.property_type,
        title: formData.title,
        description: formData.description,
        city: formData.city,
        community: formData.community,
        area: formData.area,
        address: formData.address,
        google_maps_link: formData.google_maps_link,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        built_up_area: formData.built_up_area ? Number(formData.built_up_area) : null,
        plot_area: formData.plot_area ? Number(formData.plot_area) : null,
        parking_spaces: Number(formData.parking_spaces),
        furnished: formData.furnished,
        ready_property: formData.ready_property,
        condition: formData.condition,
        price: Number(formData.price),
        service_charges: formData.service_charges ? Number(formData.service_charges) : null,
        additional_features: formData.additional_features,
        additional_notes: formData.additional_notes
      };

      await DbService.insertSellerLead(payload, uploadedFiles);
      
      // Fire email notification (non-blocking)
      EmailNotificationService.triggerSellerLeadEmail(payload, uploadedFiles);

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-luxury-gray dark:bg-primary-dark/10 py-16 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Private Property <span className="gold-text-gradient">Submission</span>
            </h1>
            <p className="text-sm text-foreground/60 max-w-lg mx-auto">
              List your UAE property privately. Only Farook can view this lead. No public portal indexes it. Perfect secrecy.
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-effect rounded-2xl p-8 sm:p-10 shadow-xl border border-card-border">
            
            {/* SUCCESS STATE */}
            {success ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Property Submitted Privately</h2>
                <p className="text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
                  Thank you, {formData.full_name}. Your property submission has been successfully uploaded to Farook\'s lead management CRM. Only the Admin has access. Farook will review it shortly.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 rounded-lg gold-bg-gradient text-primary-dark font-bold hover-gold-glow transition-all cursor-pointer"
                  >
                    Return to Homepage
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="flex justify-between items-center text-xs font-semibold text-foreground/50 mb-3">
                    <span>STEP {step} OF 4</span>
                    <span className="text-luxury-gold uppercase tracking-wider">
                      {step === 1 && 'Personal Info'}
                      {step === 2 && 'Property Location'}
                      {step === 3 && 'Specs & Pricing'}
                      {step === 4 && 'Media & Confirm'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-card-border rounded-full overflow-hidden">
                    <div 
                      className="h-full gold-bg-gradient transition-all duration-500" 
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* STEP 1: Personal Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Personal Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Nationality</label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. UAE, British, Russian"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="+971 50 123 4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Basic Property */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <Home className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Property Details & Location</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="sm:col-span-1">
                        <label className="block text-sm font-semibold mb-2">Property Type *</label>
                        <select
                          value={formData.property_type}
                          onChange={e => setFormData({ ...formData, property_type: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['Apartment', 'Villa', 'Townhouse', 'Commercial', 'Office', 'Warehouse', 'Land', 'Building'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Property Title / Short Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. Modern 3-Bed Villa with Skyline View"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Property Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        placeholder="Detailed overview about rooms, finishes, views, location advantages..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">City *</label>
                        <select
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Community *</label>
                        <input
                          type="text"
                          required
                          value={formData.community}
                          onChange={e => setFormData({ ...formData, community: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. Dubai Hills Estate"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Area / Sub-community</label>
                        <input
                          type="text"
                          value={formData.area}
                          onChange={e => setFormData({ ...formData, area: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. Maple 3"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="Street number, Villa/Apt details"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Google Maps Link</label>
                        <input
                          type="url"
                          value={formData.google_maps_link}
                          onChange={e => setFormData({ ...formData, google_maps_link: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Specs & Pricing */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Property Specifications & Pricing</h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Bedrooms</label>
                        <select
                          value={formData.bedrooms}
                          onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['0', '1', '2', '3', '4', '5', '6', '7'].map(n => (
                            <option key={n} value={n}>{n === '0' ? 'Studio' : `${n} Bed`}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Bathrooms</label>
                        <select
                          value={formData.bathrooms}
                          onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['1', '2', '3', '4', '5', '6', '7'].map(n => (
                            <option key={n} value={n}>{n} Bath</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Built-up Area (SqFt)</label>
                        <input
                          type="number"
                          value={formData.built_up_area}
                          onChange={e => setFormData({ ...formData, built_up_area: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 1500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Plot Area (SqFt)</label>
                        <input
                          type="number"
                          value={formData.plot_area}
                          onChange={e => setFormData({ ...formData, plot_area: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 3500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Parking Spaces</label>
                        <input
                          type="number"
                          value={formData.parking_spaces}
                          onChange={e => setFormData({ ...formData, parking_spaces: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Condition</label>
                        <select
                          value={formData.condition}
                          onChange={e => setFormData({ ...formData, condition: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['Brand New', 'Excellent', 'Good', 'Needs Renovation'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="furnished"
                          checked={formData.furnished}
                          onChange={e => setFormData({ ...formData, furnished: e.target.checked })}
                          className="w-5 h-5 text-luxury-gold bg-background border-card-border rounded focus:ring-luxury-gold accent-luxury-gold"
                        />
                        <label htmlFor="furnished" className="text-sm font-semibold select-none cursor-pointer">Furnished</label>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="ready_property"
                          checked={formData.ready_property}
                          onChange={e => setFormData({ ...formData, ready_property: e.target.checked })}
                          className="w-5 h-5 text-luxury-gold bg-background border-card-border rounded focus:ring-luxury-gold accent-luxury-gold"
                        />
                        <label htmlFor="ready_property" className="text-sm font-semibold select-none cursor-pointer">Ready Property</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Asking Price (AED) *</label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 2400000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Service Charges (AED/annum)</label>
                        <input
                          type="number"
                          value={formData.service_charges}
                          onChange={e => setFormData({ ...formData, service_charges: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 15000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3">Additional Features</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {availableFeatures.map(feat => {
                          const active = formData.additional_features.includes(feat);
                          return (
                            <button
                              key={feat}
                              type="button"
                              onClick={() => handleFeatureToggle(feat)}
                              className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                                active 
                                  ? 'bg-luxury-gold/15 border-luxury-gold text-foreground' 
                                  : 'bg-background border-card-border text-foreground/60 hover:border-luxury-gold/50'
                              }`}
                            >
                              {feat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Media & Confirm */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Property Media & Confirm</h3>
                    </div>

                    {/* Media File Uploads */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      
                      {/* Image Upload */}
                      <div className="p-5 border-2 border-card-border border-dashed rounded-xl hover:border-luxury-gold transition-colors text-center space-y-2">
                        <ImageIcon className="w-8 h-8 text-foreground/30 mx-auto" />
                        <span className="block text-xs font-semibold">Images (Max 20)</span>
                        <label className="inline-block px-3 py-1 bg-luxury-gold/15 text-luxury-gold text-xs font-bold rounded cursor-pointer hover:bg-luxury-gold/25">
                          Browse
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={e => handleFileUpload(e, 'image')}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {/* Video Upload */}
                      <div className="p-5 border-2 border-card-border border-dashed rounded-xl hover:border-luxury-gold transition-colors text-center space-y-2">
                        <Video className="w-8 h-8 text-foreground/30 mx-auto" />
                        <span className="block text-xs font-semibold">Videos</span>
                        <label className="inline-block px-3 py-1 bg-luxury-gold/15 text-luxury-gold text-xs font-bold rounded cursor-pointer hover:bg-luxury-gold/25">
                          Browse
                          <input
                            type="file"
                            accept="video/*"
                            onChange={e => handleFileUpload(e, 'video')}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {/* PDF Brochure Upload */}
                      <div className="p-5 border-2 border-card-border border-dashed rounded-xl hover:border-luxury-gold transition-colors text-center space-y-2">
                        <FileText className="w-8 h-8 text-foreground/30 mx-auto" />
                        <span className="block text-xs font-semibold">PDF Brochure</span>
                        <label className="inline-block px-3 py-1 bg-luxury-gold/15 text-luxury-gold text-xs font-bold rounded cursor-pointer hover:bg-luxury-gold/25">
                          Browse
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={e => handleFileUpload(e, 'pdf')}
                            className="sr-only"
                          />
                        </label>
                      </div>

                    </div>

                    {uploading && (
                      <div className="flex items-center text-xs text-luxury-gold">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Uploading files securely...</span>
                      </div>
                    )}

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground/60 mb-2">Uploaded Media Files:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="p-3 rounded bg-luxury-gold/10 border border-luxury-gold/30 flex justify-between items-center text-xs">
                              <span className="font-medium text-foreground truncate max-w-[200px]">
                                {file.type === 'image' && '🖼️ '}
                                {file.type === 'video' && '🎥 '}
                                {file.type === 'pdf' && '📄 '}
                                {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold mb-2">Additional Notes / Remarks</label>
                      <textarea
                        rows={3}
                        value={formData.additional_notes}
                        onChange={e => setFormData({ ...formData, additional_notes: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        placeholder="Any other private notes or specific contact instructions..."
                      />
                    </div>

                    <div className="p-4 bg-primary-dark/5 dark:bg-primary-navy/20 rounded-lg flex items-start space-x-3 border border-card-border">
                      <ShieldCheck className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-foreground/75 leading-relaxed">
                        <span className="font-bold text-foreground">Confidentiality Guarantee</span>: This listing is 100% private. It will not be posted on any public marketplace. Only Farook can view this file list and the specs to connect you directly with qualified private buyers.
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="agree_contact"
                        checked={formData.agree_contact}
                        onChange={e => setFormData({ ...formData, agree_contact: e.target.checked })}
                        className="w-5 h-5 text-luxury-gold bg-background border-card-border rounded focus:ring-luxury-gold accent-luxury-gold"
                      />
                      <label htmlFor="agree_contact" className="text-xs text-foreground/80 font-medium select-none cursor-pointer">
                        I agree to be contacted regarding this property listing. *
                      </label>
                    </div>
                  </div>
                )}

                {/* Actions Nav */}
                <div className="flex justify-between items-center pt-6 border-t border-card-border">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-lg border border-card-border hover:bg-card-border text-foreground font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-lg gold-bg-gradient text-primary-dark font-bold hover-gold-glow flex items-center space-x-2 transition-transform duration-300 hover:scale-103 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="px-8 py-3 rounded-lg gold-bg-gradient text-primary-dark font-bold hover-gold-glow disabled:opacity-50 flex items-center space-x-2 transition-transform duration-300 hover:scale-103 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Listing</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </form>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
