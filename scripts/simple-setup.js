// Simple Supabase setup using direct client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vkchykbemnzlknvtlfxx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrY2h5a2JlbW56bGtudnRsZnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzODkxOSwiZXhwIjoyMDY5MjE0OTE5fQ.EnJlGRIvuehZjZGtspRRdPq99BNLagrQWayFq_KAsHI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Try to get current user
    const { data, error } = await supabase.auth.getUser();
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

async function createStorageBuckets() {
  console.log('📁 Creating storage buckets...');

  const buckets = [
    { name: 'blog-images', public: true },
    { name: 'gallery-images', public: true },
    { name: 'general-uploads', public: true }
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`✅ Bucket ${bucket.name} already exists!`);
        } else {
          console.error(`❌ Error creating bucket ${bucket.name}:`, error.message);
        }
      } else {
        console.log(`✅ Bucket ${bucket.name} created successfully!`);
      }
    } catch (error) {
      console.error(`❌ Bucket creation failed for ${bucket.name}:`, error.message);
    }
  }
}

async function insertSampleData() {
  console.log('📝 Inserting sample data (if tables exist)...');

  // Try to insert admin settings
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .insert([{
        tournament_fee: 500,
        registration_fee: 400,
        max_participants: 50
      }]);

    if (error) {
      console.log('ℹ️ Admin settings table may not exist yet:', error.message);
    } else {
      console.log('✅ Admin settings inserted!');
    }
  } catch (error) {
    console.log('ℹ️ Could not insert admin settings:', error.message);
  }

  // Try to insert sample blog
  try {
    const { data, error } = await supabase
      .from('blogs')
      .insert([{
        title: 'Welcome to ThinQ Chess Academy',
        content: 'Welcome to our chess academy! We provide world-class chess training for players of all levels. Our expert coaches will help you improve your game and achieve your chess goals.',
        excerpt: 'Join our chess academy for expert training and tournaments.',
        slug: 'welcome-to-thinq-chess',
        status: 'published',
        featured_image: '/images/indian-img-one.jpg',
        author: 'Admin'
      }]);

    if (error) {
      console.log('ℹ️ Blogs table may not exist yet:', error.message);
    } else {
      console.log('✅ Sample blog inserted!');
    }
  } catch (error) {
    console.log('ℹ️ Could not insert blog:', error.message);
  }

  // Try to insert gallery images
  try {
    const { data, error } = await supabase
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
        },
        {
          image_name: 'Chess Academy',
          image_url: '/images/indian-img-three.jpg',
          category: 'academy',
          display_order: 3
        }
      ]);

    if (error) {
      console.log('ℹ️ Gallery table may not exist yet:', error.message);
    } else {
      console.log('✅ Gallery images inserted!');
    }
  } catch (error) {
    console.log('ℹ️ Could not insert gallery images:', error.message);
  }
}

async function checkTables() {
  console.log('🔍 Checking if tables exist...');

  const tables = ['blogs', 'gallery_images', 'tournament_registrations', 'admin_settings'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${table} does not exist:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and accessible!`);
      }
    } catch (error) {
      console.log(`❌ Error checking table ${table}:`, error.message);
    }
  }
}

async function runSetup() {
  console.log('🎯 ThinQ Chess - Simple Supabase Setup');
  console.log('=====================================');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Setup aborted due to connection issues');
    return;
  }

  // Create storage buckets
  await createStorageBuckets();

  // Check if tables exist
  await checkTables();

  // Try to insert sample data
  await insertSampleData();

  console.log('=====================================');
  console.log('🎉 Setup process complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Go to Supabase Dashboard SQL Editor');
  console.log('2. Run the SQL from supabase-setup.sql file');
  console.log('3. Test the website: http://localhost:3000/admin');
  console.log('');
  console.log('🔗 Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/vkchykbemnzlknvtlfxx');
}

runSetup().catch(console.error);
