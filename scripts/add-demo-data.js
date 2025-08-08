// Add sample demo requests with demo_completed field
const SimpleDatabase = require('../lib/simple-db.js').default;

async function addDemoData() {
  try {
    console.log('🎯 Adding sample demo requests with demo_completed field...');
    
    const db = new SimpleDatabase();
    
    // Sample demo requests data
    const sampleRequests = [
      {
        parent_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+91 9876543210',
        child_name: 'Alex Smith',
        age: 8,
        chess_experience: 'Beginner level at local club',
        state: 'Maharashtra',
        country: 'India',
        message: 'My child is very interested in chess and wants to learn advanced strategies.',
        status: 'pending',
        demo_completed: 0
      },
      {
        parent_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+91 9876543211',
        child_name: 'Emma Johnson',
        age: 10,
        chess_experience: 'No prior experience',
        state: 'Karnataka',
        country: 'India',
        message: 'Looking for a good chess coach for my daughter who is a complete beginner.',
        status: 'completed',
        demo_completed: 1
      },
      {
        parent_name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+91 9876543212',
        child_name: 'David Brown',
        age: 12,
        chess_experience: 'Intermediate level, knows basic openings',
        state: 'Delhi',
        country: 'India',
        message: 'My son has been playing chess for 2 years and wants to improve his game.',
        status: 'pending',
        demo_completed: 0
      },
      {
        parent_name: 'Lisa Wilson',
        email: 'lisa.wilson@email.com',
        phone: '+91 9876543213',
        child_name: 'Sophie Wilson',
        age: 7,
        chess_experience: 'Knows how pieces move',
        state: 'Tamil Nadu',
        country: 'India',
        message: 'Sophie loves chess and wants to learn more advanced techniques.',
        status: 'completed',
        demo_completed: 1
      },
      {
        parent_name: 'Robert Davis',
        email: 'robert.davis@email.com',
        phone: '+91 9876543214',
        child_name: 'Ryan Davis',
        age: 9,
        chess_experience: 'School chess club member',
        state: 'Gujarat',
        country: 'India',
        message: 'Ryan is part of his school chess club and wants professional coaching.',
        status: 'pending',
        demo_completed: 0
      }
    ];

    let insertedCount = 0;
    for (const request of sampleRequests) {
      try {
        // Check if request with same email already exists
        const existing = await db.get('SELECT * FROM demo_requests WHERE email = ?', [request.email]);
        
        if (!existing) {
          const result = await db.run(`
            INSERT INTO demo_requests (
              parent_name, email, phone, child_name, age, chess_experience,
              state, country, message, status, demo_completed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            request.parent_name,
            request.email,
            request.phone,
            request.child_name,
            request.age,
            request.chess_experience,
            request.state,
            request.country,
            request.message,
            request.status,
            request.demo_completed
          ]);
          
          insertedCount++;
          console.log(`✅ Added demo request: ${request.parent_name} for ${request.child_name} (ID: ${result.lastInsertRowid})`);
        } else {
          console.log(`⚠️ Demo request already exists: ${request.email}`);
        }
      } catch (error) {
        console.error(`❌ Error adding demo request for ${request.email}:`, error);
      }
    }

    console.log(`\n🎉 Successfully added ${insertedCount} demo requests!`);
    
    // Verify the data
    const allRequests = await db.all('SELECT * FROM demo_requests');
    console.log(`\n📊 Total demo requests in database: ${allRequests.length}`);
    console.log('Demo requests with demo_completed field:');
    allRequests.forEach(req => {
      console.log(`- ${req.parent_name} (${req.child_name}): demo_completed = ${req.demo_completed}, status = ${req.status}`);
    });

  } catch (error) {
    console.error('❌ Error adding demo data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  addDemoData();
}

module.exports = { addDemoData };
