const { getDB } = require('./database.js');

/**
 * Migration script to add new columns to tournament_registrations table
 * for enhanced course registration support
 */
function migrateDatabase() {
  const db = getDB();
  
  console.log('🔄 Starting database migration...');
  
  try {
    // Get current table structure
    const tableInfo = db.prepare("PRAGMA table_info(tournament_registrations)").all();
    const existingColumns = tableInfo.map(col => col.name);
    
    console.log('📋 Current columns:', existingColumns);
    
    // Define new columns to add
    const newColumns = [
      { name: 'participant_middle_name', type: 'TEXT' },
      { name: 'age', type: 'INTEGER' },
      { name: 'tournament_id', type: 'INTEGER' },
      { name: 'fide_id', type: 'TEXT' },
      { name: 'course_type', type: 'TEXT' },
      { name: 'classes_for', type: 'TEXT' },
      { name: 'father_first_name', type: 'TEXT' },
      { name: 'father_middle_name', type: 'TEXT' },
      { name: 'father_last_name', type: 'TEXT' },
      { name: 'father_email', type: 'TEXT' },
      { name: 'father_phone', type: 'TEXT' },
      { name: 'mother_first_name', type: 'TEXT' },
      { name: 'mother_middle_name', type: 'TEXT' },
      { name: 'mother_last_name', type: 'TEXT' },
      { name: 'mother_email', type: 'TEXT' },
      { name: 'mother_phone', type: 'TEXT' },
      { name: 'country_code', type: 'TEXT' },
      { name: 'address_line1', type: 'TEXT' },
      { name: 'address_line2', type: 'TEXT' },
      { name: 'pincode', type: 'TEXT' },
      { name: 'coaching_mode', type: 'TEXT' },
      { name: 'coaching_city', type: 'TEXT' },
      { name: 'preferred_centre', type: 'TEXT' },
      { name: 'heard_from', type: 'TEXT' },
      { name: 'referral_first_name', type: 'TEXT' },
      { name: 'referral_last_name', type: 'TEXT' },
      { name: 'other_source', type: 'TEXT' },
      { name: 'terms_condition_one', type: 'TEXT', default: "'No'" },
      { name: 'terms_condition_two', type: 'TEXT', default: "'No'" }
    ];
    
    // Add missing columns
    let addedColumns = 0;
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        try {
          const defaultClause = column.default ? ` DEFAULT ${column.default}` : '';
          const sql = `ALTER TABLE tournament_registrations ADD COLUMN ${column.name} ${column.type}${defaultClause}`;
          db.prepare(sql).run();
          console.log(`✅ Added column: ${column.name}`);
          addedColumns++;
        } catch (error) {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
        }
      } else {
        console.log(`⏭️  Column ${column.name} already exists`);
      }
    }
    
    console.log(`🎉 Migration completed! Added ${addedColumns} new columns.`);
    
    // Verify final structure
    const finalTableInfo = db.prepare("PRAGMA table_info(tournament_registrations)").all();
    console.log(`📊 Final table has ${finalTableInfo.length} columns`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
