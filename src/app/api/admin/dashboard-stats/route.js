import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get dashboard statistics from SimpleDB
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get total registrations
    const totalRegistrations = await db.get('SELECT COUNT(*) as count FROM tournament_registrations') || { count: 0 };

    // Get total blogs
    const totalBlogs = await db.get('SELECT COUNT(*) as count FROM blogs') || { count: 0 };

    // Get published blogs
    const publishedBlogs = await db.get('SELECT COUNT(*) as count FROM blogs WHERE status = ?', ['published']) || { count: 0 };

    // Get total gallery images
    const totalGalleryImages = await db.get('SELECT COUNT(*) as count FROM gallery_images') || { count: 0 };

    // Get total discount codes
    const totalDiscountCodes = await db.get('SELECT COUNT(*) as count FROM discount_codes') || { count: 0 };

    // Get active discount codes
    const activeDiscountCodes = await db.get('SELECT COUNT(*) as count FROM discount_codes WHERE is_active = 1') || { count: 0 };

    // Get pending demo requests count
    const pendingDemos = await db.get('SELECT COUNT(*) as count FROM demo_requests WHERE status = ?', ['pending']) || { count: 0 };

    // Get pending demo requests (last 5)
    const pendingDemoRequests = await db.prepare(`
      SELECT parent_name, child_name, email, age, message, created_at
      FROM demo_requests
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 5
    `).all();
    
    // Calculate revenue (completed payments)
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tournament_registrations WHERE payment_status = ?').get('completed') || { total: 0 };

    // Get completed registrations count
    const completedRegistrations = db.prepare('SELECT COUNT(*) as count FROM tournament_registrations WHERE payment_status = ?').get('completed') || { count: 0 };
    
    // Get registration stats by type
    const registrationsByType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM tournament_registrations 
      GROUP BY type
    `).all();
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: completedRegistrations.count || 0, // Use completed registrations instead of all
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
