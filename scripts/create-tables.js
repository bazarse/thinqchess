// Direct SQL execution to create tables
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkchykbemnzlknvtlfxx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrY2h5a2JlbW56bGtudnRsZnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzODkxOSwiZXhwIjoyMDY5MjE0OTE5fQ.EnJlGRIvuehZjZGtspRRdPq99BNLagrQWayFq_KAsHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating database tables...');

  const queries = [
    // Create blogs table
    `CREATE TABLE IF NOT EXISTS blogs (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      slug TEXT UNIQUE NOT NULL,
      author TEXT DEFAULT 'Admin',
      status TEXT DEFAULT 'draft',
      tags TEXT[],
      featured_image TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create gallery images table
    `CREATE TABLE IF NOT EXISTS gallery_images (
      id BIGSERIAL PRIMARY KEY,
      image_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'uncategorized',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create tournament registrations table
    `CREATE TABLE IF NOT EXISTS tournament_registrations (
      id BIGSERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      age INTEGER NOT NULL,
      chess_experience TEXT NOT NULL,
      tournament_type TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      amount DECIMAL(10,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Create admin settings table
    `CREATE TABLE IF NOT EXISTS admin_settings (
      id BIGSERIAL PRIMARY KEY,
      tournament_fee DECIMAL(10,2) DEFAULT 500,
      registration_fee DECIMAL(10,2) DEFAULT 400,
      max_participants INTEGER DEFAULT 50,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  ];

  for (let i = 0; i < queries.length; i++) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: queries[i]
      });

      if (error) {
        console.error(`❌ Error creating table ${i + 1}:`, error);
      } else {
        console.log(`✅ Table ${i + 1} created successfully!`);
      }
    } catch (error) {
      console.error(`❌ Failed to create table ${i + 1}:`, error);
    }
  }
}

async function insertData() {
  console.log('📝 Inserting sample data...');

  try {
    // Insert admin settings
    const { error: adminError } = await supabase
      .from('admin_settings')
      .insert([{
        tournament_fee: 500,
        registration_fee: 400,
        max_participants: 50
      }]);

    if (adminError && !adminError.message.includes('duplicate')) {
      console.error('❌ Error inserting admin settings:', adminError);
    } else {
      console.log('✅ Admin settings inserted!');
    }

    // Insert sample blog
    const { error: blogError } = await supabase
      .from('blogs')
      .insert([{
        title: 'Welcome to ThinQ Chess Academy',
        content: 'Welcome to our chess academy! We provide world-class chess training for players of all levels.',
        excerpt: 'Join our chess academy for expert training and tournaments.',
        slug: 'welcome-to-thinq-chess',
        status: 'published',
        featured_image: '/images/indian-img-one.jpg'
      }]);

    if (blogError && !blogError.message.includes('duplicate')) {
      console.error('❌ Error inserting blog:', blogError);
    } else {
      console.log('✅ Sample blog inserted!');
    }

    // Insert gallery images
    const { error: galleryError } = await supabase
      .from('gallery_images')
      .insert([
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
        }
      ]);

    if (galleryError && !galleryError.message.includes('duplicate')) {
      console.error('❌ Error inserting gallery:', galleryError);
    } else {
      console.log('✅ Gallery images inserted!');
    }

  } catch (error) {
    console.error('❌ Data insertion failed:', error);
  }
}

async function createBuckets() {
  console.log('📁 Creating storage buckets...');

  const buckets = ['blog-images', 'gallery-images', 'general-uploads'];

  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });

      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error creating bucket ${bucketName}:`, error);
      } else {
        console.log(`✅ Bucket ${bucketName} ready!`);
      }
    } catch (error) {
      console.error(`❌ Bucket creation failed for ${bucketName}:`, error);
    }
  }
}

async function runSetup() {
  console.log('🎯 ThinQ Chess - Direct Supabase Setup');
  console.log('=====================================');

  await createTables();
  await createBuckets();
  await insertData();

  console.log('=====================================');
  console.log('🎉 Setup complete!');
  console.log('🔗 Test: http://localhost:3000/admin');
}

runSetup().catch(console.error);
