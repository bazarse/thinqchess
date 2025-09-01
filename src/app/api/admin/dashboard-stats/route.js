import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get dashboard statistics from SimpleDB
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get total registrations (all registrations, not just completed)
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
    const pendingDemoRequests = await db.all(`
      SELECT parent_name, child_name, email, age, message, created_at
      FROM demo_requests
      WHERE status = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, ['pending']) || [];

    // Calculate revenue (all payments - both completed and pending)
    const totalRevenue = await db.get('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tournament_registrations WHERE amount_paid > 0') || { total: 0 };
    
    // Also get completed revenue separately for comparison
    const completedRevenue = await db.get('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tournament_registrations WHERE payment_status = ?', ['completed']) || { total: 0 };

    // Get completed registrations count
    const completedRegistrations = await db.get('SELECT COUNT(*) as count FROM tournament_registrations WHERE payment_status = ?', ['completed']) || { count: 0 };

    // Get registration stats by type
    const registrationsByType = await db.all(`
      SELECT type, COUNT(*) as count
      FROM tournament_registrations
      GROUP BY type
    `) || [];
    
    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: totalRegistrations.count || 0, // Show all registrations, not just completed
        totalBlogs: totalBlogs.count || 0,
        publishedBlogs: publishedBlogs.count || 0,
        totalGalleryImages: totalGalleryImages.count || 0,
        totalDiscountCodes: totalDiscountCodes.count || 0,
        activeDiscountCodes: activeDiscountCodes.count || 0,
        totalRevenue: totalRevenue.total || 0,
        completedRevenue: completedRevenue.total || 0,
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
