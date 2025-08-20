import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Save demo request to SimpleDB
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    console.log('📝 Demo Request Data Received:', body);

    // Validate required fields
    const requiredFields = ['parent_name', 'email', 'phone', 'child_name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert demo request into SimpleDB
    const result = await db.run(`
      INSERT INTO demo_requests (
        parent_name, email, phone, child_name, age, chess_experience,
        state, country, message, status, demo_completed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.parent_name,
      body.email,
      body.phone,
      body.child_name,
      parseInt(body.age) || null,
      body.chess_experience || body.past_training || null,
      body.state || null,
      body.country || null,
      body.message || null,
      'pending', // Default status
      0, // Default demo_completed = 0 (false)
      new Date().toISOString()
    ]);

    // Get the created demo request
    const savedRequest = await db.get('SELECT * FROM demo_requests WHERE id = ?', [result.lastInsertRowid]);

    console.log('✅ Demo Request Saved:', savedRequest);

    return NextResponse.json({
      success: true,
      message: 'Demo request submitted successfully',
      request: savedRequest
    });

  } catch (error) {
    console.error('Error saving demo request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save demo request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Fetch all demo requests (for admin)
export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const dateFilter = searchParams.get('date_filter') || 'all';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;

    // Build query based on filters
    let query = 'SELECT * FROM demo_requests';
    let countQuery = 'SELECT COUNT(*) as total FROM demo_requests';
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

    // Date filtering
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
            endDate.setDate(endDate.getDate() + 1); // Include the end date
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
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute queries
    const requests = await db.all(query, params);
    const totalResult = await db.all(countQuery, params.slice(0, -2)); // Remove limit and offset for count
    const total = totalResult[0].total;

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching demo requests:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch demo requests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update demo request status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, demo_completed, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Demo request ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if demo request exists
    const existing = await db.get('SELECT * FROM demo_requests WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Demo request not found' },
        { status: 404 }
      );
    }

    console.log('🔄 Updating demo request:', {
      id,
      currentStatus: existing.status,
      currentDemoCompleted: existing.demo_completed,
      newStatus: status,
      newDemoCompleted: demo_completed
    });

    // Prepare update values
    const updateValues = {
      status: status || existing.status,
      demo_completed: demo_completed !== undefined ? demo_completed : existing.demo_completed,
      updated_at: new Date().toISOString()
    };

    console.log('🔧 Update values:', updateValues);

    // Update demo request
    const result = await db.run(`
      UPDATE demo_requests
      SET status = ?, demo_completed = ?, updated_at = ?
      WHERE id = ?
    `, [
      updateValues.status,
      updateValues.demo_completed,
      updateValues.updated_at,
      id
    ]);

    console.log('✅ Demo request update result:', result);

    if (result.changes === 0) {
      console.log('❌ No changes made to demo request');
      return NextResponse.json(
        { error: 'Failed to update demo request - no changes made' },
        { status: 500 }
      );
    }

    // Get updated demo request
    const updated = await db.get('SELECT * FROM demo_requests WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Demo request updated successfully',
      request: updated
    });

  } catch (error) {
    console.error('Error updating demo request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update demo request',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete demo request
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Demo request ID is required' },
        { status: 400 }
      );
    }

    // Use the same SimpleDatabase as other handlers in this module for consistency
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if demo request exists
    const existing = await db.get('SELECT * FROM demo_requests WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Demo request not found' },
        { status: 404 }
      );
    }

    // Delete the demo request
    const result = await db.run('DELETE FROM demo_requests WHERE id = ?', [id]);

    if (!result || result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete demo request' },
        { status: 500 }
      );
    }

    console.log(`✅ Demo request deleted successfully: ID ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Demo request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting demo request:', error);
    return NextResponse.json(
      { error: 'Failed to delete demo request' },
      { status: 500 }
    );
  }
}
