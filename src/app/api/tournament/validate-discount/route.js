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

    // Development mode - simulate discount codes
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const mockDiscounts = {
        'TC10': 10,
        'TC20': 20,
        'TCON15': 15,
        'STUDENT25': 25,
        'EARLY20': 20
      };

      const discountPercent = mockDiscounts[code.toUpperCase()];

      if (!discountPercent) {
        return NextResponse.json(
          {
            valid: false,
            error: 'Invalid or expired discount code'
          },
          { status: 400 }
        );
      }

      const discountAmount = (parseFloat(amount) * discountPercent) / 100;
      const finalAmount = parseFloat(amount) - discountAmount;

      return NextResponse.json({
        valid: true,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        original_amount: parseFloat(amount),
        code: code.toUpperCase()
      });
    }

    // Production mode with database
    const { validateDiscountCode } = await import('../../../../../lib/db.js');
    const discountData = await validateDiscountCode(code.toUpperCase());

    if (!discountData) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid or expired discount code'
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
