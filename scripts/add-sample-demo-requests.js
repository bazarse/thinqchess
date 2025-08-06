const { getDB } = require('../lib/database.js');

function addSampleDemoRequests() {
  try {
    const db = getDB();
    
    console.log('🎯 Adding sample demo requests...');

    // Sample demo requests data
    const sampleRequests = [
      {
        parent_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+91 9876543210',
        child_name: 'Alex Smith',
        age: 8,
        past_training: 'Beginner level at local club',
        state: 'Maharashtra',
        country: 'India',
        message: 'My child is very interested in chess and wants to learn advanced strategies.',
        status: 'pending',
        demo_completed: 0,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        parent_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+91 9876543211',
        child_name: 'Emma Johnson',
        age: 10,
        past_training: 'No prior experience',
        state: 'Karnataka',
        country: 'India',
        message: 'Looking for a good chess coach for my daughter who is a complete beginner.',
        status: 'completed',
        demo_completed: 1,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        parent_name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '+91 9876543212',
        child_name: 'David Brown',
        age: 12,
        past_training: 'Intermediate level, knows basic openings',
        state: 'Delhi',
        country: 'India',
        message: 'My son has been playing chess for 2 years and wants to improve his game.',
        status: 'pending',
        demo_completed: 0,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        parent_name: 'Lisa Wilson',
        email: 'lisa.wilson@email.com',
        phone: '+91 9876543213',
        child_name: 'Sophie Wilson',
        age: 7,
        past_training: 'Knows how pieces move',
        state: 'Tamil Nadu',
        country: 'India',
        message: 'Sophie loves chess and wants to learn more advanced techniques.',
        status: 'completed',
        demo_completed: 1,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        parent_name: 'Robert Davis',
        email: 'robert.davis@email.com',
        phone: '+91 9876543214',
        child_name: 'Ryan Davis',
        age: 9,
        past_training: 'School chess club member',
        state: 'Gujarat',
        country: 'India',
        message: 'Ryan is part of his school chess club and wants professional coaching.',
        status: 'pending',
        demo_completed: 0,
        created_at: new Date().toISOString(), // Today
        updated_at: new Date().toISOString()
      }
    ];

    // Insert sample demo requests
    const insertStmt = db.prepare(`
      INSERT INTO demo_requests (
        parent_name, email, phone, child_name, age, past_training,
        state, country, message, status, demo_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let insertedCount = 0;
    for (const request of sampleRequests) {
      try {
        // Check if request with same email already exists
        const existing = db.prepare('SELECT id FROM demo_requests WHERE email = ?').get(request.email);
        
        if (!existing) {
          insertStmt.run(
            request.parent_name,
            request.email,
            request.phone,
            request.child_name,
            request.age,
            request.past_training,
            request.state,
            request.country,
            request.message,
            request.status,
            request.demo_completed,
            request.created_at,
            request.updated_at
          );
          insertedCount++;
          console.log(`✅ Added demo request: ${request.parent_name} for ${request.child_name}`);
        } else {
          console.log(`⚠️ Demo request already exists: ${request.email}`);
        }
      } catch (error) {
        console.error(`❌ Error adding demo request for ${request.parent_name}:`, error.message);
      }
    }

    console.log(`🎉 Successfully added ${insertedCount} sample demo requests!`);
    
    // Show total count
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM demo_requests').get();
    console.log(`📊 Total demo requests in database: ${totalCount.count}`);

  } catch (error) {
    console.error('❌ Error adding sample demo requests:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  addSampleDemoRequests();
}

module.exports = { addSampleDemoRequests };
