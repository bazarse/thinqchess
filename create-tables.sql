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

-- Create registrations table for both tournament and course registrations
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('tournament', 'course')),
    
    -- Tournament/Course Reference
    tournament_id INTEGER REFERENCES tournaments(id),
    
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(type);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_registered_at ON registrations(registered_at);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON registrations(tournament_id);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_dates ON tournaments(registration_start_date, registration_end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Public can view tournaments" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Public can insert registrations" ON registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own registrations" ON registrations
    FOR SELECT USING (true);

-- Admin policies (you can restrict these later)
CREATE POLICY "Admin can manage tournaments" ON tournaments
    FOR ALL USING (true);

CREATE POLICY "Admin can manage registrations" ON registrations
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample tournament for testing
INSERT INTO tournaments (
    name, 
    description, 
    start_date, 
    end_date, 
    registration_start_date, 
    registration_end_date,
    entry_fee, 
    status,
    tournament_types
) VALUES 
(
    'ThinQ Chess Championship 2024',
    'Annual championship tournament for all age groups',
    '2024-12-15',
    '2024-12-17',
    '2024-11-01',
    '2024-12-10',
    500,
    'upcoming',
    ARRAY['Under 8', 'Under 10', 'Under 12', 'Under 16', 'Open']
);

-- Insert sample registration for testing
INSERT INTO registrations (
    type, 
    participant_first_name, 
    participant_last_name, 
    email, 
    phone, 
    dob, 
    gender, 
    country, 
    state, 
    city, 
    amount_paid, 
    payment_status,
    tournament_id
) VALUES 
(
    'tournament',
    'Test',
    'User',
    'test@example.com',
    '+91 9876543210',
    '2010-01-01',
    'Male',
    'India',
    'Maharashtra',
    'Mumbai',
    500,
    'completed',
    1
);

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW registration_stats AS
SELECT 
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN type = 'tournament' THEN 1 END) as tournament_registrations,
    COUNT(CASE WHEN type = 'course' THEN 1 END) as course_registrations,
    COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
    SUM(CASE WHEN payment_status = 'completed' THEN amount_paid ELSE 0 END) as total_revenue,
    COUNT(CASE WHEN registered_at >= CURRENT_DATE THEN 1 END) as today_registrations
FROM registrations;
