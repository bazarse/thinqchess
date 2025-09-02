import { NextResponse } from 'next/server';

// GET - Fetch all discount codes
export async function GET() {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    const discountCodes = await db.all('SELECT * FROM discount_codes ORDER BY created_at DESC');
    
    return NextResponse.json({
      success: true,
      discountCodes
    });

  } catch (error) {
    console.error('Error fetching discount codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discount codes' },
      { status: 500 }
    );
  }
}

// POST - Create new discount code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discount_percent, discount_amount, discount_type, usage_limit, is_active, code_type, prefix, email_domain, email_prefix, match_type } = body;

    // Validate required fields
    if (!code || (!discount_percent && !discount_amount)) {
      return NextResponse.json(
        { error: 'Code and discount value are required' },
        { status: 400 }
      );
    }

    if (discount_type === 'percentage' && (discount_percent < 0 || discount_percent > 100)) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (discount_type === 'amount' && discount_amount < 0) {
      return NextResponse.json(
        { error: 'Discount amount must be positive' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if code already exists
    const existingCode = await db.get('SELECT id FROM discount_codes WHERE code = ?', [code.toUpperCase()]);
    if (existingCode) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Insert new discount code
    const result = await db.run(`
      INSERT INTO discount_codes (
        code, discount_percent, discount_amount, discount_type, usage_limit, is_active, code_type, prefix, email_domain, email_prefix, match_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code.toUpperCase(),
      discount_type === 'percentage' ? parseFloat(discount_percent) : 0,
      discount_type === 'amount' ? parseFloat(discount_amount) : 0,
      discount_type || 'percentage',
      parseInt(usage_limit) || 100,
      is_active ? 1 : 0,
      code_type || 'manual',
      prefix || null,
      email_domain || null,
      email_prefix || null,
      match_type || 'domain'
    ]);

    // Get the created discount code
    const newDiscountCode = await db.get('SELECT * FROM discount_codes WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json({
      success: true,
      message: 'Discount code created successfully',
      discountCode: newDiscountCode
    });

  } catch (error) {
    console.error('Error creating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to create discount code' },
      { status: 500 }
    );
  }
}

// PUT - Update discount code
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, code, discount_percent, usage_limit, is_active, code_type, prefix, email_domain, email_prefix, match_type } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if discount code exists
    const existing = await db.get('SELECT * FROM discount_codes WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Check if code already exists for a different discount code
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await db.get('SELECT id FROM discount_codes WHERE code = ? AND id != ?', [code.toUpperCase(), id]);
      if (codeExists) {
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Update discount code
    await db.run(`
      UPDATE discount_codes 
      SET code = ?, discount_percent = ?, discount_amount = ?, discount_type = ?, usage_limit = ?, is_active = ?, 
          code_type = ?, prefix = ?, email_domain = ?
      WHERE id = ?
    `, [
      code ? code.toUpperCase() : existing.code,
      discount_percent !== undefined ? parseFloat(discount_percent) : existing.discount_percent,
      discount_amount !== undefined ? parseFloat(discount_amount) : existing.discount_amount,
      discount_type || existing.discount_type || 'percentage',
      usage_limit !== undefined ? parseInt(usage_limit) : existing.usage_limit,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      code_type || existing.code_type,
      prefix !== undefined ? prefix : existing.prefix,
      email_domain !== undefined ? email_domain : existing.email_domain,
      id
    ]);

    // Get updated discount code
    const updatedDiscountCode = await db.get('SELECT * FROM discount_codes WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Discount code updated successfully',
      discountCode: updatedDiscountCode
    });

  } catch (error) {
    console.error('Error updating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to update discount code' },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount code
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Discount code ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if discount code exists
    const existing = await db.get('SELECT * FROM discount_codes WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Delete discount code
    await db.run('DELETE FROM discount_codes WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Discount code deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting discount code:', error);
    return NextResponse.json(
      { error: 'Failed to delete discount code' },
      { status: 500 }
    );
  }
}
