import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Missing discount code or amount' },
        { status: 400 }
      );
    }

    // Validate discount code using SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const discountData = db.prepare('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1').get(code.toUpperCase());

    if (!discountData) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or expired discount code'
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discountData.used_count >= discountData.usage_limit) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Discount code usage limit exceeded'
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    const discountPercent = discountData.discount_percent;
    const discountAmount = (parseFloat(amount) * discountPercent) / 100;
    const finalAmount = parseFloat(amount) - discountAmount;

    return NextResponse.json({
      valid: true,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      original_amount: parseFloat(amount),
      code: discountData.code
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
