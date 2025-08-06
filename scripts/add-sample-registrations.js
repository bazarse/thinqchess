// Add sample registrations to tournaments
const { getDB } = require('../lib/database.js');

function addSampleRegistrations() {
  console.log('📝 Adding sample registrations...');
  
  const db = getDB();
  
  // Get tournament IDs
  const tournaments = db.prepare("SELECT id, name FROM tournaments WHERE status = 'completed'").all();
  
  if (tournaments.length === 0) {
    console.log('❌ No completed tournaments found');
    return;
  }
  
  const sampleRegistrations = [
    {
      participant_first_name: 'Arjun',
      participant_last_name: 'Sharma',
      email: 'arjun.sharma@email.com',
      phone: '+91-9876543210',
      dob: '2010-05-15',
      gender: 'male',
      tournament_type: 'under_12',
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      amount_paid: 400.00,
      payment_status: 'completed'
    },
    {
      participant_first_name: 'Priya',
      participant_last_name: 'Patel',
      email: 'priya.patel@email.com',
      phone: '+91-9876543211',
      dob: '2008-08-22',
      gender: 'female',
      tournament_type: 'under_16',
      country: 'India',
      state: 'Gujarat',
      city: 'Ahmedabad',
      amount_paid: 450.00,
      payment_status: 'completed'
    },
    {
      participant_first_name: 'Rahul',
      participant_last_name: 'Kumar',
      email: 'rahul.kumar@email.com',
      phone: '+91-9876543212',
      dob: '1995-03-10',
      gender: 'male',
      tournament_type: 'open',
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      amount_paid: 450.00,
      discount_code: 'TC10',
      discount_amount: 50.00,
      payment_status: 'completed'
    },
    {
      participant_first_name: 'Sneha',
      participant_last_name: 'Singh',
      email: 'sneha.singh@email.com',
      phone: '+91-9876543213',
      dob: '2012-12-05',
      gender: 'female',
      tournament_type: 'under_12',
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      amount_paid: 400.00,
      payment_status: 'completed'
    },
    {
      participant_first_name: 'Vikram',
      participant_last_name: 'Reddy',
      email: 'vikram.reddy@email.com',
      phone: '+91-9876543214',
      dob: '2006-07-18',
      gender: 'male',
      tournament_type: 'under_16',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      amount_paid: 450.00,
      payment_status: 'completed'
    }
  ];
  
  const insertRegistration = db.prepare(`
    INSERT INTO registrations (
      tournament_id, participant_first_name, participant_last_name, email, phone,
      dob, gender, tournament_type, country, state, city, amount_paid,
      discount_code, discount_amount, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // Add registrations to each tournament
  tournaments.forEach(tournament => {
    console.log(`Adding registrations to: ${tournament.name}`);
    
    sampleRegistrations.forEach(registration => {
      insertRegistration.run(
        tournament.id,
        registration.participant_first_name,
        registration.participant_last_name,
        registration.email,
        registration.phone,
        registration.dob,
        registration.gender,
        registration.tournament_type,
        registration.country,
        registration.state,
        registration.city,
        registration.amount_paid,
        registration.discount_code || null,
        registration.discount_amount || 0,
        registration.payment_status
      );
    });
    
    console.log(`✅ Added ${sampleRegistrations.length} registrations to ${tournament.name}`);
  });
  
  console.log('✅ Sample registrations added successfully!');
}

// Run if called directly
if (require.main === module) {
  addSampleRegistrations();
}

module.exports = { addSampleRegistrations };
