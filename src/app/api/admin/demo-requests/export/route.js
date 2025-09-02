import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const dateFilter = searchParams.get('date_filter') || 'all';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const format = searchParams.get('format') || 'csv';

    // Build query with same filters as main API
    let query = 'SELECT * FROM demo_requests';
    let params = [];
    let whereConditions = [];

    // Filter by status
    if (status !== 'all') {
      if (status === 'completed') {
        whereConditions.push('demo_completed = 1');
      } else if (status === 'pending') {
        whereConditions.push('demo_completed = 0');
      }
    }

    // Search functionality
    if (search) {
      whereConditions.push('(parent_name LIKE ? OR email LIKE ? OR phone LIKE ? OR child_name LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Date filtering (same logic as main API)
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last_7_days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (dateFrom) {
            startDate = new Date(dateFrom);
          }
          if (dateTo) {
            endDate = new Date(dateTo);
            endDate.setDate(endDate.getDate() + 1);
          }
          break;
      }

      if (startDate) {
        whereConditions.push('created_at >= ?');
        params.push(startDate.toISOString());
      }
      if (endDate) {
        whereConditions.push('created_at < ?');
        params.push(endDate.toISOString());
      }
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add ordering
    query += ' ORDER BY created_at DESC';

    // Execute query
    const requests = await db.all(query, params);

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Parent Name',
        'Email',
        'Phone',
        'Child Name',
        'Age',
        'Past Training',
        'State',
        'Country',
        'Message',
        'Demo Status',
        'Status',
        'Submitted Date',
        'Last Updated'
      ];

      const csvRows = requests.map(req => [
        req.id,
        req.parent_name || '',
        req.email || '',
        req.phone || '',
        req.child_name || '',
        req.age || '',
        req.past_training || '',
        req.state || '',
        req.country || '',
        req.message || '',
        req.demo_completed ? 'Completed' : 'Pending',
        req.status || '',
        req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : '',
        req.updated_at ? new Date(req.updated_at).toLocaleDateString('en-GB') : ''
      ]);

      // Create CSV content
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `demo-requests-${timestamp}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Default JSON response
    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('Error exporting demo requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to export demo requests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
