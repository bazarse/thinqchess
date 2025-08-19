// Script to test discount code deactivation
const path = require('path');

// Add the project root to the path
process.chdir(path.join(__dirname, '..'));

async function testDiscountDeactivation() {
  try {
    console.log('🧪 Testing discount code deactivation...');
    
    // Import and initialize the database
    const { getDB } = require('../lib/database.js');
    const db = getDB();
    
    console.log('✅ Database connected!');

    // Step 1: Check current status of DEMO50
    console.log('\n📋 Step 1: Check current status of DEMO50');
    const demo50Before = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('DEMO50');
    console.log(`DEMO50 before: Active=${demo50Before.is_active}, Type=${typeof demo50Before.is_active}`);

    // Step 2: Deactivate DEMO50
    console.log('\n🔄 Step 2: Deactivating DEMO50');
    db.prepare('UPDATE discount_codes SET is_active = 0 WHERE code = ?').run('DEMO50');
    console.log('✅ DEMO50 deactivated');

    // Step 3: Check status after deactivation
    console.log('\n📋 Step 3: Check status after deactivation');
    const demo50After = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('DEMO50');
    console.log(`DEMO50 after: Active=${demo50After.is_active}, Type=${typeof demo50After.is_active}`);

    // Step 4: Test validation queries
    console.log('\n🔍 Step 4: Testing validation queries');
    
    const query1 = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1').get('DEMO50');
    console.log(`Query 1 (is_active = 1): ${query1 ? 'Found' : 'Not found'}`);
    
    const query2 = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1 AND is_active != 0').get('DEMO50');
    console.log(`Query 2 (is_active = 1 AND is_active != 0): ${query2 ? 'Found' : 'Not found'}`);
    
    const query3 = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active != 0').get('DEMO50');
    console.log(`Query 3 (is_active != 0): ${query3 ? 'Found' : 'Not found'}`);

    // Step 5: Test the validation logic
    console.log('\n🧪 Step 5: Testing validation logic');
    const testCode = demo50After;
    
    console.log(`Testing: !testCode.is_active = ${!testCode.is_active}`);
    console.log(`Testing: testCode.is_active === 0 = ${testCode.is_active === 0}`);
    console.log(`Testing: testCode.is_active === false = ${testCode.is_active === false}`);
    console.log(`Testing: testCode.is_active === "0" = ${testCode.is_active === "0"}`);
    
    const shouldBeRejected = !testCode.is_active || testCode.is_active === 0 || testCode.is_active === false || testCode.is_active === "0";
    console.log(`Should be rejected: ${shouldBeRejected}`);

    // Step 6: Reactivate for next test
    console.log('\n🔄 Step 6: Reactivating DEMO50 for next test');
    db.prepare('UPDATE discount_codes SET is_active = 1 WHERE code = ?').run('DEMO50');
    
    const demo50Final = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get('DEMO50');
    console.log(`DEMO50 final: Active=${demo50Final.is_active}, Type=${typeof demo50Final.is_active}`);

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
testDiscountDeactivation();
