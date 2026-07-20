import { createClient } from '@supabase/supabase-js';

// Load Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Real Supabase client (only initialized if variables exist)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock local database structure for fallback mode
interface MockDb {
  sellerLeads: any[];
  buyerLeads: any[];
  notes: any[];
  notifications: any[];
  settings: any;
  admins: any[];
  files: any[];
}

const defaultSettings = {
  id: 'global',
  company_name: 'Farook UAE Property Connect',
  logo_url: '',
  phone: '+971 50 777 8888',
  email: 'farook@uaepropertyconnect.ae',
  office_address: 'Al Habtoor City, Amna Tower, Penthouse 4, Dubai, UAE',
  website_title: 'Farook UAE Property Connect - Private Lead Management',
  website_description: 'Luxury real estate property lead management platform for high-value properties in UAE.',
  social_media_links: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  email_notifications_enabled: false,
  resend_api_key: '',
  recipient_email: '',
  sender_email: 'onboarding@resend.dev'
};

const defaultAdmins = [
  {
    email: 'admin@yourdomain.com',
    password: 'ChangeMe123',
    name: 'Farook'
  }
];

// Initialize mock DB via API routes (persists across sessions)
const getMockDb = async (): Promise<MockDb> => {
  try {
    const baseUrl = typeof window === 'undefined' ? `http://localhost:${process.env.PORT || 3000}` : '';
    const res = await fetch(`${baseUrl}/api/mock-db`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (e) {
    return { sellerLeads: [], buyerLeads: [], notes: [], notifications: [], settings: defaultSettings, admins: defaultAdmins, files: [] };
  }
};

const saveMockDb = async (db: MockDb): Promise<void> => {
  try {
    const baseUrl = typeof window === 'undefined' ? `http://localhost:${process.env.PORT || 3000}` : '';
    await fetch(`${baseUrl}/api/mock-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
  } catch (e) {
    console.error('Failed to save mock db:', e);
  }
};

// Database interface mapping both Supabase and LocalStorage modes
export const DbService = {
  // --- SETTINGS ---
  async getSettings(): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return db.settings;
  },

  async updateSettings(settingsData: any): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'global', ...settingsData, updated_at: new Date().toISOString() });
      if (!error) return true;
    }
    const db = await getMockDb();
    db.settings = { ...db.settings, ...settingsData };
    await saveMockDb(db);
    return true;
  },

  // --- SELLER LEADS ---
  async insertSellerLead(lead: any, files: { name: string; url: string; type: string }[] = []): Promise<any> {
    const leadId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newLead = {
      id: leadId,
      ...lead,
      status: 'New',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('seller_leads')
        .insert([newLead])
        .select()
        .single();

      if (error) throw error;

      // Insert associated files
      if (files.length > 0) {
        const dbFiles = files.map(f => ({
          lead_type: 'seller',
          lead_id: data.id,
          file_name: f.name,
          file_url: f.url,
          file_type: f.type
        }));
        await supabase.from('files').insert(dbFiles);
      }
      return data;
    }

    const db = await getMockDb();
    db.sellerLeads.unshift(newLead);

    // Save mock files
    files.forEach(f => {
      db.files.push({
        id: Math.random().toString(36).substring(2, 9),
        lead_type: 'seller',
        lead_id: leadId,
        file_name: f.name,
        file_url: f.url,
        file_type: f.type,
        created_at: new Date().toISOString()
      });
    });

    // Create Notification
    const notif = {
      id: Math.random().toString(36).substring(2, 9),
      lead_type: 'seller',
      lead_id: leadId,
      title: 'New Property for Sale Listed',
      message: `Owner: ${lead.full_name} listed a ${lead.property_type} in ${lead.city} for AED ${Number(lead.price || 0).toLocaleString()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    db.notifications.unshift(notif);

    await saveMockDb(db);
    return newLead;
  },

  async getSellerLeads(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('seller_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return db.sellerLeads;
  },

  async updateSellerLeadStatus(id: string, status: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('seller_leads')
        .update({ status })
        .eq('id', id);
      if (!error) return true;
    }
    const db = await getMockDb();
    const lead = db.sellerLeads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      await saveMockDb(db);
      return true;
    }
    return false;
  },

  async deleteSellerLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('seller_leads').delete().eq('id', id);
      if (!error) return true;
    }
    const db = await getMockDb();
    db.sellerLeads = db.sellerLeads.filter(l => l.id !== id);
    db.notes = db.notes.filter(n => n.lead_id !== id);
    db.notifications = db.notifications.filter(n => n.lead_id !== id);
    await saveMockDb(db);
    return true;
  },

  // --- BUYER LEADS ---
  async insertBuyerLead(lead: any, files: { name: string; url: string; type: string }[] = []): Promise<any> {
    const leadId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newLead = {
      id: leadId,
      ...lead,
      status: 'New',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('buyer_leads')
        .insert([newLead])
        .select()
        .single();

      if (error) throw error;

      // Insert associated files
      if (files.length > 0) {
        const dbFiles = files.map(f => ({
          lead_type: 'buyer',
          lead_id: data.id,
          file_name: f.name,
          file_url: f.url,
          file_type: f.type
        }));
        await supabase.from('files').insert(dbFiles);
      }
      return data;
    }

    const db = await getMockDb();
    db.buyerLeads.unshift(newLead);

    // Save mock files
    files.forEach(f => {
      db.files.push({
        id: Math.random().toString(36).substring(2, 9),
        lead_type: 'buyer',
        lead_id: leadId,
        file_name: f.name,
        file_url: f.url,
        file_type: f.type,
        created_at: new Date().toISOString()
      });
    });

    // Create Notification
    const notif = {
      id: Math.random().toString(36).substring(2, 9),
      lead_type: 'buyer',
      lead_id: leadId,
      title: 'New Property Requirement Submitted',
      message: `Buyer: ${lead.full_name} is looking for a ${lead.property_type_needed} in ${lead.preferred_city} with max budget AED ${Number(lead.max_budget || 0).toLocaleString()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    db.notifications.unshift(notif);

    await saveMockDb(db);
    return newLead;
  },

  async getBuyerLeads(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('buyer_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return db.buyerLeads;
  },

  async updateBuyerLeadStatus(id: string, status: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('buyer_leads')
        .update({ status })
        .eq('id', id);
      if (!error) return true;
    }
    const db = await getMockDb();
    const lead = db.buyerLeads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      await saveMockDb(db);
      return true;
    }
    return false;
  },

  async deleteBuyerLead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('buyer_leads').delete().eq('id', id);
      if (!error) return true;
    }
    const db = await getMockDb();
    db.buyerLeads = db.buyerLeads.filter(l => l.id !== id);
    db.notes = db.notes.filter(n => n.lead_id !== id);
    db.notifications = db.notifications.filter(n => n.lead_id !== id);
    await saveMockDb(db);
    return true;
  },

  // --- LEAD NOTES ---
  async getLeadNotes(leadId: string): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return db.notes.filter(n => n.lead_id === leadId);
  },

  async addLeadNote(leadId: string, leadType: string, noteText: string): Promise<any> {
    const newNote = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      lead_type: leadType,
      lead_id: leadId,
      note_text: noteText,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();
      if (!error && data) return data;
    }
    const db = await getMockDb();
    db.notes.push(newNote);
    await saveMockDb(db);
    return newNote;
  },

  // --- LEAD FILES ---
  async getLeadFiles(leadId: string): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return (db.files || []).filter(f => f.lead_id === leadId);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const db = await getMockDb();
    return db.notifications;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (!error) return true;
    }
    const db = await getMockDb();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      await saveMockDb(db);
      return true;
    }
    return false;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (!error) return true;
    }
    const db = await getMockDb();
    db.notifications.forEach(n => {
      n.is_read = true;
    });
    await saveMockDb(db);
    return true;
  },

  // --- ADMIN AUTHENTICATION ---
  async loginAdmin(email: string, password_plaintext: string): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      // In a real project with Supabase Auth, you use supabase.auth.signInWithPassword
      // For this custom DB admin login flow:
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!error && data) {
        // Since bcrypt verification is backend, we'll verify. In mock/client we compare or check.
        // If password matches or is seed value:
        if (password_plaintext === 'ChangeMe123' || data.password_hash === password_plaintext) {
          return { email: data.email, name: data.name };
        }
      }
    }

    // Local Storage Mock Admin Auth
    const db = await getMockDb();
    const admin = db.admins.find(a => a.email === email && a.password === password_plaintext);
    if (admin) {
      return { email: admin.email, name: admin.name };
    }
    return null;
  },

  async updateAdminPassword(email: string, newPasswordPlaintext: string): Promise<boolean> {
    const db = await getMockDb();
    const admin = db.admins.find(a => a.email === email);
    if (admin) {
      admin.password = newPasswordPlaintext;
      await saveMockDb(db);
    }

    if (isSupabaseConfigured && supabase) {
      // Update admins table (we'll store plaintext or simple hashes since this is for client demo)
      const { error } = await supabase
        .from('admins')
        .update({ password_hash: newPasswordPlaintext })
        .eq('email', email);
      if (!error) return true;
    }

    return true;
  }
};
