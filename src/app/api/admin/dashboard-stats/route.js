import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get dashboard statistics from SimpleDB
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get stats with proper error handling
    let totalRegistrations = { count: 0 };
    let totalBlogs = { count: 0 };
    let publishedBlogs = { count: 0 };
    let totalGalleryImages = { count: 0 };
    let totalDiscountCodes = { count: 0 };
    let activeDiscountCodes = { count: 0 };
    let pendingDemos = { count: 0 };
    let pendingDemoRequests = [];
    let totalRevenue = { total: 0 };
    let completedRevenue = { total: 0 };
    let registrationsByType = [];

    try {
      totalRegistrations = await db.get('SELECT COUNT(*) as count FROM tournament_registrations') || { count: 0 };
    } catch (e) { console.log('No tournament_registrations table'); }

    try {
      totalBlogs = await db.get('SELECT COUNT(*) as count FROM blogs') || { count: 0 };
    } catch (e) { console.log('No blogs table'); }

    try {
      publishedBlogs = await db.get('SELECT COUNT(*) as count FROM blogs WHERE status = ?', ['published']) || { count: 0 };
    } catch (e) { console.log('No published blogs'); }

    try {
      totalGalleryImages = await db.get('SELECT COUNT(*) as count FROM gallery_images') || { count: 0 };
    } catch (e) { console.log('No gallery_images table'); }

    try {
      totalDiscountCodes = await db.get('SELECT COUNT(*) as count FROM discount_codes') || { count: 0 };
    } catch (e) { console.log('No discount_codes table'); }

    try {
      activeDiscountCodes = await db.get('SELECT COUNT(*) as count FROM discount_codes WHERE is_active = 1') || { count: 0 };
    } catch (e) { console.log('No active discount codes'); }

    try {
      pendingDemos = await db.get('SELECT COUNT(*) as count FROM demo_requests WHERE status = ?', ['pending']) || { count: 0 };
    } catch (e) { console.log('No demo_requests table'); }

    try {
      pendingDemoRequests = await db.all(`
        SELECT parent_name, child_name, email, age, message, created_at
        FROM demo_requests
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT 5
      `, ['pending']) || [];
    } catch (e) { console.log('No pending demo requests'); }

    try {
      totalRevenue = await db.get('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tournament_registrations WHERE amount_paid > 0') || { total: 0 };
    } catch (e) { console.log('No revenue data'); }

    try {
      completedRevenue = await db.get('SELECT COALESCE(SUM(amount_paid), 0) as total FROM tournament_registrations WHERE payment_status = ?', ['completed']) || { total: 0 };
    } catch (e) { console.log('No completed revenue data'); }

    try {
      registrationsByType = await db.all(`
        SELECT type, COUNT(*) as count
        FROM tournament_registrations
        GROUP BY type
      `) || [];
    } catch (e) { console.log('No registration type data'); }
    
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
