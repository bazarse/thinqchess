// Script to add TC1_ discount code for testing
import SimpleDatabase from '../lib/simple-db.js';

async function addTC1Discount() {
  try {
    console.log('🚀 Adding TC1_ discount code...');
    
    const db = new SimpleDatabase();
    
    // Check if TC1_ already exists
    const existing = await db.get('SELECT * FROM discount_codes WHERE code = ?', ['TC1_']);
    
    if (existing) {
      console.log('✅ TC1_ discount code already exists:', existing);
      return;
    }
    
    // Add TC1_ discount code
    const result = await db.run(`
      INSERT INTO discount_codes (
        code, discount_percent, usage_limit, is_active, code_type, prefix, used_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['TC1_', 10, 100, 1, 'prefix', 'TC1_', 0]);
    
    console.log('✅ TC1_ discount code added successfully!', result);
    
    // Verify it was added
    const added = await db.get('SELECT * FROM discount_codes WHERE code = ?', ['TC1_']);
    console.log('✅ Verification:', added);
    
  } catch (error) {
    console.error('❌ Error adding TC1_ discount code:', error);
  }
}

// Run the script
addTC1Discount();
