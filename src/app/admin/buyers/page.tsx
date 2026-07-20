'use client';

import React, { useState, useEffect } from 'react';
import { DbService } from '@/lib/supabase';
import { 
  Search, 
  Download, 
  Trash2, 
  Check, 
  Eye, 
  Edit, 
  X, 
  Phone, 
  Mail, 
  FileText, 
  Loader2, 
  User, 
  Briefcase,
  Sparkles,
  ClipboardList,
  DollarSign
} from 'lucide-react';

export default function BuyerLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCity, setFilterCity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterBeds, setFilterBeds] = useState('All');

  // Selected Lead Modal State
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Notes state
  const [notesList, setNotesList] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [leadFiles, setLeadFiles] = useState<any[]>([]);

  // Editing state
  const [editForm, setEditForm] = useState({
    status: '',
    max_budget: 0,
    preferred_community: '',
    additional_requirements: '',
    payment_method: 'Cash'
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await DbService.getBuyerLeads();
      setLeads(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...leads];

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.full_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.preferred_community && l.preferred_community.toLowerCase().includes(q))
      );
    }

    // Dropdown filters
    if (filterType !== 'All') {
      result = result.filter(l => l.property_type_needed === filterType);
    }
    if (filterCity !== 'All') {
      result = result.filter(l => l.preferred_city === filterCity);
    }
    if (filterStatus !== 'All') {
      result = result.filter(l => l.status === filterStatus);
    }
    if (filterBeds !== 'All') {
      result = result.filter(l => String(l.bedrooms_required) === filterBeds);
    }

    setFilteredLeads(result);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchQuery, filterType, filterCity, filterStatus, filterBeds]);

  const handleViewLead = async (lead: any) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
    // Load notes and files for lead
    const [notes, files] = await Promise.all([
      DbService.getLeadNotes(lead.id),
      DbService.getLeadFiles(lead.id)
    ]);
    setNotesList(notes || []);
    setLeadFiles(files || []);
  };

  const handleOpenEdit = (lead: any) => {
    setSelectedLead(lead);
    setEditForm({
      status: lead.status,
      max_budget: lead.max_budget,
      preferred_community: lead.preferred_community || '',
      additional_requirements: lead.additional_requirements || '',
      payment_method: lead.payment_method || 'Cash'
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setSavingEdit(true);

    try {
      await DbService.updateBuyerLeadStatus(selectedLead.id, editForm.status);
      
      // Update local state
      setLeads(prev => prev.map(l => 
        l.id === selectedLead.id 
          ? { ...l, status: editForm.status, max_budget: editForm.max_budget, preferred_community: editForm.preferred_community, additional_requirements: editForm.additional_requirements, payment_method: editForm.payment_method }
          : l
      ));
      
      setEditModalOpen(false);
      if (viewModalOpen) {
        setSelectedLead((prev: any) => ({
          ...prev,
          status: editForm.status,
          max_budget: editForm.max_budget,
          preferred_community: editForm.preferred_community,
          additional_requirements: editForm.additional_requirements,
          payment_method: editForm.payment_method
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this buyer lead?')) return;
    try {
      await DbService.deleteBuyerLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) {
        setViewModalOpen(false);
        setEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShortcutStatus = async (id: string, status: string) => {
    try {
      await DbService.updateBuyerLeadStatus(id, status);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedLead) return;
    setAddingNote(true);

    try {
      const added = await DbService.addLeadNote(selectedLead.id, 'buyer', newNote.trim());
      setNotesList(prev => [...prev, added]);
      setNewNote('');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingNote(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = [
      'Submission Date', 'Buyer Name', 'Phone', 'Email', 'Nationality', 
      'Property Type Needed', 'Preferred City', 'Preferred Community', 
      'Min Budget (AED)', 'Max Budget (AED)', 'Min Area (SqFt)', 'Max Area (SqFt)', 
      'Bedrooms Required', 'Purpose', 'Payment Method', 'Status'
    ];

    const rows = filteredLeads.map(l => [
      new Date(l.created_at).toLocaleDateString(),
      l.full_name,
      l.phone,
      l.email,
      l.nationality || '',
      l.property_type_needed,
      l.preferred_city,
      l.preferred_community || '',
      l.min_budget || '',
      l.max_budget,
      l.min_area || '',
      l.max_area || '',
      l.bedrooms_required,
      l.purpose || '',
      l.payment_method || '',
      l.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `farook_buyer_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLead = () => {
    window.print();
  };

  const statusColors: Record<string, string> = {
    'New': 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25',
    'Contacted': 'bg-blue-500/10 text-blue-500 border border-blue-500/25',
    'Interested': 'bg-violet-500/10 text-violet-500 border border-violet-500/25',
    'Follow-up': 'bg-orange-500/10 text-orange-500 border border-orange-500/25',
    'Negotiation': 'bg-pink-500/10 text-pink-500 border border-pink-500/25',
    'Closed': 'bg-teal-500/10 text-teal-500 border border-teal-500/25',
    'Rejected': 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER PANEL */}
      <div className="glass-effect rounded-xl p-5 shadow-sm border border-card-border space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-foreground/45" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
              placeholder="Search by buyer name, phone, email, or community..."
            />
          </div>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
            className="w-full sm:w-auto px-5 py-3 rounded-lg gold-bg-gradient text-primary-dark font-bold text-xs flex items-center justify-center space-x-1.5 hover-gold-glow disabled:opacity-50 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Property Type Needed</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none text-xs"
            >
              <option value="All">All Types</option>
              {['Apartment', 'Villa', 'Townhouse', 'Commercial', 'Office', 'Warehouse', 'Land', 'Building'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Preferred City</label>
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none text-xs"
            >
              <option value="All">All Cities</option>
              {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Lead Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none text-xs"
            >
              <option value="All">All Statuses</option>
              {['New', 'Contacted', 'Interested', 'Follow-up', 'Negotiation', 'Closed', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Bedrooms Required</label>
            <select
              value={filterBeds}
              onChange={e => setFilterBeds(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none text-xs"
            >
              <option value="All">All Bedrooms</option>
              {['0', '1', '2', '3', '4', '5'].map(b => (
                <option key={b} value={b}>{b === '0' ? 'Studio' : `${b} Bed`}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="glass-effect rounded-xl shadow-sm border border-card-border overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-luxury-gold mx-auto mb-4" />
            <span className="text-xs text-foreground/60">Fetching private mandates...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-24 text-center text-foreground/50 text-xs">
            No buyer requirements found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border/70 text-foreground/50 uppercase font-semibold">
                  <th className="p-4">Buyer Info</th>
                  <th className="p-4">Mandate details</th>
                  <th className="p-4">Preferred Areas</th>
                  <th className="p-4">Max Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-card-border/10 transition-colors">
                    
                    <td className="p-4">
                      <div className="font-bold text-foreground text-sm">{lead.full_name}</div>
                      <div className="text-[11px] text-foreground/75 mt-0.5">{lead.phone}</div>
                      <div className="text-[10px] text-foreground/50">{lead.email}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-foreground">{lead.property_type_needed}</div>
                      <div className="text-[11px] text-foreground/60 mt-0.5">
                        Req: {lead.bedrooms_required === 0 ? 'Studio' : `${lead.bedrooms_required} Bed`} • {lead.bathrooms_required} Bath • {lead.purpose} • {lead.payment_method}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-foreground">{lead.preferred_community || 'Any Community'}</div>
                      <div className="text-[11px] text-foreground/50">{lead.preferred_city}</div>
                    </td>

                    <td className="p-4 font-bold text-foreground">
                      AED {Number(lead.max_budget).toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${statusColors[lead.status] || 'bg-slate-500/10'}`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewLead(lead)}
                          className="p-1.5 rounded bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 hover:bg-luxury-gold/25 transition-colors cursor-pointer"
                          title="View mandate profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/25 transition-colors cursor-pointer"
                          title="Edit Mandate"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShortcutStatus(lead.id, 'Contacted')}
                          className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/25 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW LEAD MODAL */}
      {viewModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setViewModalOpen(false)} />
          
          <div className="relative bg-background border border-card-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl p-6 sm:p-8 space-y-8 print:border-none print:shadow-none print:bg-white print:text-black">
            
            <div className="flex justify-between items-center border-b border-card-border pb-4 print:hidden">
              <span className="text-xs uppercase tracking-wider text-luxury-gold font-bold flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Confidential Buyer Requirement Mandate Profile
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintLead}
                  className="px-4 py-2 border border-card-border hover:bg-card-border rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print PDF mandate</span>
                </button>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 rounded-lg border border-card-border hover:bg-card-border text-foreground/70 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center pb-6 border-b border-gray-300">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-black">FAROOK UAE PROPERTY CONNECT</h1>
              <p className="text-xs text-gray-500 mt-1">CONFIDENTIAL BUYER MANDATE PROFILE - PRIVATE CRM ACCESS ONLY</p>
              <p className="text-xs text-gray-400 mt-0.5">Date Created: {new Date(selectedLead.created_at).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Side */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Mandate for {selectedLead.property_type_needed} preferred in {selectedLead.preferred_city}
                  </h2>
                  <p className="text-xs text-foreground/50 mt-1">Submitted on {new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Preferred City', val: selectedLead.preferred_city },
                    { label: 'Preferred Community', val: selectedLead.preferred_community || 'Any Community' },
                    { label: 'Min Budget', val: selectedLead.min_budget ? `AED ${Number(selectedLead.min_budget).toLocaleString()}` : 'N/A' },
                    { label: 'Max Budget', val: `AED ${Number(selectedLead.max_budget).toLocaleString()}` },
                    { label: 'Min Area Requirement', val: selectedLead.min_area ? `${selectedLead.min_area} SqFt` : 'N/A' },
                    { label: 'Max Area Requirement', val: selectedLead.max_area ? `${selectedLead.max_area} SqFt` : 'N/A' },
                    { label: 'Bedrooms Required', val: selectedLead.bedrooms_required === 0 ? 'Studio' : `${selectedLead.bedrooms_required} Bed` },
                    { label: 'Bathrooms Required', val: selectedLead.bathrooms_required },
                    { label: 'Purpose', val: selectedLead.purpose || 'N/A' },
                    { label: 'Preferred Completion', val: selectedLead.preferred_completion || 'Any' },
                    { label: 'Payment Method', val: selectedLead.payment_method || 'Cash' },
                  ].map((spec, i) => (
                    <div key={i} className="p-3 border border-card-border rounded-lg text-center bg-luxury-gray/30 dark:bg-primary-dark/10">
                      <div className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">{spec.label}</div>
                      <div className="text-sm font-bold text-foreground mt-1 truncate">{spec.val}</div>
                    </div>
                  ))}
                </div>

                {/* Additional requirements */}
                {selectedLead.additional_requirements && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider mb-2">Additional Mandate Requirements</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-luxury-gray/50 dark:bg-primary-dark/20 p-4 rounded-xl border border-card-border">
                      {selectedLead.additional_requirements}
                    </p>
                  </div>
                )}

                {/* Uploaded Files */}
                {leadFiles && leadFiles.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider mb-3">Uploaded Mandate Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
                      {leadFiles.map((file, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-card-border bg-luxury-gray/50 dark:bg-primary-dark/30 flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2 truncate mr-2">
                            <span className="text-base">
                              {file.file_type === 'image' && '🖼️'}
                              {file.file_type === 'video' && '🎥'}
                              {file.file_type === 'pdf' && '📄'}
                            </span>
                            <span className="font-medium text-foreground truncate max-w-[150px]" title={file.file_name}>
                              {file.file_name}
                            </span>
                          </div>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded bg-luxury-gold text-primary-dark font-bold text-[10px] uppercase hover:bg-luxury-gold-hover transition-colors"
                          >
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side */}
              <div className="space-y-6">
                
                {/* Buyer Card */}
                <div className="p-5 border border-card-border rounded-xl bg-luxury-gray dark:bg-primary-dark/30 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider pb-2 border-b border-card-border flex items-center">
                    <User className="w-4 h-4 mr-1.5" />
                    Buyer Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="font-bold text-foreground text-sm">{selectedLead.full_name}</div>
                      <div className="text-foreground/45 mt-0.5">Nationality: {selectedLead.nationality || 'N/A'}</div>
                    </div>
                    <div className="flex items-center space-x-2 text-foreground/80">
                      <Phone className="w-4 h-4 text-luxury-gold" />
                      <a href={`tel:${selectedLead.phone}`} className="hover:underline">{selectedLead.phone}</a>
                    </div>
                    <div className="flex items-center space-x-2 text-foreground/80">
                      <Mail className="w-4 h-4 text-luxury-gold" />
                      <a href={`mailto:${selectedLead.email}`} className="hover:underline truncate">{selectedLead.email}</a>
                    </div>
                  </div>
                </div>

                {/* Budget card */}
                <div className="p-5 border border-card-border rounded-xl bg-luxury-gold/5 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider flex items-center">
                    <DollarSign className="w-4 h-4 text-luxury-gold" />
                    Target Budget Limit
                  </div>
                  <div className="text-2xl font-black text-foreground">AED {Number(selectedLead.max_budget).toLocaleString()}</div>
                </div>

                {/* Private Admin Notes */}
                <div className="p-5 border border-card-border rounded-xl bg-background/50 space-y-4 print:hidden">
                  <h3 className="text-xs font-bold uppercase text-luxury-gold tracking-wider pb-2 border-b border-card-border flex items-center">
                    <ClipboardList className="w-4 h-4 mr-1.5" />
                    Private Admin Notes
                  </h3>
                  
                  <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                    {notesList.length === 0 ? (
                      <p className="text-[10px] text-foreground/40 italic">No notes logged for this buyer yet.</p>
                    ) : (
                      notesList.map(note => (
                        <div key={note.id} className="p-2.5 rounded bg-luxury-gray dark:bg-primary-dark/20 border border-card-border text-[11px] text-foreground/85">
                          <p className="leading-relaxed">{note.note_text}</p>
                          <span className="text-[9px] text-foreground/40 mt-1 block">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      required
                      rows={2}
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Add confidential internal note..."
                      className="w-full px-3 py-2 text-xs rounded border border-card-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                    />
                    <button
                      type="submit"
                      disabled={addingNote}
                      className="w-full py-2 bg-luxury-gold text-primary-dark font-bold text-xs rounded hover:bg-luxury-gold-hover transition-colors cursor-pointer"
                    >
                      {addingNote ? 'Adding...' : 'Save Notes'}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          
          <div className="relative bg-background border border-card-border rounded-2xl w-full max-w-lg z-10 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="font-bold text-lg text-foreground uppercase tracking-wider flex items-center">
                <Edit className="w-5 h-5 text-luxury-gold mr-2" />
                Edit Buyer Mandate details
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-lg border border-card-border hover:bg-card-border text-foreground/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Max Target Budget (AED)</label>
                <input
                  type="number"
                  required
                  value={editForm.max_budget}
                  onChange={e => setEditForm({ ...editForm, max_budget: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Preferred Communities</label>
                <input
                  type="text"
                  required
                  value={editForm.preferred_community}
                  onChange={e => setEditForm({ ...editForm, preferred_community: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Payment Method</label>
                <select
                  value={editForm.payment_method}
                  onChange={e => setEditForm({ ...editForm, payment_method: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                >
                  <option value="Cash">Cash Purchase</option>
                  <option value="Mortgage">Mortgage Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Lead Management Stage</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                >
                  {['New', 'Contacted', 'Interested', 'Follow-up', 'Negotiation', 'Closed', 'Rejected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1.5">Additional Requirements</label>
                <textarea
                  rows={3}
                  value={editForm.additional_requirements}
                  onChange={e => setEditForm({ ...editForm, additional_requirements: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-luxury-gold text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-card-border hover:bg-card-border font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-lg gold-bg-gradient text-primary-dark font-bold text-xs flex items-center space-x-1.5 hover-gold-glow disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
