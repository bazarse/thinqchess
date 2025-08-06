const { db } = require('./database.js');

export function query(text, params = []) {
  try {
    const stmt = db.prepare(text);
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      return { rows: stmt.all(...params) };
    } else {
      const result = stmt.run(...params);
      return { rows: [], rowCount: result.changes, insertId: result.lastInsertRowid };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Admin Settings Functions
export function getAdminSettings() {
  try {
    const result = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    return result;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
}

export async function updateAdminSettings(settings) {
  try {
    const { tournament_fee, registration_fee, max_participants, countdown_end_date } = settings;
    
    const result = await pool.query(`
      UPDATE admin_settings 
      SET tournament_fee = ${tournament_fee},
          registration_fee = ${registration_fee},
          max_participants = ${max_participants},
          countdown_end_date = ${countdown_end_date},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM admin_settings ORDER BY id DESC LIMIT 1)
      RETURNING *
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
}

// Discount Code Functions
export async function validateDiscountCode(code) {
  try {
    const result = await pool.query(`
      SELECT * FROM discount_codes 
      WHERE code = ${code} AND is_active = true AND used_count < usage_limit
    `);
    return result.rows[0];
  } catch (error) {
    console.error('Error validating discount code:', error);
    throw error;
  }
}

export async function incrementDiscountUsage(code) {
  try {
    await pool.query(`
      UPDATE discount_codes 
      SET used_count = used_count + 1 
      WHERE code = ${code}
    `);
  } catch (error) {
    console.error('Error incrementing discount usage:', error);
    throw error;
  }
}

export async function getAllDiscountCodes() {
  try {
    const result = await pool.query(`SELECT * FROM discount_codes ORDER BY created_at DESC`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    throw error;
  }
}

// Tournament Registration Functions
export async function saveRegistration(registrationData) {
  try {
    const {
      participant_first_name,
      participant_last_name,
      email,
      phone,
      amount_paid,
      discount_code,
      discount_amount,
      payment_id,
      razorpay_order_id,
      payment_status
    } = registrationData;

    const result = db.prepare(`
      INSERT INTO tournament_registrations (
        participant_first_name, participant_last_name, email, phone,
        amount_paid, discount_code, discount_amount, payment_id,
        razorpay_order_id, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      participant_first_name, participant_last_name, email, phone,
      amount_paid, discount_code, discount_amount, payment_id,
      razorpay_order_id, payment_status
    );

    return db.prepare('SELECT * FROM tournament_registrations WHERE id = ?').get(result.lastInsertRowid);
  } catch (error) {
    console.error('Error saving registration:', error);
    throw error;
  }
}

export async function getRegistrationCount() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count FROM tournament_registrations 
      WHERE payment_status = 'completed'
    `);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting registration count:', error);
    throw error;
  }
}

export async function getAllRegistrations(startDate = null, endDate = null) {
  try {
    let query = `SELECT * FROM tournament_registrations WHERE payment_status = 'completed'`;
    const params = [];
    
    if (startDate && endDate) {
      query += ` AND registered_at BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    }
    
    query += ` ORDER BY registered_at DESC`;
    
    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

// Gallery Functions
export async function getAllGalleryImages() {
  try {
    const result = await pool.query(`SELECT * FROM gallery_images ORDER BY display_order ASC, uploaded_at DESC`);
    return result.rows;
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
}

export async function addGalleryImage(imageData) {
  try {
    const { image_url, image_name, display_order } = imageData;
    
    const result = await pool.query(`
      INSERT INTO gallery_images (image_url, image_name, display_order)
      VALUES (${image_url}, ${image_name}, ${display_order})
      RETURNING *
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error adding gallery image:', error);
    throw error;
  }
}

export async function deleteGalleryImage(id) {
  try {
    await pool.query(`DELETE FROM gallery_images WHERE id = ${id}`);
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
}

export async function updateGalleryImageOrder(imageOrders) {
  try {
    for (const { id, display_order } of imageOrders) {
      await pool.query(`UPDATE gallery_images SET display_order = ${display_order} WHERE id = ${id}`);
    }
  } catch (error) {
    console.error('Error updating gallery image order:', error);
    throw error;
  }
}

// Blog Functions
export async function getAllBlogs(status = null) {
  try {
    let query = `SELECT * FROM blogs`;
    const params = [];
    
    if (status) {
      query += ` WHERE status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await sql.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

export async function getBlogBySlug(slug) {
  try {
    const result = await pool.query(`SELECT * FROM blogs WHERE slug = ${slug} AND status = 'published'`);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw error;
  }
}

export async function createBlog(blogData) {
  try {
    const { title, slug, content, featured_image, status } = blogData;
    
    const result = await pool.query(`
      INSERT INTO blogs (title, slug, content, featured_image, status)
      VALUES (${title}, ${slug}, ${content}, ${featured_image}, ${status})
      RETURNING *
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

export async function updateBlog(id, blogData) {
  try {
    const { title, slug, content, featured_image, status } = blogData;
    
    const result = await pool.query(`
      UPDATE blogs 
      SET title = ${title}, slug = ${slug}, content = ${content}, 
          featured_image = ${featured_image}, status = ${status},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

export async function deleteBlog(id) {
  try {
    await pool.query(`DELETE FROM blogs WHERE id = ${id}`);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// Admin User Functions
export async function getAdminByEmail(email) {
  try {
    const result = await pool.query(`SELECT * FROM admin_users WHERE email = ${email}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching admin by email:', error);
    throw error;
  }
}
