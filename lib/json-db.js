// Simple JSON-based database for Vercel compatibility
const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data');
    this.tables = {};
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Create data directory if it doesn't exist (local only)
    if (process.env.NODE_ENV !== 'production') {
      if (!fs.existsSync(this.dbPath)) {
        fs.mkdirSync(this.dbPath, { recursive: true });
      }
    }

    // Initialize with sample data
    this.tables = {
      admin_settings: [
        {
          id: 1,
          tournament_fee: 500.00,
          registration_fee: 400.00,
          max_participants: 50,
          tournament_registration_active: true,
          course_registration_active: true,
          coming_soon_message: 'Coming Soon! New tournament season starting soon.',
          created_at: new Date().toISOString()
        }
      ],
      tournaments: [
        {
          id: 1,
          name: 'ThinQ Chess Championship 2024',
          description: 'Annual chess championship for all age groups',
          start_date: '2024-12-25',
          end_date: '2024-12-26',
          status: 'upcoming',
          is_active: true,
          fee: 500.00,
          max_participants: 50,
          categories: '[]',
          created_at: new Date().toISOString()
        }
      ],
      tournament_registrations: [
        {
          id: 1,
          tournament_id: 1,
          participant_first_name: 'Arjun',
          participant_last_name: 'Sharma',
          email: 'arjun@email.com',
          phone: '+91-9876543210',
          dob: '2010-05-15',
          gender: 'Male',
          tournament_type: 'open',
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai',
          amount_paid: 500.00,
          payment_status: 'completed',
          registered_at: new Date().toISOString()
        },
        {
          id: 2,
          tournament_id: 1,
          participant_first_name: 'Priya',
          participant_last_name: 'Patel',
          email: 'priya@email.com',
          phone: '+91-9876543211',
          dob: '2008-08-20',
          gender: 'Female',
          tournament_type: 'open',
          country: 'India',
          state: 'Gujarat',
          city: 'Ahmedabad',
          amount_paid: 500.00,
          payment_status: 'completed',
          registered_at: new Date().toISOString()
        }
      ],
      admin_users: [
        {
          id: 1,
          email: 'admin@thinqchess.com',
          password: '1234',
          password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ],
      discount_codes: [
        {
          id: 1,
          code: 'DEMO10',
          discount_type: 'percentage',
          discount_value: 10,
          usage_limit: 100,
          used_count: 0,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      blogs: [
        {
          id: 1,
          title: 'Welcome to ThinQ Chess Academy',
          content: 'Welcome to our premier chess academy! We provide world-class chess training for players of all levels.',
          excerpt: 'Join our chess academy for expert training and tournaments.',
          slug: 'welcome-to-thinq-chess',
          status: 'published',
          featured_image: '/images/chess-banner.jpg',
          author: 'Admin',
          created_at: new Date().toISOString()
        }
      ]
    };

    console.log('✅ JSON Database initialized with sample data');
  }

  // SQLite-compatible interface
  prepare(query) {
    return {
      all: (...params) => this.executeQuery(query, params, 'all'),
      get: (...params) => this.executeQuery(query, params, 'get'),
      run: (...params) => this.executeQuery(query, params, 'run')
    };
  }

  executeQuery(query, params = [], type = 'all') {
    try {
      const normalizedQuery = query.trim().toLowerCase();
      
      if (normalizedQuery.startsWith('select')) {
        return this.handleSelect(query, params, type);
      } else if (normalizedQuery.startsWith('insert')) {
        return this.handleInsert(query, params);
      } else if (normalizedQuery.startsWith('update')) {
        return this.handleUpdate(query, params);
      } else if (normalizedQuery.startsWith('delete')) {
        return this.handleDelete(query, params);
      }
      
      return type === 'all' ? [] : null;
    } catch (error) {
      console.error('Query execution error:', error);
      return type === 'all' ? [] : null;
    }
  }

  handleSelect(query, params, type) {
    // Simple SELECT implementation
    const tableMatch = query.match(/from\s+(\w+)/i);
    if (!tableMatch) return type === 'all' ? [] : null;
    
    const tableName = tableMatch[1];
    const data = this.tables[tableName] || [];
    
    // Handle WHERE conditions (basic implementation)
    if (query.includes('WHERE') || query.includes('where')) {
      // For demo purposes, return all data
      // In a real implementation, you'd parse WHERE conditions
    }
    
    if (type === 'get') {
      return data[0] || null;
    }
    
    return data;
  }

  handleInsert(query, params) {
    // Simple INSERT implementation
    const tableMatch = query.match(/into\s+(\w+)/i);
    if (!tableMatch) return { changes: 0, lastInsertRowid: null };
    
    const tableName = tableMatch[1];
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }
    
    // Generate new ID
    const newId = Math.max(0, ...this.tables[tableName].map(row => row.id || 0)) + 1;
    
    // Create new record (simplified)
    const newRecord = {
      id: newId,
      created_at: new Date().toISOString(),
      ...Object.fromEntries(params.map((param, index) => [`field_${index}`, param]))
    };
    
    this.tables[tableName].push(newRecord);
    
    return { changes: 1, lastInsertRowid: newId };
  }

  handleUpdate(query, params) {
    // Simple UPDATE implementation
    const tableMatch = query.match(/update\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };
    
    const tableName = tableMatch[1];
    const data = this.tables[tableName] || [];
    
    // For demo purposes, update first record
    if (data.length > 0) {
      data[0].updated_at = new Date().toISOString();
      return { changes: 1 };
    }
    
    return { changes: 0 };
  }

  handleDelete(query, params) {
    // Simple DELETE implementation
    const tableMatch = query.match(/from\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };
    
    const tableName = tableMatch[1];
    const originalLength = (this.tables[tableName] || []).length;
    
    // For demo purposes, don't actually delete
    return { changes: 0 };
  }
}

// Create global instance
const db = new JSONDatabase();

module.exports = { db };
