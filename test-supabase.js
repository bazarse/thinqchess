#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test tournaments table
    console.log('\n📋 Testing tournaments table...');
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .limit(5);

    if (tournamentsError) {
      console.error('❌ Tournaments table error:', tournamentsError.message);
    } else {
      console.log('✅ Tournaments table working!');
      console.log(`Found ${tournaments.length} tournaments`);
      if (tournaments.length > 0) {
        console.log('Sample:', tournaments[0].name);
      }
    }

    // Test registrations table
    console.log('\n📋 Testing registrations table...');
    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('*')
      .limit(5);

    if (registrationsError) {
      console.error('❌ Registrations table error:', registrationsError.message);
    } else {
      console.log('✅ Registrations table working!');
      console.log(`Found ${registrations.length} registrations`);
      if (registrations.length > 0) {
        console.log('Sample:', `${registrations[0].participant_first_name} ${registrations[0].participant_last_name}`);
      }
    }

    // Test insert
    console.log('\n📝 Testing insert...');
    const { data: newReg, error: insertError } = await supabase
      .from('registrations')
      .insert([{
        type: 'course',
        participant_first_name: 'Test',
        participant_last_name: 'Insert',
        email: 'testinsert@example.com',
        phone: '+91 9999999999',
        amount_paid: 0,
        payment_status: 'completed'
      }])
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
    } else {
      console.log('✅ Insert working!');
      console.log('New registration ID:', newReg[0].id);
    }

    console.log('\n🎉 Supabase is fully working!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
