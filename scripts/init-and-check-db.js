// Script to initialize database and check discount codes
const path = require('path');

// Add the project root to the path
process.chdir(path.join(__dirname, '..'));

async function initAndCheckDB() {
  try {
    console.log('🚀 Initializing database...');
    
    // Import and initialize the database using the existing system
    const { getDB } = require('../lib/database.js');
    const db = getDB();
    
    console.log('✅ Database initialized successfully!');
    console.log('🔍 Checking discount codes...\n');

    // Get all discount codes
    const allCodes = db.prepare('SELECT * FROM discount_codes').all();
    
    console.log('📊 All Discount Codes:');
    console.log('='.repeat(80));
    
    if (allCodes.length === 0) {
      console.log('❌ No discount codes found in database');
    } else {
      allCodes.forEach((row, index) => {
        console.log(`${index + 1}. Code: ${row.code}`);
        console.log(`   Discount: ${row.discount_percent}%`);
        console.log(`   Usage: ${row.used_count}/${row.usage_limit}`);
        console.log(`   Active: ${row.is_active} (Type: ${typeof row.is_active})`);
        console.log(`   Type: ${row.code_type || 'manual'}`);
        console.log(`   Created: ${row.created_at}`);
        console.log('-'.repeat(40));
      });
    }

    // Test specific codes
    console.log('\n🧪 Testing specific codes:');
    console.log('='.repeat(50));

    // Test DEMO50
    const demo50 = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('DEMO50');
    if (demo50) {
      console.log(`✅ DEMO50 found: Active=${demo50.is_active}, Used=${demo50.used_count}/${demo50.usage_limit}`);
    } else {
      console.log('❌ DEMO50 not found');
    }

    // Test WELCOME10
    const welcome10 = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('WELCOME10');
    if (welcome10) {
      console.log(`✅ WELCOME10 found: Active=${welcome10.is_active}, Used=${welcome10.used_count}/${welcome10.usage_limit}`);
    } else {
      console.log('❌ WELCOME10 not found');
    }

    // Test STUDENT20
    const student20 = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('STUDENT20');
    if (student20) {
      console.log(`✅ STUDENT20 found: Active=${student20.is_active}, Used=${student20.used_count}/${student20.usage_limit}`);
    } else {
      console.log('❌ STUDENT20 not found');
    }

    // Test validation queries
    console.log('\n🔍 Testing validation queries:');
    console.log('='.repeat(50));

    const activeDemo50 = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1').get('DEMO50');
    console.log(`DEMO50 with is_active = 1: ${activeDemo50 ? 'Found' : 'Not found'}`);

    const activeDemo50_v2 = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1 AND is_active != 0').get('DEMO50');
    console.log(`DEMO50 with is_active = 1 AND is_active != 0: ${activeDemo50_v2 ? 'Found' : 'Not found'}`);

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
initAndCheckDB();
