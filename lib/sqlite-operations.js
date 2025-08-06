// SQLite Database Operations - All CRUD operations for the application
const { getDatabase } = require('./sqlite.js');

// ==================== ADMIN SETTINGS OPERATIONS ====================

export function getAdminSettings() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1');
  const result = stmt.get();
  
  if (result && result.tournament_types) {
    try {
      result.tournament_types = JSON.parse(result.tournament_types);
    } catch (e) {
      result.tournament_types = [];
    }
  }
  
  return result;
}

export function updateAdminSettings(settings) {
  const db = getDatabase();
  
  // Check if settings exist
  const existing = getAdminSettings();
  
  if (existing) {
    // Update existing settings
    const stmt = db.prepare(`
      UPDATE admin_settings 
      SET tournament_fee = ?, registration_fee = ?, max_participants = ?, 
          countdown_end_date = ?, tournament_registration_active = ?,
          tournament_registration_mode = ?, tournament_open_date = ?,
          tournament_close_date = ?, tournament_closed_message = ?,
          course_registration_active = ?, coming_soon_message = ?,
          tournament_types = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(
      settings.tournament_fee,
      settings.registration_fee,
      settings.max_participants,
      settings.countdown_end_date,
      settings.tournament_registration_active ? 1 : 0,
      settings.tournament_registration_mode,
      settings.tournament_open_date,
      settings.tournament_close_date,
      settings.tournament_closed_message,
      settings.course_registration_active ? 1 : 0,
      settings.coming_soon_message,
      JSON.stringify(settings.tournament_types || []),
      existing.id
    );
    
    return getAdminSettings();
  } else {
    // Insert new settings
    const stmt = db.prepare(`
      INSERT INTO admin_settings (
        tournament_fee, registration_fee, max_participants, countdown_end_date,
        tournament_registration_active, tournament_registration_mode,
        tournament_open_date, tournament_close_date, tournament_closed_message,
        course_registration_active, coming_soon_message, tournament_types
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      settings.tournament_fee,
      settings.registration_fee,
      settings.max_participants,
      settings.countdown_end_date,
      settings.tournament_registration_active ? 1 : 0,
      settings.tournament_registration_mode,
      settings.tournament_open_date,
      settings.tournament_close_date,
      settings.tournament_closed_message,
      settings.course_registration_active ? 1 : 0,
      settings.coming_soon_message,
      JSON.stringify(settings.tournament_types || [])
    );
    
    return getAdminSettings();
  }
}

// ==================== TOURNAMENT OPERATIONS ====================

export function getAllTournaments() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tournaments ORDER BY created_at DESC');
  return stmt.all();
}

export function getTournamentById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
  return stmt.get(id);
}

export function getTournamentsByStatus(status) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tournaments WHERE status = ? ORDER BY start_date DESC');
  return stmt.all(status);
}

export function createTournament(tournament) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tournaments (
      name, description, start_date, end_date, registration_start_date,
      registration_end_date, fee, max_participants, status, venue, rules, prizes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    tournament.name,
    tournament.description,
    tournament.start_date,
    tournament.end_date,
    tournament.registration_start_date,
    tournament.registration_end_date,
    tournament.fee,
    tournament.max_participants,
    tournament.status || 'upcoming',
    tournament.venue,
    tournament.rules,
    JSON.stringify(tournament.prizes || {})
  );
  
  return getTournamentById(result.lastInsertRowid);
}

export function updateTournament(id, tournament) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE tournaments 
    SET name = ?, description = ?, start_date = ?, end_date = ?,
        registration_start_date = ?, registration_end_date = ?, fee = ?,
        max_participants = ?, status = ?, venue = ?, rules = ?, prizes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(
    tournament.name,
    tournament.description,
    tournament.start_date,
    tournament.end_date,
    tournament.registration_start_date,
    tournament.registration_end_date,
    tournament.fee,
    tournament.max_participants,
    tournament.status,
    tournament.venue,
    tournament.rules,
    JSON.stringify(tournament.prizes || {}),
    id
  );
  
  return getTournamentById(id);
}

export function deleteTournament(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tournaments WHERE id = ?');
  return stmt.run(id);
}

// ==================== REGISTRATION OPERATIONS ====================

export function getAllRegistrations() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tournament_registrations ORDER BY registered_at DESC');
  return stmt.all();
}

export function getRegistrationById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tournament_registrations WHERE id = ?');
  return stmt.get(id);
}

export function getRegistrationsByTournament(tournamentId) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM registrations WHERE tournament_id = ? ORDER BY registered_at DESC');
  return stmt.all(tournamentId);
}

export function createRegistration(registration) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO tournament_registrations (
      participant_first_name, participant_last_name, email, phone, dob, gender,
      tournament_type, country, state, city, address, amount_paid, discount_code,
      discount_amount, payment_id, razorpay_order_id, payment_status, type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
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
    registration.address,
    registration.amount_paid,
    registration.discount_code,
    registration.discount_amount,
    registration.payment_id,
    registration.razorpay_order_id,
    registration.payment_status || 'pending',
    registration.type || 'tournament'
  );
  
  return getRegistrationById(result.lastInsertRowid);
}

