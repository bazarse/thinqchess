#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating tables manually...');

  try {
    // Test connection first
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Create tournaments table using direct SQL
    console.log('📝 Creating tournaments table...');
    
    const createTournamentsSQL = `
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
        tournament_types TEXT[],
        status VARCHAR(20) DEFAULT 'upcoming',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Try to create via SQL query
    const { error: tournamentsError } = await supabase.rpc('exec', { sql: createTournamentsSQL });
    
    if (tournamentsError) {
      console.log('⚠️  Direct SQL failed, using alternative method...');
      
      // Alternative: Create using Supabase client methods
      console.log('📋 Please create tables manually in Supabase Dashboard:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project: vkchykbemnzlknvtlfxx');
      console.log('3. Go to Table Editor');
      console.log('4. Create new table "tournaments" with these columns:');
      console.log('   - id (int8, primary key, auto-increment)');
      console.log('   - name (text, required)');
      console.log('   - description (text)');
      console.log('   - start_date (date, required)');
      console.log('   - end_date (date, required)');
      console.log('   - registration_start_date (date, required)');
      console.log('   - registration_end_date (date, required)');
      console.log('   - max_participants (int4, default 50)');
      console.log('   - entry_fee (int4, required)');
      console.log('   - venue (text)');
      console.log('   - rules (text)');
      console.log('   - prizes (text)');
      console.log('   - tournament_types (text[])');
      console.log('   - status (text, default "upcoming")');
      console.log('   - image_url (text)');
      console.log('   - created_at (timestamptz, default now())');
      console.log('   - updated_at (timestamptz, default now())');
      
      console.log('\n5. Create new table "registrations" with these columns:');
      console.log('   - id (int8, primary key, auto-increment)');
      console.log('   - type (text, required)');
      console.log('   - tournament_id (int8, foreign key to tournaments.id)');
      console.log('   - participant_first_name (text, required)');
      console.log('   - participant_last_name (text, required)');
      console.log('   - email (text, required)');
      console.log('   - phone (text, required)');
      console.log('   - dob (date)');
      console.log('   - gender (text)');
      console.log('   - fida_id (text)');
      console.log('   - country (text)');
      console.log('   - state (text)');
      console.log('   - city (text)');
      console.log('   - location (text)');
      console.log('   - age (int4)');
      console.log('   - course_type (text)');
      console.log('   - amount_paid (int4, required)');
      console.log('   - discount_code (text)');
      console.log('   - discount_amount (int4, default 0)');
      console.log('   - payment_id (text)');
      console.log('   - razorpay_order_id (text)');
      console.log('   - payment_status (text, default "pending")');
      console.log('   - additional_data (jsonb)');
      console.log('   - registered_at (timestamptz, default now())');
      console.log('   - created_at (timestamptz, default now())');
      console.log('   - updated_at (timestamptz, default now())');
      
      console.log('\n6. Enable Row Level Security for both tables');
      console.log('7. Add policies to allow public access');
      
    } else {
      console.log('✅ Tables created successfully via SQL');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual Setup Required:');
    console.log('Please create tables manually in Supabase Dashboard');
    console.log('URL: https://supabase.com/dashboard/project/vkchykbemnzlknvtlfxx');
  }
}

createTables();
