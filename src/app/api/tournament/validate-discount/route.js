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

    console.log('🔍 Validating discount code:', code.toUpperCase());

    // First try to find exact code match
    let discountData = await db.get('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1', [code.toUpperCase()]);
    console.log('🔍 Exact match result:', discountData);

    // If no exact match, check for prefix codes
    if (!discountData) {
      console.log('🔍 No exact match found, checking for prefix codes...');

      // Check if the entered code starts with any existing prefix
      const allPrefixCodes = await db.all(`
        SELECT * FROM discount_codes
        WHERE code_type = 'prefix' AND is_active = 1 AND used_count < usage_limit
      `);

      console.log('🔍 Available prefix codes:', allPrefixCodes);

      for (const prefixCode of allPrefixCodes) {
        const prefix = prefixCode.code || prefixCode.prefix;
        if (prefix && code.toUpperCase().startsWith(prefix.toUpperCase())) {
          discountData = prefixCode;
          console.log('✅ Found matching prefix code:', { prefix, code: code.toUpperCase(), discountData });
          break;
        }
      }

      // If still no match and code contains underscore, try direct prefix match
      if (!discountData && code.includes('_')) {
        const prefix = code.split('_')[0] + '_';
        console.log('🔍 Trying direct prefix match for:', prefix);

        const directPrefixMatch = await db.get('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1', [prefix]);
        if (directPrefixMatch) {
          discountData = directPrefixMatch;
          console.log('✅ Found direct prefix match:', discountData);
        }
      }
    }

    if (!discountData) {
      console.log('❌ No discount code found for:', code.toUpperCase());
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or expired discount code'
        },
        { status: 400 }
      );
    }

    // Double-check if the discount code is active
    if (!discountData.is_active || discountData.is_active === 0) {
      console.log('❌ Discount code is deactivated:', code.toUpperCase());
      return NextResponse.json(
        {
          valid: false,
          error: 'This discount code has been deactivated'
        },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discountData.used_count >= discountData.usage_limit) {
      console.log('❌ Usage limit exceeded for code:', code.toUpperCase());
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

    console.log('✅ Discount validation successful:', {
      code: code.toUpperCase(),
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      final_amount: finalAmount
    });

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
