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

    // First check if code exists at all (for debugging)
    const codeExists = await db.get('SELECT * FROM discount_codes WHERE code = ?', [code.toUpperCase()]);
    console.log('🔍 Code exists check:', codeExists);

    // First try to find exact code match - ensure is_active is truly 1
    let discountData = await db.get('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1 AND is_active != 0', [code.toUpperCase()]);
    console.log('🔍 Exact match result:', discountData);

    // Additional validation - check if code is deactivated
    if (!discountData && codeExists) {
      console.log('❌ Code exists but is deactivated:', {
        code: codeExists.code,
        is_active: codeExists.is_active,
        is_active_type: typeof codeExists.is_active
      });
    }

    // If no exact match, check for prefix codes
    if (!discountData) {
      console.log('🔍 No exact match found, checking for prefix codes...');

      // Check if the entered code starts with any existing prefix - ensure is_active is truly 1
      const allPrefixCodes = await db.all(`
        SELECT * FROM discount_codes
        WHERE code_type = 'prefix' AND is_active = 1 AND is_active != 0 AND used_count < usage_limit
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

        const directPrefixMatch = await db.get('SELECT * FROM discount_codes WHERE code = ? AND is_active = 1 AND is_active != 0', [prefix]);
        if (directPrefixMatch) {
          discountData = directPrefixMatch;
          console.log('✅ Found direct prefix match:', discountData);
        }
      }
    }

    if (!discountData) {
      console.log('❌ No discount code found for:', code.toUpperCase());

      // Check if it's a deactivated code
      if (codeExists && (codeExists.is_active === 0 || codeExists.is_active === false)) {
        return NextResponse.json(
          {
            valid: false,
            error: 'This discount code has been deactivated'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or expired discount code'
        },
        { status: 400 }
      );
    }

    // Triple-check if the discount code is active (multiple validation layers)
    if (!discountData.is_active || discountData.is_active === 0 || discountData.is_active === false || discountData.is_active === "0") {
      console.log('❌ Discount code is deactivated:', code.toUpperCase(), 'is_active value:', discountData.is_active);
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

    // Calculate discount amount - prioritize fixed amount over percentage
    let discountAmount = 0;
    let discountPercent = 0;
    
    // Check if there's a fixed amount discount first (higher priority)
    if (discountData.discount_amount && parseFloat(discountData.discount_amount) > 0) {
      // Fixed amount discount takes priority
      discountAmount = parseFloat(discountData.discount_amount);
      discountPercent = 0;
      console.log('💰 Using fixed amount discount:', discountAmount);
    } else if (discountData.discount_percent && parseFloat(discountData.discount_percent) > 0) {
      // Percentage discount as fallback
      discountPercent = parseFloat(discountData.discount_percent);
      discountAmount = (parseFloat(amount) * discountPercent) / 100;
      console.log('📊 Using percentage discount:', discountPercent + '%');
    }
    
    const finalAmount = Math.max(0, parseFloat(amount) - discountAmount);

    console.log('✅ Discount validation successful:', {
      code: code.toUpperCase(),
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      final_amount: finalAmount
    });

    return NextResponse.json({
      valid: true,
      discount_percent: discountPercent,
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      final_amount: parseFloat(finalAmount.toFixed(2)),
      original_amount: parseFloat(parseFloat(amount).toFixed(2)),
      code: code.toUpperCase(),
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
