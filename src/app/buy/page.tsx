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
  FileText, 
  ShieldCheck, 
  User, 
  Home, 
  DollarSign, 
  Upload, 
  Loader2,
  Trash2
} from 'lucide-react';

export default function BuyPropertyForm() {
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
    // Step 2: Requirements
    property_type_needed: 'Apartment',
    preferred_city: 'Dubai',
    preferred_community: '',
    bedrooms_required: '2',
    bathrooms_required: '2',
    // Step 3: Financials
    min_budget: '',
    max_budget: '',
    min_area: '',
    max_area: '',
    purpose: 'Investment',
    preferred_completion: 'Ready',
    payment_method: 'Cash',
    additional_requirements: '',
    agree_contact: false
  });

  // Files State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    setFileUploading(true);
    // Simulate upload to Supabase storage or mock URL
    setTimeout(() => {
      setUploadedFile({
        name: file.name,
        url: URL.createObjectURL(file), // Local temp preview URL
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'document'
      });
      setFileUploading(false);
    }, 1500);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleNext = () => {
    // Validation checks per step
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
      if (!formData.preferred_city) {
        setErrorMsg('Please specify a preferred city.');
        return;
      }
    } else if (step === 3) {
      if (!formData.max_budget) {
        setErrorMsg('Please enter your maximum budget.');
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
      const filesArray = uploadedFile ? [uploadedFile] : [];
      
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        nationality: formData.nationality,
        property_type_needed: formData.property_type_needed,
        preferred_city: formData.preferred_city,
        preferred_community: formData.preferred_community,
        min_budget: formData.min_budget ? Number(formData.min_budget) : null,
        max_budget: Number(formData.max_budget),
        min_area: formData.min_area ? Number(formData.min_area) : null,
        max_area: formData.max_area ? Number(formData.max_area) : null,
        bedrooms_required: Number(formData.bedrooms_required),
        bathrooms_required: Number(formData.bathrooms_required),
        purpose: formData.purpose,
        preferred_completion: formData.preferred_completion,
        payment_method: formData.payment_method,
        additional_requirements: formData.additional_requirements
      };

      await DbService.insertBuyerLead(payload, filesArray);
      
      // Fire email notification (non-blocking)
      EmailNotificationService.triggerBuyerLeadEmail(payload, filesArray);

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.');
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
              Submit Buyer <span className="gold-text-gradient">Requirements</span>
            </h1>
            <p className="text-sm text-foreground/60 max-w-lg mx-auto">
              Submit your property buying mandate privately. Farook will search our private database off-market to matching items.
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
                <h2 className="text-2xl font-bold text-foreground">Requirement Submitted Privately</h2>
                <p className="text-sm text-foreground/70 max-w-md mx-auto leading-relaxed">
                  Thank you, {formData.full_name}. Your property requirements have been successfully logged in our private CRM system. Farook will review the mandate within 24 hours.
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
                      {step === 2 && 'Mandate Details'}
                      {step === 3 && 'Financials & Preferences'}
                      {step === 4 && 'Confirm & Upload'}
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
                          placeholder="e.g. UAE, British, Indian"
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

                {/* STEP 2: Property requirements */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <Home className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Property Mandate</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Property Type Needed *</label>
                        <select
                          value={formData.property_type_needed}
                          onChange={e => setFormData({ ...formData, property_type_needed: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['Apartment', 'Villa', 'Townhouse', 'Commercial', 'Office', 'Warehouse', 'Land', 'Building'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Preferred City *</label>
                        <select
                          value={formData.preferred_city}
                          onChange={e => setFormData({ ...formData, preferred_city: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['Dubai', 'Abu Dhabi', 'Sharhab', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Preferred Community / Location</label>
                      <input
                        type="text"
                        value={formData.preferred_community}
                        onChange={e => setFormData({ ...formData, preferred_community: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        placeholder="e.g. Dubai Hills Estate, Palm Jumeirah, Downtown"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Bedrooms Required</label>
                        <select
                          value={formData.bedrooms_required}
                          onChange={e => setFormData({ ...formData, bedrooms_required: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['0', '1', '2', '3', '4', '5'].map(n => (
                            <option key={n} value={n}>{n === '0' ? 'Studio' : `${n} Bed`}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Bathrooms Required</label>
                        <select
                          value={formData.bathrooms_required}
                          onChange={e => setFormData({ ...formData, bathrooms_required: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          {['1', '2', '3', '4', '5'].map(n => (
                            <option key={n} value={n}>{n} Bath</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Financials */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Financials & Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Min Budget (AED)</label>
                        <input
                          type="number"
                          value={formData.min_budget}
                          onChange={e => setFormData({ ...formData, min_budget: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 1500000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Max Budget (AED) *</label>
                        <input
                          type="number"
                          required
                          value={formData.max_budget}
                          onChange={e => setFormData({ ...formData, max_budget: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 5000000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Min Area (Sq.Ft.)</label>
                        <input
                          type="number"
                          value={formData.min_area}
                          onChange={e => setFormData({ ...formData, min_area: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Max Area (Sq.Ft.)</label>
                        <input
                          type="number"
                          value={formData.max_area}
                          onChange={e => setFormData({ ...formData, max_area: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                          placeholder="e.g. 3000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Purpose</label>
                        <select
                          value={formData.purpose}
                          onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="Investment">Investment</option>
                          <option value="Personal Use">Personal Use</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Preferred Completion</label>
                        <select
                          value={formData.preferred_completion}
                          onChange={e => setFormData({ ...formData, preferred_completion: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="Ready">Ready Property</option>
                          <option value="Off-plan">Off-plan Property</option>
                          <option value="Any">Any Completion</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Payment Method</label>
                        <select
                          value={formData.payment_method}
                          onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="Cash">Cash Purchase</option>
                          <option value="Mortgage">Mortgage Required</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Confirm & Upload */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-card-border pb-4 flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-luxury-gold" />
                      <h3 className="font-bold text-lg">Documents & Confirm</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Additional Requirements / Notes</label>
                      <textarea
                        rows={4}
                        value={formData.additional_requirements}
                        onChange={e => setFormData({ ...formData, additional_requirements: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        placeholder="Any extra preferences (e.g., floor levels, private pool, specific developers, payment plan)..."
                      />
                    </div>

                    {/* Upload requirement document */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Upload Requirement Mandate PDF / Document</label>
                      
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-card-border border-dashed rounded-lg hover:border-luxury-gold transition-colors">
                        <div className="space-y-2 text-center">
                          <FileText className="mx-auto h-12 w-12 text-foreground/30" />
                          <div className="flex text-sm text-foreground/60 justify-center">
                            <label className="relative cursor-pointer bg-transparent rounded-md font-semibold text-luxury-gold hover:text-luxury-gold-hover focus-within:outline-none">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-foreground/40">
                            PDF, Word, or Image up to 10MB
                          </p>
                        </div>
                      </div>

                      {fileUploading && (
                        <div className="mt-3 flex items-center text-xs text-luxury-gold">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span>Uploading secure document...</span>
                        </div>
                      )}

                      {uploadedFile && (
                        <div className="mt-3 p-3 rounded bg-luxury-gold/10 border border-luxury-gold/30 flex justify-between items-center text-xs">
                          <span className="font-medium text-foreground truncate max-w-md">
                            📎 {uploadedFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-primary-dark/5 dark:bg-primary-navy/20 rounded-lg flex items-start space-x-3 border border-card-border">
                      <ShieldCheck className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-foreground/75 leading-relaxed">
                        <span className="font-bold text-foreground">Privacy Protection Policy</span>: This requirement is 100% private. It will never be visible to any other user, buyer, or seller. Only the platform owner Farook can view this requirement to map it against off-market listings.
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
                        I agree to be contacted regarding this property requirement mandate. *
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
                      disabled={loading || fileUploading}
                      className="px-8 py-3 rounded-lg gold-bg-gradient text-primary-dark font-bold hover-gold-glow disabled:opacity-50 flex items-center space-x-2 transition-transform duration-300 hover:scale-103 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Requirement</span>
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
