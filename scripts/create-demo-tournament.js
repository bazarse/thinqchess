// Create demo tournament for testing
const SimpleDatabase = require('../lib/simple-db.js').default;

async function createDemoTournament() {
  const db = new SimpleDatabase();
  
  console.log('🏆 Creating demo tournament...');
  
  // Create demo tournament with categories
  const categories = [
    {
      id: 'under8',
      name: 'Under 8',
      fee: '300',
      min_age: '',
      max_age: '8',
      slots: '20'
    },
    {
      id: 'under12',
      name: 'Under 12', 
      fee: '400',
      min_age: '9',
      max_age: '12',
      slots: '25'
    },
    {
      id: 'open',
      name: 'Open Category',
      fee: '500',
      min_age: '',
      max_age: '',
      slots: '30'
    }
  ];

  const result = await db.run(`
    INSERT INTO tournaments (
      name, description, start_date, end_date,
      registration_start_date, registration_end_date, 
      flyer_image, is_active, categories, status, fee, max_participants
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'ThinQ Chess Championship 2024',
    'Annual chess championship with multiple age categories',
    '2024-12-31',
    '2024-12-31', 
    '2024-01-01',
    '2024-12-30',
    '/images/tournament.jpg',
    1, // Active
    JSON.stringify(categories),
    'upcoming',
    500,
    75
  ]);

  console.log('✅ Demo tournament created with ID:', result.lastInsertRowid);
  
  // Create some demo discount codes
  const discountCodes = [
    {
      code: 'DEMO10',
      discount_percent: 10,
      discount_amount: 0,
      discount_type: 'percentage',
      usage_limit: 50,
      is_active: 1,
      code_type: 'manual'
    },
    {
      code: 'SAVE50',
      discount_percent: 0,
      discount_amount: 50,
      discount_type: 'amount', 
      usage_limit: 25,
      is_active: 1,
      code_type: 'manual'
    }
  ];

  for (const code of discountCodes) {
    await db.run(`
      INSERT INTO discount_codes (
        code, discount_percent, discount_amount, discount_type,
        usage_limit, used_count, is_active, code_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code.code, code.discount_percent, code.discount_amount, code.discount_type,
      code.usage_limit, 0, code.is_active, code.code_type
    ]);
    console.log('✅ Created discount code:', code.code);
  }

  console.log('🎉 Demo setup complete!');
  console.log('Tournament Categories:', categories.map(c => `${c.name} (₹${c.fee})`).join(', '));
  console.log('Discount Codes: DEMO10 (10% off), SAVE50 (₹50 off)');
}

createDemoTournament().catch(console.error);