-- ThinQ Chess - Final SQL Commands for Supabase
-- Copy and paste this entire SQL in Supabase SQL Editor

-- ==================== CREATE TABLES ====================

-- 1. Blogs Table
CREATE TABLE blogs (
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
CREATE TABLE gallery_images (
  id BIGSERIAL PRIMARY KEY,
  image_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tournament Registrations Table
CREATE TABLE tournament_registrations (
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
CREATE TABLE admin_settings (
  id BIGSERIAL PRIMARY KEY,
  tournament_fee DECIMAL(10,2) DEFAULT 500,
  registration_fee DECIMAL(10,2) DEFAULT 400,
  max_participants INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INSERT SAMPLE DATA ====================

-- Insert default admin settings
INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
VALUES (500, 400, 50);

-- Insert sample blog
INSERT INTO blogs (title, content, excerpt, slug, status, featured_image, author)
VALUES (
  'Welcome to ThinQ Chess Academy',
  'Welcome to our chess academy! We provide world-class chess training for players of all levels. Our expert coaches will help you improve your game and achieve your chess goals. Join us for an exciting journey in the world of chess!',
  'Join our chess academy for expert training and tournaments.',
  'welcome-to-thinq-chess',
  'published',
  '/images/indian-img-one.jpg',
  'Admin'
);

-- Insert sample gallery images
INSERT INTO gallery_images (image_name, image_url, category, display_order)
VALUES 
  ('Chess Training Session', '/images/indian-img-one.jpg', 'training', 1),
  ('Tournament Winners', '/images/indian-img-two.jpg', 'tournaments', 2),
  ('Chess Academy Students', '/images/indian-img-three.jpg', 'academy', 3),
  ('Chess Board Setup', '/images/indian-img-one.jpg', 'equipment', 4),
  ('Group Training', '/images/indian-img-two.jpg', 'training', 5);

-- Insert sample registration for testing
INSERT INTO tournament_registrations (
  full_name, email, phone, age, chess_experience, tournament_type, payment_status, amount
)
VALUES (
  'Test Player',
  'test@example.com',
  '+91-9876543210',
  25,
  'Intermediate',
  'Rapid Tournament',
  'completed',
  500.00
);

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

-- Tournament Registrations Policies (Service role only)
CREATE POLICY "Service role full access registrations" ON tournament_registrations
  FOR ALL USING (auth.role() = 'service_role');

-- Admin Settings Policies (Service role only)
CREATE POLICY "Service role full access admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

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

-- ==================== VERIFY SETUP ====================

-- Check if all tables are created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('blogs', 'gallery_images', 'tournament_registrations', 'admin_settings');

-- Check sample data
SELECT 'blogs' as table_name, count(*) as record_count FROM blogs
UNION ALL
SELECT 'gallery_images', count(*) FROM gallery_images
UNION ALL
SELECT 'tournament_registrations', count(*) FROM tournament_registrations
UNION ALL
SELECT 'admin_settings', count(*) FROM admin_settings;

-- ==================== SETUP COMPLETE ====================
-- All tables, policies, and sample data are now ready!
-- Your ThinQ Chess website is now powered by Supabase!
