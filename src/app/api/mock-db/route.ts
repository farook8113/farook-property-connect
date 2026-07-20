import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.join(process.cwd(), 'mock_db.json');

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

const getInitialDb = () => ({
  sellerLeads: [],
  buyerLeads: [],
  notes: [],
  notifications: [],
  settings: defaultSettings,
  admins: defaultAdmins,
  files: []
});

export async function GET() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return NextResponse.json(initial);
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure critical defaults exist
    if (!parsed.settings) parsed.settings = defaultSettings;
    if (!parsed.admins || parsed.admins.length === 0) parsed.admins = defaultAdmins;
    if (!parsed.files) parsed.files = [];
    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json(getInitialDb());
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
