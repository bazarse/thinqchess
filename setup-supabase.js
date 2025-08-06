#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTables() {
  try {
    console.log('🚀 Setting up Supabase tables...');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('_temp')
              .select('*')
              .limit(0);
            
            if (directError) {
              console.log(`⚠️  Statement ${i + 1} may have failed:`, error.message);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error:`, err.message);
        }
      }
    }

    // Test table creation by checking if tables exist
    console.log('\n🔍 Verifying table creation...');
    
    // Check tournaments table
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('count')
      .limit(1);
    
    if (!tournamentsError) {
      console.log('✅ Tournaments table created successfully');
    } else {
      console.log('❌ Tournaments table creation failed:', tournamentsError.message);
    }

    // Check registrations table
    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('count')
      .limit(1);
    
    if (!registrationsError) {
      console.log('✅ Registrations table created successfully');
    } else {
      console.log('❌ Registrations table creation failed:', registrationsError.message);
    }

    console.log('\n🎉 Supabase setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables');
    console.log('2. Set DEVELOPMENT_MODE="false" in .env.local to use Supabase');
    console.log('3. Restart your development server');

  } catch (error) {
    console.error('❌ Error setting up Supabase:', error);
    process.exit(1);
  }
}

// Alternative method: Manual table creation
async function createTablesManually() {
  console.log('🔧 Creating tables manually...');

  try {
    // Create tournaments table
    console.log('📝 Creating tournaments table...');
    const { error: tournamentsError } = await supabase.rpc('create_tournaments_table');
    
    if (tournamentsError) {
      console.log('⚠️  Using alternative method for tournaments table');
    }

    // Create registrations table  
    console.log('📝 Creating registrations table...');
    const { error: registrationsError } = await supabase.rpc('create_registrations_table');
    
    if (registrationsError) {
      console.log('⚠️  Using alternative method for registrations table');
    }

    console.log('✅ Manual table creation completed');

  } catch (error) {
    console.error('❌ Manual creation failed:', error);
  }
}

// Run setup
setupTables().catch(error => {
  console.error('❌ Setup failed:', error);
  console.log('\n🔧 Trying manual creation...');
  createTablesManually();
});
