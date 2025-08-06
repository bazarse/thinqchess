-- ThinQ Chess Database Setup
-- Run this in PostgreSQL to create all required tables

-- Create database (run this first)
-- CREATE DATABASE thinqchess;

-- Connect to thinqchess database and run below commands:

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    tournament_registration_active BOOLEAN DEFAULT false,
    tournament_registration_mode VARCHAR(20) DEFAULT 'manual',
    tournament_open_date TIMESTAMP,
    tournament_close_date TIMESTAMP,
    tournament_closed_message TEXT DEFAULT 'Registration is currently closed. Please check back later.',
    course_registration_active BOOLEAN DEFAULT true,
    coming_soon_message TEXT DEFAULT 'Coming Soon! Get ready for the biggest chess tournament of the year!',
    tournament_fee INTEGER DEFAULT 500,
    tournament_types JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Registrations Table
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id SERIAL PRIMARY KEY,
    participant_first_name VARCHAR(100) NOT NULL,
    participant_middle_name VARCHAR(100),
    participant_last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    fide_id VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    tournament_type VARCHAR(50),
    amount_paid INTEGER NOT NULL,
    discount_code VARCHAR(50),
    discount_amount INTEGER DEFAULT 0,
    payment_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Registrations Table
CREATE TABLE IF NOT EXISTS course_registrations (
    id SERIAL PRIMARY KEY,
    participant_first_name VARCHAR(100) NOT NULL,
    participant_last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    age INTEGER,
    course_type VARCHAR(50),
    amount_paid INTEGER,
    payment_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value INTEGER NOT NULL,
    max_uses INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author VARCHAR(100) DEFAULT 'ThinQ Chess',
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin settings
INSERT INTO admin_settings (
    tournament_registration_active,
    tournament_registration_mode,
    tournament_closed_message,
    course_registration_active,
    coming_soon_message,
    tournament_fee
) VALUES (
    false,
    'manual',
    'Registration is currently closed. Please check back later.',
    true,
    'Coming Soon! Get ready for the biggest chess tournament of the year!',
    500
) ON CONFLICT DO NOTHING;

-- Insert some sample discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses) VALUES
('TC10', 'percentage', 10, 100),
('TC20', 'percentage', 20, 50),
('EARLY50', 'fixed', 50, 25)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_email ON tournament_registrations(email);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_phone ON tournament_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_course_registrations_email ON course_registrations(email);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
