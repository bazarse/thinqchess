// SQLite Database Initialization Script
const { initializeDatabase, getDatabase } = require('../lib/sqlite.js');
const {
  updateAdminSettings,
  createDiscountCode,
  createBlog,
  createGalleryImage,
  createTournament,
  createTournamentRegistration,
  createAdminUser
} = require('../lib/sqlite-operations.js');

async function initializeSQLiteDatabase() {
  console.log('🚀 Initializing SQLite Database for ThinQ Chess...');
  console.log('================================================');

  try {
    // Initialize database schema
    initializeDatabase();

    // Insert default admin settings
    console.log('📝 Inserting admin settings...');
    const adminSettings = {
      tournament_fee: 400.00,
      registration_fee: 500.00,
      max_participants: 52,
      tournament_registration_active: false,
      tournament_registration_mode: 'manual',
      course_registration_active: true,
      coming_soon_message: 'Coming Soon! Get ready for the biggest chess tournament of the year!',
      tournament_closed_message: 'Registration is currently closed. Please check back later.',
      tournament_types: [
        {"id": "under_8", "name": "Under 8", "fee": 300, "age_min": 5, "age_max": 8, "active": true},
        {"id": "under_10", "name": "Under 10", "fee": 350, "age_min": 8, "age_max": 10, "active": true},
        {"id": "under_12", "name": "Under 12", "fee": 400, "age_min": 10, "age_max": 12, "active": true},
        {"id": "under_16", "name": "Under 16", "fee": 450, "age_min": 12, "age_max": 16, "active": true},
        {"id": "open", "name": "Open (Any Age)", "fee": 500, "age_min": null, "age_max": null, "active": true}
      ]
    };
    updateAdminSettings(adminSettings);
    console.log('✅ Admin settings inserted!');

    // Insert admin user
    console.log('👤 Creating admin user...');
    createAdminUser({
      email: 'admin@thinqchess.com',
      password: '1234',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'admin'
    });
    console.log('✅ Admin user created!');

    // Insert sample discount codes
    console.log('🎫 Creating discount codes...');
    const discountCodes = [
      { code: 'TC10', discount_percent: 10.00, usage_limit: 50, is_active: true },
      { code: 'TC20', discount_percent: 20.00, usage_limit: 30, is_active: true },
      { code: 'TCON15', discount_percent: 15.00, usage_limit: 100, is_active: true },
      { code: 'STUDENT25', discount_percent: 25.00, usage_limit: 200, is_active: true },
      { code: 'EARLY20', discount_percent: 20.00, usage_limit: 75, is_active: true }
    ];

    discountCodes.forEach(code => {
      createDiscountCode(code);
    });
    console.log('✅ Discount codes created!');

    // Insert sample tournaments
    console.log('🏆 Creating sample tournaments...');
    const tournaments = [
      {
        name: 'ThinQ Chess Championship 2024',
        description: 'Annual chess championship with multiple categories for all age groups. Join us for an exciting tournament experience!',
        start_date: '2024-12-01',
        end_date: '2024-12-03',
        registration_start_date: '2024-11-01',
        registration_end_date: '2024-11-25',
        fee: 500.00,
        max_participants: 100,
        status: 'completed',
        venue: 'ThinQ Chess Academy, Mumbai',
        rules: 'Standard FIDE rules apply. Time control: 90 minutes + 30 seconds increment.',
        prizes: {
          "1st": "₹10,000 + Trophy",
          "2nd": "₹5,000 + Trophy", 
          "3rd": "₹3,000 + Trophy"
        }
      },
      {
        name: 'Winter Chess Tournament 2024',
        description: 'Winter season tournament for all age groups with exciting prizes and certificates.',
        start_date: '2024-01-15',
        end_date: '2024-01-17',
        registration_start_date: '2023-12-15',
        registration_end_date: '2024-01-10',
        fee: 400.00,
        max_participants: 80,
        status: 'completed',
        venue: 'Community Center, Delhi',
        rules: 'Swiss system tournament. 7 rounds.',
        prizes: {
          "1st": "₹8,000 + Trophy",
          "2nd": "₹4,000 + Trophy",
          "3rd": "₹2,000 + Trophy"
        }
      }
    ];

    tournaments.forEach(tournament => {
      const createdTournament = createTournament(tournament);
      
      // Add sample registrations for completed tournaments
      if (tournament.status === 'completed') {
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
            amount_paid: 500.00,
            discount_code: 'TC10',
            discount_amount: 50.00,
            payment_status: 'completed'
          }
        ];

        sampleRegistrations.forEach(registration => {
          createTournamentRegistration(createdTournament.id, registration);
        });
      }
    });
    console.log('✅ Sample tournaments and registrations created!');

    // Insert sample blogs
    console.log('📝 Creating sample blogs...');
    const blogs = [
      {
        title: 'Welcome to ThinQ Chess Academy',
        content: `<h2>Welcome to ThinQ Chess Academy!</h2>
        
        <p>We are thrilled to welcome you to ThinQ Chess Academy, where chess excellence meets passionate learning. Our academy is dedicated to nurturing chess talent at all levels, from complete beginners to advanced tournament players.</p>
        
        <h3>What We Offer</h3>
        <ul>
          <li><strong>Expert Coaching:</strong> Learn from certified chess masters and experienced coaches</li>
          <li><strong>Structured Curriculum:</strong> Progressive learning modules designed for all skill levels</li>
          <li><strong>Tournament Preparation:</strong> Specialized training for competitive chess</li>
          <li><strong>Online & Offline Classes:</strong> Flexible learning options to suit your schedule</li>
        </ul>
        
        <h3>Our Mission</h3>
        <p>To make chess accessible to everyone and help players achieve their full potential through systematic training, regular practice, and competitive exposure.</p>
        
        <p>Join us on this exciting chess journey and discover the joy of the royal game!</p>`,
        excerpt: 'Welcome to ThinQ Chess Academy - your gateway to chess excellence. Learn from expert coaches and join our vibrant chess community.',
        slug: 'welcome-to-thinq-chess-academy',
        status: 'published',
        featured_image: '/images/indian-img-one.jpg',
        author: 'ThinQ Chess Team',
        tags: ['welcome', 'academy', 'chess', 'learning']
      },
      {
        title: 'Benefits of Learning Chess for Children',
        content: `<h2>Why Chess is Perfect for Young Minds</h2>
        
        <p>Chess is more than just a game - it's a powerful educational tool that offers numerous benefits for children's cognitive and social development.</p>
        
        <h3>Cognitive Benefits</h3>
        <ul>
          <li><strong>Improved Problem-Solving:</strong> Chess teaches children to analyze situations and find creative solutions</li>
          <li><strong>Enhanced Memory:</strong> Regular chess practice strengthens both short-term and long-term memory</li>
          <li><strong>Better Concentration:</strong> Chess requires sustained focus, improving attention span</li>
          <li><strong>Strategic Thinking:</strong> Children learn to plan ahead and consider consequences</li>
        </ul>
        
        <h3>Social and Emotional Benefits</h3>
        <ul>
          <li><strong>Patience and Discipline:</strong> Chess teaches the value of careful thinking</li>
          <li><strong>Confidence Building:</strong> Success in chess boosts self-esteem</li>
          <li><strong>Sportsmanship:</strong> Learning to win gracefully and lose with dignity</li>
          <li><strong>Social Skills:</strong> Interacting with peers in a structured environment</li>
        </ul>
        
        <p>Start your child's chess journey today and watch them develop skills that will benefit them for life!</p>`,
        excerpt: 'Discover how chess can boost your child\'s cognitive abilities, problem-solving skills, and confidence through structured learning.',
        slug: 'benefits-of-chess-for-children',
        status: 'published',
        featured_image: '/images/indian-img-two.jpg',
        author: 'Coach Priya Sharma',
        tags: ['children', 'benefits', 'education', 'development']
      }
    ];

    blogs.forEach(blog => {
      createBlog(blog);
    });
    console.log('✅ Sample blogs created!');

    // Insert sample gallery images
    console.log('🖼️ Creating sample gallery...');
    const galleryImages = [
      {
        image_name: 'Chess Training Session',
        image_url: '/images/indian-img-one.jpg',
        category: 'training',
        display_order: 1
      },
      {
        image_name: 'Tournament Winners',
        image_url: '/images/indian-img-two.jpg',
        category: 'tournaments',
        display_order: 2
      },
      {
        image_name: 'Chess Academy Classroom',
        image_url: '/images/indian-img-three.jpg',
        category: 'academy',
        display_order: 3
      },
      {
        image_name: 'Young Chess Champions',
        image_url: '/images/indian-img-one.jpg',
        category: 'students',
        display_order: 4
      }
    ];

    galleryImages.forEach(image => {
      createGalleryImage(image);
    });
    console.log('✅ Sample gallery created!');

    console.log('================================================');
    console.log('🎉 SQLite Database Initialization Complete!');
    console.log('✅ All tables created successfully');
    console.log('✅ Sample data inserted');
    console.log('✅ Admin user created');
    console.log('');
    console.log('🔑 Admin Login Credentials:');
    console.log('   Email: admin@thinqchess.com');
    console.log('   Password: 1234');
    console.log('');
    console.log('🚀 Your ThinQ Chess system is ready!');
    console.log('📁 Database file: data/thinqchess.db');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if called directly
if (require.main === module) {
  initializeSQLiteDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { initializeSQLiteDatabase };
