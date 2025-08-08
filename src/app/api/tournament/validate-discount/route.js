import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, amount, email } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Missing discount code or amount' },
        { status: 400 }
      );
    }

    // Use SimpleDB for Vercel compatibility
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // First try to find exact code match
    let discountData = await db.get('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1', [code.toUpperCase()]);

    // If no exact match and code contains underscore, check for prefix codes
    if (!discountData && code.includes('_')) {
      const prefix = code.split('_')[0] + '_';
      console.log('🔍 Checking prefix code:', prefix);

      const prefixCodes = await db.all(`
        SELECT * FROM discount_codes
        WHERE code_type = 'prefix' AND prefix = ? AND is_active = 1 AND used_count < usage_limit
      `, [prefix]);

      if (prefixCodes.length > 0) {
        // Use the first matching prefix code
        discountData = prefixCodes[0];
        console.log('✅ Found matching prefix code:', discountData);
      }
    }

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
      code: code.toUpperCase(), // Return the original code entered
      discount_id: discountData.id
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
