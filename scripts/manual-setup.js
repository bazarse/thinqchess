// Manual table creation using REST API
const fetch = require('node-fetch');

const supabaseUrl = 'https://vkchykbemnzlknvtlfxx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrY2h5a2JlbW56bGtudnRsZnh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzODkxOSwiZXhwIjoyMDY5MjE0OTE5fQ.EnJlGRIvuehZjZGtspRRdPq99BNLagrQWayFq_KAsHI';

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    });

    const result = await response.text();
    console.log('SQL Response:', result);
    return result;
  } catch (error) {
    console.error('SQL Error:', error);
    return null;
  }
}

async function createTablesManually() {
  console.log('🚀 Creating tables manually...');

  // Create exec_sql function first
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'OK';
    END;
    $$;
  `;

  console.log('Creating exec_sql function...');
  await executeSQL(createFunction);

  // Now create tables
  const createTables = `
    CREATE TABLE IF NOT EXISTS blogs (
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
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id BIGSERIAL PRIMARY KEY,
      image_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'uncategorized',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tournament_registrations (
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
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      id BIGSERIAL PRIMARY KEY,
      tournament_fee DECIMAL(10,2) DEFAULT 500,
      registration_fee DECIMAL(10,2) DEFAULT 400,
      max_participants INTEGER DEFAULT 50,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
    VALUES (500, 400, 50)
    ON CONFLICT DO NOTHING;

    INSERT INTO blogs (title, content, excerpt, slug, status, featured_image)
    VALUES (
      'Welcome to ThinQ Chess Academy',
      'Welcome to our chess academy! We provide world-class chess training for players of all levels.',
      'Join our chess academy for expert training and tournaments.',
      'welcome-to-thinq-chess',
      'published',
      '/images/indian-img-one.jpg'
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO gallery_images (image_name, image_url, category, display_order)
    VALUES 
      ('Chess Training Session', '/images/indian-img-one.jpg', 'training', 1),
      ('Tournament Winners', '/images/indian-img-two.jpg', 'tournaments', 2),
      ('Chess Academy', '/images/indian-img-three.jpg', 'academy', 3)
    ON CONFLICT DO NOTHING;
  `;

  console.log('Creating all tables and inserting data...');
  await executeSQL(createTables);

  console.log('✅ Manual setup complete!');
}

createTablesManually().catch(console.error);
