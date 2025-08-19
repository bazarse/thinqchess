// Script to check discount codes status in database
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Add the project root to the path
process.chdir(path.join(__dirname, '..'));

async function checkDiscountCodes() {
  try {
    // Connect directly to SQLite database
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    const db = new sqlite3.Database(dbPath);

    console.log('🔍 Checking discount codes in database...\n');

    db.serialize(() => {
      // Get all discount codes
      db.all('SELECT * FROM discount_codes', [], (err, rows) => {
        if (err) {
          console.error('Error fetching discount codes:', err);
          return;
        }

        console.log('📊 All Discount Codes:');
        console.log('='.repeat(80));
        
        if (rows.length === 0) {
          console.log('❌ No discount codes found in database');
        } else {
          rows.forEach((row, index) => {
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
        db.get('SELECT * FROM discount_codes WHERE code = ?', ['DEMO50'], (err, row) => {
          if (err) {
            console.error('Error checking DEMO50:', err);
          } else if (row) {
            console.log(`✅ DEMO50 found: Active=${row.is_active}, Used=${row.used_count}/${row.usage_limit}`);
          } else {
            console.log('❌ DEMO50 not found');
          }
        });

        // Test WELCOME10
        db.get('SELECT * FROM discount_codes WHERE code = ?', ['WELCOME10'], (err, row) => {
          if (err) {
            console.error('Error checking WELCOME10:', err);
          } else if (row) {
            console.log(`✅ WELCOME10 found: Active=${row.is_active}, Used=${row.used_count}/${row.usage_limit}`);
          } else {
            console.log('❌ WELCOME10 not found');
          }
        });

        // Test STUDENT20
        db.get('SELECT * FROM discount_codes WHERE code = ?', ['STUDENT20'], (err, row) => {
          if (err) {
            console.error('Error checking STUDENT20:', err);
          } else if (row) {
            console.log(`✅ STUDENT20 found: Active=${row.is_active}, Used=${row.used_count}/${row.usage_limit}`);
          } else {
            console.log('❌ STUDENT20 not found');
          }
        });

        // Close database after a delay
        setTimeout(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n🔒 Database connection closed.');
            }
          });
        }, 1000);
      });
    });

  } catch (error) {
    console.error('❌ Error checking discount codes:', error);
  }
}

// Run the script
checkDiscountCodes();
