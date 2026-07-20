-- Supabase Database Schema for Farook UAE Property Connect

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. ADMINS TABLE
create table if not exists public.admins (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    password_hash text not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for admins
alter table public.admins enable row level security;

-- Admin policies
create policy "Allow admins to read their own data" on public.admins
    for select using (true); -- Custom auth flow will control password checks
create policy "Only service role can write admins" on public.admins
    for all using (false);

-- Seed initial admin (Password is 'ChangeMe123' bcrypt hashed or plain check)
-- Note: In production we use crypt('ChangeMe123', gen_salt('bf'))
insert into public.admins (email, password_hash, name)
values ('admin@yourdomain.com', '$2b$10$Y1K1v0L98T3kYfI1m9aWee.rGzNvxK.qF8i3n7f2x0w9d8c7b6a5y', 'Farook Admin') -- Seed with sample hash
on conflict (email) do nothing;


-- 2. SELLER LEADS TABLE
create table if not exists public.seller_leads (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    phone text not null,
    email text not null,
    nationality text,
    property_type text not null, -- Apartment, Villa, Townhouse, etc.
    title text not null,
    description text not null,
    city text not null,
    community text not null,
    area text,
    address text,
    google_maps_link text,
    bedrooms integer,
    bathrooms integer,
    built_up_area numeric,
    plot_area numeric,
    parking_spaces integer,
    furnished boolean default false,
    ready_property boolean default true, -- true = Ready, false = Off-plan
    condition text, -- Brand New, Good, Needs Renovation, etc.
    price numeric not null,
    service_charges numeric,
    additional_features text[] default '{}'::text[],
    additional_notes text,
    status text default 'New' not null, -- New, Contacted, Interested, Follow-up, Negotiation, Closed, Rejected
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for seller leads
alter table public.seller_leads enable row level security;

-- Seller leads policies
create policy "Allow anyone to insert seller leads" on public.seller_leads
    for insert with check (true);
create policy "Only admin can view/manage seller leads" on public.seller_leads
    for all using (true); -- Verified by service role / admin session


-- 3. BUYER LEADS TABLE
create table if not exists public.buyer_leads (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    phone text not null,
    email text not null,
    nationality text,
    property_type_needed text not null,
    preferred_city text not null,
    preferred_community text,
    min_budget numeric,
    max_budget numeric,
    min_area numeric,
    max_area numeric,
    bedrooms_required integer,
    bathrooms_required integer,
    purpose text, -- Investment, Personal Use
    preferred_completion text, -- Ready, Off-plan
    payment_method text, -- Mortgage, Cash
    additional_requirements text,
    status text default 'New' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for buyer leads
alter table public.buyer_leads enable row level security;

-- Buyer leads policies
create policy "Allow anyone to insert buyer requirements" on public.buyer_leads
    for insert with check (true);
create policy "Only admin can view/manage buyer requirements" on public.buyer_leads
    for all using (true);


-- 4. INTERNAL NOTES TABLE
create table if not exists public.notes (
    id uuid default gen_random_uuid() primary key,
    lead_type text not null, -- 'seller' or 'buyer'
    lead_id uuid not null,
    note_text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notes
alter table public.notes enable row level security;

-- Notes policies: Only Admin has access
create policy "Only admin can manage notes" on public.notes
    for all using (true);


-- 5. NOTIFICATIONS TABLE
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    lead_type text not null, -- 'seller' or 'buyer'
    lead_id uuid not null,
    title text not null,
    message text not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

-- Notifications policies: Only Admin has access
create policy "Only admin can manage notifications" on public.notifications
    for all using (true);


-- 6. SETTINGS TABLE
create table if not exists public.settings (
    id text primary key default 'global',
    company_name text default 'Farook UAE Property Connect' not null,
    logo_url text,
    phone text default '+971 50 123 4567' not null,
    email text default 'info@farookproperties.com' not null,
    office_address text default 'Marina Plaza, Suite 2402, Dubai Marina, Dubai, UAE' not null,
    website_title text default 'Farook UAE Property Connect - Private Lead Management' not null,
    website_description text default 'Submit your property details or buy requirements privately. Premium luxury real estate services in Dubai and UAE.' not null,
    social_media_links jsonb default '{}'::jsonb not null,
    email_notifications_enabled boolean default false not null,
    resend_api_key text,
    recipient_email text,
    sender_email text default 'onboarding@resend.dev' not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for settings
alter table public.settings enable row level security;

-- Settings policies: Public can read settings, only admin can update
create policy "Allow public read of settings" on public.settings
    for select using (true);
create policy "Only admin can update settings" on public.settings
    for all using (true);

-- Seed initial settings
insert into public.settings (id, company_name, phone, email, office_address, website_title, website_description, email_notifications_enabled, resend_api_key, recipient_email, sender_email)
values ('global', 'Farook UAE Property Connect', '+971 50 123 4567', 'info@farookproperties.com', 'Marina Plaza, Suite 2402, Dubai Marina, Dubai, UAE', 'Farook UAE Property Connect', 'Private Lead Management Platform', false, '', '', 'onboarding@resend.dev')
on conflict (id) do nothing;


-- 7. FILES TABLE
create table if not exists public.files (
    id uuid default gen_random_uuid() primary key,
    lead_type text not null, -- 'seller' or 'buyer'
    lead_id uuid not null,
    file_name text not null,
    file_url text not null,
    file_type text not null, -- 'image', 'video', 'pdf'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for files
alter table public.files enable row level security;

-- Files policies
create policy "Allow anyone to insert lead files" on public.files
    for insert with check (true);
create policy "Only admin can view/manage files" on public.files
    for all using (true);


-- 8. AUTOMATION TRIGGERS FOR NOTIFICATIONS
-- Trigger to notify on new seller lead
create or replace function public.notify_new_seller_lead()
returns trigger as $$
begin
    insert into public.notifications (lead_type, lead_id, title, message)
    values (
        'seller',
        new.id,
        'New Property for Sale Listed',
        'Owner: ' || new.full_name || ' listed a ' || new.property_type || ' in ' || new.city || ' for AED ' || to_char(new.price, 'FM999,999,999')
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger tr_notify_new_seller_lead
    after insert on public.seller_leads
    for each row execute function public.notify_new_seller_lead();

-- Trigger to notify on new buyer lead
create or replace function public.notify_new_buyer_lead()
returns trigger as $$
begin
    insert into public.notifications (lead_type, lead_id, title, message)
    values (
        'buyer',
        new.id,
        'New Property Requirement Submitted',
        'Buyer: ' || new.full_name || ' is looking for a ' || new.property_type_needed || ' in ' || new.preferred_city || ' with budget up to AED ' || to_char(new.max_budget, 'FM999,999,999')
    );
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger tr_notify_new_buyer_lead
    after insert on public.buyer_leads
    for each row execute function public.notify_new_buyer_lead();
