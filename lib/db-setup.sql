-- ThinQ Chess Database Schema Setup
-- Execute this SQL in your Vercel Postgres database

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  tournament_fee DECIMAL(10,2) DEFAULT 400.00,
  registration_fee DECIMAL(10,2) DEFAULT 500.00,
  max_participants INTEGER DEFAULT 52,
  countdown_end_date TIMESTAMP,
  tournament_registration_active BOOLEAN DEFAULT false,
  course_registration_active BOOLEAN DEFAULT true,
  coming_soon_message TEXT DEFAULT 'Coming Soon! New tournament season starting soon.',
  tournament_types JSON DEFAULT '[
    {"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true},
    {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true},
    {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true},
    {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true},
    {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}
  ]'::json,
  payment_settings JSON DEFAULT '{"payment_mode": "razorpay", "razorpay_key_id": "rzp_live_z71oXRZ0avccLv", "razorpay_key_secret": "uNuvlB1ovlLeGTUmyBQi6qPU", "test_mode": false}'::json,
  google_settings JSON DEFAULT '{"places_api_key": "", "place_id_jp_nagar": "ChXdvpvpgI0jaOm_lM-Zf9XXYjM", "place_id_akshayanagar": "", "reviews_enabled": true}'::json,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  code_type VARCHAR(20) DEFAULT 'manual',
  prefix VARCHAR(10),
  email_domain VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  image_name VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  featured_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Registrations Table
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id SERIAL PRIMARY KEY,
  participant_first_name VARCHAR(255),
  participant_last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  dob DATE,
  gender VARCHAR(10),
  tournament_type VARCHAR(50) DEFAULT 'open',
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  amount_paid DECIMAL(10,2),
  discount_code VARCHAR(50),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin settings
INSERT INTO admin_settings (
  tournament_fee,
  registration_fee,
  max_participants,
  tournament_registration_active,
  course_registration_active,
  coming_soon_message
)
VALUES (
  400.00,
  500.00,
  52,
  false,
  true,
  'Coming Soon! Get ready for the biggest chess tournament of the year!'
)
ON CONFLICT DO NOTHING;

-- Insert default discount codes
INSERT INTO discount_codes (code, discount_percent, usage_limit) VALUES
('TC10', 10.00, 50),
('TC20', 20.00, 30),
('TCON15', 15.00, 100),
('STUDENT25', 25.00, 200),
('EARLY20', 20.00, 75)
ON CONFLICT (code) DO NOTHING;

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@thinqchess.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery_images(display_order);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_status ON tournament_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_date ON tournament_registrations(registered_at);
