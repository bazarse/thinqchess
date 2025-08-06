// Firebase initialization script
// Run this script to set up initial data in Firebase

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "thinq-79d4a",
  // Add your service account key details here
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "thinq-79d4a.firebasestorage.app"
});

const db = admin.firestore();

async function initializeFirebase() {
  try {
    console.log('🚀 Initializing Firebase data...');

    // 1. Create default admin user
    const adminEmail = 'admin@thinqchess.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.collection('admin_users').doc('default-admin').set({
      email: adminEmail,
      password_hash: hashedPassword,
      role: 'admin',
      name: 'ThinQ Chess Admin',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Default admin user created');

    // 2. Create default admin settings
    await db.collection('admin_settings').doc('default-settings').set({
      tournament_fee: 500.00,
      registration_fee: 400.00,
      max_participants: 50,
      countdown_end_date: null,
      tournament_types: ['Rapid', 'Blitz', 'Classical'],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Default admin settings created');

    // 3. Create sample discount codes
    const discountCodes = [
      {
        code: 'TC10',
        discount_percent: 10,
        usage_limit: 100,
        used_count: 0,
        is_active: true,
        description: '10% off tournament registration',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'TC20',
        discount_percent: 20,
        usage_limit: 50,
        used_count: 0,
        is_active: true,
        description: '20% off tournament registration',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        code: 'STUDENT25',
        discount_percent: 25,
        usage_limit: 200,
        used_count: 0,
        is_active: true,
        description: '25% student discount',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const discountCode of discountCodes) {
      await db.collection('discount_codes').add(discountCode);
    }

    console.log('✅ Sample discount codes created');

    // 4. Create sample blog posts
    const blogPosts = [
      {
        title: 'Getting Started with Chess: A Beginner\'s Guide',
        slug: 'getting-started-with-chess',
        content: 'Chess is a wonderful game that teaches strategy, patience, and critical thinking...',
        featured_image: '',
        status: 'published',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        title: 'Top 10 Chess Opening Strategies',
        slug: 'top-10-chess-opening-strategies',
        content: 'Learn the most effective chess openings that will give you an advantage...',
        featured_image: '',
        status: 'published',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (const blog of blogPosts) {
      await db.collection('blogs').add(blog);
    }

    console.log('✅ Sample blog posts created');

    // 5. Create sample tournament
    await db.collection('tournaments').add({
      name: 'ThinQ Chess Spring Championship 2024',
      description: 'Join our exciting spring tournament with prizes for all age groups!',
      start_date: new Date('2024-04-15'),
      end_date: new Date('2024-04-16'),
      registration_deadline: new Date('2024-04-10'),
      max_participants: 50,
      entry_fee: 500,
      tournament_types: ['Rapid', 'Blitz'],
      venue: 'ThinQ Chess Academy, Bangalore',
      rules: 'Standard FIDE rules apply. Time control: 15+10 for Rapid, 5+3 for Blitz.',
      prizes: 'Winner: ₹5000, Runner-up: ₹3000, Third: ₹2000',
      status: 'upcoming',
      current_participants: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Sample tournament created');

    console.log('🎉 Firebase initialization completed successfully!');
    console.log('');
    console.log('📋 Default Admin Credentials:');
    console.log('Email: admin@thinqchess.com');
    console.log('Password: admin123');
    console.log('');
    console.log('🎫 Sample Discount Codes:');
    console.log('TC10 - 10% off');
    console.log('TC20 - 20% off');
    console.log('STUDENT25 - 25% off');

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializeFirebase();
