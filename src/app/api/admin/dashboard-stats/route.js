import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get dashboard statistics from SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    // Get total registrations
    const totalRegistrations = db.prepare('SELECT COUNT(*) as count FROM tournament_registrations').get();
    
    // Get registrations this month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const monthlyRegistrations = db.prepare('SELECT COUNT(*) as count FROM tournament_registrations WHERE registered_at LIKE ?').get(`${currentMonth}%`);
    
    // Get total blogs
    const totalBlogs = db.prepare('SELECT COUNT(*) as count FROM blogs').get();
    
    // Get published blogs
    const publishedBlogs = db.prepare('SELECT COUNT(*) as count FROM blogs WHERE status = ?').get('published');
    
    // Get total gallery images
    const totalGalleryImages = db.prepare('SELECT COUNT(*) as count FROM gallery_images').get();
    
    // Get total discount codes
    const totalDiscountCodes = db.prepare('SELECT COUNT(*) as count FROM discount_codes').get();
    
    // Get active discount codes
    const activeDiscountCodes = db.prepare('SELECT COUNT(*) as count FROM discount_codes WHERE is_active = 1').get();

    // Get pending demo requests count
    const pendingDemos = db.prepare('SELECT COUNT(*) as count FROM demo_requests WHERE status = ?').get('pending');

    // Get pending demo requests (last 5)
    const pendingDemoRequests = db.prepare(`
      SELECT parent_name, child_name, email, age, message, created_at
      FROM demo_requests
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 5
    `).all();
    
    // Calculate revenue (completed payments)
    const totalRevenue = db.prepare('SELECT SUM(amount_paid) as total FROM tournament_registrations WHERE payment_status = ?').get('completed');
    
    // Get registration stats by type
    const registrationsByType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM tournament_registrations 
      GROUP BY type
    `).all();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: totalRegistrations.count || 0,
        monthlyRegistrations: monthlyRegistrations.count || 0,
        totalBlogs: totalBlogs.count || 0,
        publishedBlogs: publishedBlogs.count || 0,
        totalGalleryImages: totalGalleryImages.count || 0,
        totalDiscountCodes: totalDiscountCodes.count || 0,
        activeDiscountCodes: activeDiscountCodes.count || 0,
        totalRevenue: totalRevenue.total || 0,
        pendingDemos: pendingDemos.count || 0,
        registrationsByType: registrationsByType || []
      },
      pendingDemos: pendingDemoRequests || []
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