export function createTournamentRegistration(tournamentId, registration) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO registrations (
      tournament_id, participant_first_name, participant_last_name, email, phone,
      dob, gender, tournament_type, country, state, city, address, amount_paid,
      discount_code, discount_amount, payment_id, razorpay_order_id, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    tournamentId,
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
    registration.address,
    registration.amount_paid,
    registration.discount_code,
    registration.discount_amount,
    registration.payment_id,
    registration.razorpay_order_id,
    registration.payment_status || 'pending'
  );
  
  return result.lastInsertRowid;
}

export function updateRegistrationStatus(id, status) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE tournament_registrations SET payment_status = ? WHERE id = ?');
  return stmt.run(status, id);
}

// ==================== DISCOUNT CODE OPERATIONS ====================

export function getAllDiscountCodes() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM discount_codes ORDER BY created_at DESC');
  return stmt.all();
}

export function getDiscountCodeByCode(code) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1');
  return stmt.get(code);
}

export function createDiscountCode(discountCode) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO discount_codes (code, discount_percent, is_active, usage_limit, code_type, prefix, email_domain)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    discountCode.code,
    discountCode.discount_percent,
    discountCode.is_active ? 1 : 0,
    discountCode.usage_limit,
    discountCode.code_type,
    discountCode.prefix,
    discountCode.email_domain
  );
  
  return result.lastInsertRowid;
}

export function updateDiscountCodeUsage(code) {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?');
  return stmt.run(code);
}

export function deleteDiscountCode(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM discount_codes WHERE id = ?');
  return stmt.run(id);
}

// ==================== BLOG OPERATIONS ====================

export function getAllBlogs(status = null) {
  const db = getDatabase();
  let stmt;

  if (status) {
    stmt = db.prepare('SELECT * FROM blogs WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status);
  } else {
    stmt = db.prepare('SELECT * FROM blogs ORDER BY created_at DESC');
    return stmt.all();
  }
}

export function getBlogById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM blogs WHERE id = ?');
  return stmt.get(id);
}

export function getBlogBySlug(slug) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM blogs WHERE slug = ?');
  return stmt.get(slug);
}

export function createBlog(blog) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO blogs (title, content, excerpt, slug, author, status, tags, featured_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    blog.title,
    blog.content,
    blog.excerpt,
    blog.slug,
    blog.author || 'Admin',
    blog.status || 'draft',
    JSON.stringify(blog.tags || []),
    blog.featured_image
  );

  return getBlogById(result.lastInsertRowid);
}

export function updateBlog(id, blog) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE blogs
    SET title = ?, content = ?, excerpt = ?, slug = ?, author = ?,
        status = ?, tags = ?, featured_image = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(
    blog.title,
    blog.content,
    blog.excerpt,
    blog.slug,
    blog.author,
    blog.status,
    JSON.stringify(blog.tags || []),
    blog.featured_image,
    id
  );

  return getBlogById(id);
}

export function deleteBlog(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM blogs WHERE id = ?');
  return stmt.run(id);
}

// ==================== GALLERY OPERATIONS ====================

export function getAllGalleryImages() {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM gallery_images ORDER BY display_order ASC, uploaded_at DESC');
  return stmt.all();
}

export function getGalleryImageById(id) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM gallery_images WHERE id = ?');
  return stmt.get(id);
}

export function getGalleryImagesByCategory(category) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM gallery_images WHERE category = ? ORDER BY display_order ASC');
  return stmt.all(category);
}

export function createGalleryImage(image) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO gallery_images (image_name, image_url, category, display_order)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    image.image_name,
    image.image_url,
    image.category || 'uncategorized',
    image.display_order || 0
  );

  return getGalleryImageById(result.lastInsertRowid);
}

export function updateGalleryImage(id, image) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE gallery_images
    SET image_name = ?, image_url = ?, category = ?, display_order = ?
    WHERE id = ?
  `);

  const result = stmt.run(
    image.image_name,
    image.image_url,
    image.category,
    image.display_order,
    id
  );

  return getGalleryImageById(id);
}

export function deleteGalleryImage(id) {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM gallery_images WHERE id = ?');
  return stmt.run(id);
}

// ==================== ADMIN USER OPERATIONS ====================

export function getAdminUserByEmail(email) {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM admin_users WHERE email = ?');
  return stmt.get(email);
}

export function createAdminUser(user) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO admin_users (email, password, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    user.email,
    user.password,
    user.password_hash,
    user.role || 'admin'
  );

  return result.lastInsertRowid;
}

// Export all functions
module.exports = {
  // Admin Settings
  getAdminSettings,
  updateAdminSettings,

  // Tournaments
  getAllTournaments,
  getTournamentById,
  getTournamentsByStatus,
  createTournament,
  updateTournament,
  deleteTournament,

  // Registrations
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsByTournament,
  createRegistration,
  createTournamentRegistration,
  updateRegistrationStatus,

  // Discount Codes
  getAllDiscountCodes,
  getDiscountCodeByCode,
  createDiscountCode,
  updateDiscountCodeUsage,
  deleteDiscountCode,

  // Blogs
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,

  // Gallery
  getAllGalleryImages,
  getGalleryImageById,
  getGalleryImagesByCategory,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,

  // Admin Users
  getAdminUserByEmail,
  createAdminUser
};
