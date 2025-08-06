-- ThinQ Chess Supabase Database Setup
-- Run this SQL in Supabase SQL Editor

-- ==================== CREATE TABLES ====================

-- Create registrations table for both tournament and course registrations
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('tournament', 'course')),

    -- Participant Information
    participant_first_name VARCHAR(100) NOT NULL,
    participant_last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    -- Tournament specific fields
    dob DATE,
    gender VARCHAR(10),
    fida_id VARCHAR(50),
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    location TEXT,

    -- Course specific fields
    age INTEGER,
    course_type VARCHAR(50),

    -- Tournament/Course Reference
    tournament_id INTEGER REFERENCES tournaments(id),

    -- Payment Information
    amount_paid INTEGER NOT NULL,
    discount_code VARCHAR(50),
    discount_amount INTEGER DEFAULT 0,
    payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',

    -- Additional data for course registrations (JSON field)
    additional_data JSONB,

    -- Timestamps
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start_date DATE NOT NULL,
    registration_end_date DATE NOT NULL,
    max_participants INTEGER DEFAULT 50,
    entry_fee INTEGER NOT NULL,
    venue VARCHAR(255),
    rules TEXT,
    prizes TEXT,
    tournament_types TEXT[], -- Array of tournament categories
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(type);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_dates ON tournaments(registration_start_date, registration_end_date);

-- 1. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id BIGSERIAL PRIMARY KEY,
  image_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tournament Registrations Table
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  chess_experience TEXT NOT NULL,
  tournament_type TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGSERIAL PRIMARY KEY,
  tournament_fee DECIMAL(10,2) DEFAULT 500,
  registration_fee DECIMAL(10,2) DEFAULT 400,
  max_participants INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INSERT DEFAULT DATA ====================

-- Insert default admin settings
INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
VALUES (500, 400, 50)
ON CONFLICT DO NOTHING;

-- Insert sample blog for testing
INSERT INTO blogs (title, content, excerpt, slug, status, featured_image)
VALUES (
  'Welcome to ThinQ Chess Academy',
  'Welcome to our chess academy! We provide world-class chess training for players of all levels.',
  'Join our chess academy for expert training and tournaments.',
  'welcome-to-thinq-chess',
  'published',
  '/images/indian-img-one.jpg'
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample gallery images
INSERT INTO gallery_images (image_name, image_url, category, display_order)
VALUES 
  ('Chess Training Session', '/images/indian-img-one.jpg', 'training', 1),
  ('Tournament Winners', '/images/indian-img-two.jpg', 'tournaments', 2),
  ('Chess Academy', '/images/indian-img-three.jpg', 'academy', 3)
ON CONFLICT DO NOTHING;

-- ==================== ENABLE ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- ==================== CREATE SECURITY POLICIES ====================

-- Blogs Policies
CREATE POLICY "Public read published blogs" ON blogs
  FOR SELECT USING (status = 'published');

CREATE POLICY "Service role full access blogs" ON blogs
  FOR ALL USING (auth.role() = 'service_role');

-- Gallery Images Policies
CREATE POLICY "Public read gallery images" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Service role full access gallery" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');

-- Tournament Registrations Policies (Admin only)
CREATE POLICY "Service role full access registrations" ON tournament_registrations
  FOR ALL USING (auth.role() = 'service_role');

-- Admin Settings Policies (Admin only)
CREATE POLICY "Service role full access admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

-- ==================== CREATE STORAGE BUCKETS ====================

-- Note: Storage buckets need to be created via Supabase Dashboard
-- Go to Storage > Create Bucket and create these:
-- 1. blog-images (Public)
-- 2. gallery-images (Public) 
-- 3. general-uploads (Public)

-- ==================== STORAGE POLICIES ====================

-- Blog Images Bucket Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images');

-- Gallery Images Bucket Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read gallery images storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery-images');

-- General Uploads Bucket Policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('general-uploads', 'general-uploads', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read general uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'general-uploads');

CREATE POLICY "Authenticated upload general files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'general-uploads');

CREATE POLICY "Authenticated delete general files" ON storage.objects
  FOR DELETE USING (bucket_id = 'general-uploads');

-- ==================== CREATE FUNCTIONS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blogs_updated_at 
  BEFORE UPDATE ON blogs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at 
  BEFORE UPDATE ON admin_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SETUP COMPLETE ====================
-- All tables, policies, and storage buckets are now ready!
-- Enable production mode in your .env.local file:
-- DEVELOPMENT_MODE="false"
-- NEXT_PUBLIC_DEVELOPMENT_MODE="false"
