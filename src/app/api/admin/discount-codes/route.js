import { NextResponse } from 'next/server';

// GET - Fetch all discount codes
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    const discountCodes = db.prepare('SELECT * FROM discount_codes ORDER BY created_at DESC').all();
    
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
    const { code, discount_percent, usage_limit, is_active, code_type, prefix, email_domain, email_prefix, match_type } = body;

    // Validate required fields
    if (!code || !discount_percent) {
      return NextResponse.json(
        { error: 'Code and discount percentage are required' },
        { status: 400 }
      );
    }

    if (discount_percent < 0 || discount_percent > 100) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if code already exists
    const existingCode = db.prepare('SELECT id FROM discount_codes WHERE code = ?').get(code.toUpperCase());
    if (existingCode) {
      return NextResponse.json(
        { error: 'Discount code already exists' },
        { status: 400 }
      );
    }

    // Insert new discount code
    const insertStmt = db.prepare(`
      INSERT INTO discount_codes (
        code, discount_percent, usage_limit, is_active, code_type, prefix, email_domain, email_prefix, match_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      code.toUpperCase(),
      parseFloat(discount_percent),
      parseInt(usage_limit) || 100,
      is_active ? 1 : 0,
      code_type || 'manual',
      prefix || null,
      email_domain || null,
      email_prefix || null,
      match_type || 'domain'
    );

    // Get the created discount code
    const newDiscountCode = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(result.lastInsertRowid);

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

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if discount code exists
    const existing = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Check if code already exists for a different discount code
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = db.prepare('SELECT id FROM discount_codes WHERE code = ? AND id != ?').get(code.toUpperCase(), id);
      if (codeExists) {
        return NextResponse.json(
          { error: 'Discount code already exists' },
          { status: 400 }
        );
      }
    }

    // Update discount code
    const updateStmt = db.prepare(`
      UPDATE discount_codes 
      SET code = ?, discount_percent = ?, usage_limit = ?, is_active = ?, 
          code_type = ?, prefix = ?, email_domain = ?
      WHERE id = ?
    `);

    updateStmt.run(
      code ? code.toUpperCase() : existing.code,
      discount_percent !== undefined ? parseFloat(discount_percent) : existing.discount_percent,
      usage_limit !== undefined ? parseInt(usage_limit) : existing.usage_limit,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      code_type || existing.code_type,
      prefix !== undefined ? prefix : existing.prefix,
      email_domain !== undefined ? email_domain : existing.email_domain,
      id
    );

    // Get updated discount code
    const updatedDiscountCode = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(id);

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

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if discount code exists
    const existing = db.prepare('SELECT * FROM discount_codes WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Discount code not found' },
        { status: 404 }
      );
    }

    // Delete discount code
    db.prepare('DELETE FROM discount_codes WHERE id = ?').run(id);

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
