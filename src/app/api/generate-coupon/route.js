import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Mock discount codes for development mode
    const mockDiscountCodes = [
      {
        id: 1,
        code: 'STUDENT*',
        discount_percent: 15,
        usage_limit: 100,
        used_count: 25,
        is_active: true,
        code_type: 'prefix',
        prefix: 'STUDENT',
        email_domain: 'gmail.com'
      },
      {
        id: 2,
        code: 'TEACHER*',
        discount_percent: 20,
        usage_limit: 50,
        used_count: 8,
        is_active: true,
        code_type: 'prefix',
        prefix: 'TEACHER',
        email_domain: 'edu.in'
      },
      {
        id: 3,
        code: 'PARENT*',
        discount_percent: 10,
        usage_limit: 200,
        used_count: 45,
        is_active: true,
        code_type: 'prefix',
        prefix: 'PARENT',
        email_domain: 'yahoo.com'
      }
    ];

    // Extract email domain
    const emailDomain = email.split('@')[1].toLowerCase();
    
    // Find matching prefix code
    const matchingPrefixCode = mockDiscountCodes.find(code => 
      code.code_type === 'prefix' && 
      code.email_domain === emailDomain && 
      code.is_active &&
      code.used_count < code.usage_limit
    );

    if (!matchingPrefixCode) {
      return NextResponse.json({
        success: false,
        message: 'No coupon available for this email domain'
      });
    }

    // Generate unique coupon code
    const timestamp = Date.now().toString().slice(-6);
    const emailPrefix = email.split('@')[0].slice(0, 3).toUpperCase();
    const generatedCode = `${matchingPrefixCode.prefix}${emailPrefix}${timestamp}`;

    // In production, you would:
    // 1. Save the generated code to database
    // 2. Update usage count
    // 3. Send email with the coupon code

    return NextResponse.json({
      success: true,
      coupon_code: generatedCode,
      discount_percent: matchingPrefixCode.discount_percent,
      message: `Congratulations! You've received a ${matchingPrefixCode.discount_percent}% discount coupon.`,
      prefix_type: matchingPrefixCode.prefix
    });

  } catch (error) {
    console.error('Error generating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to generate coupon' },
      { status: 500 }
    );
  }
}

// GET endpoint to check available coupons for email domain
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Mock discount codes for development mode
    const mockDiscountCodes = [
      {
        id: 1,
        prefix: 'STUDENT',
        discount_percent: 15,
        email_domain: 'gmail.com',
        is_active: true
      },
      {
        id: 2,
        prefix: 'TEACHER',
        discount_percent: 20,
        email_domain: 'edu.in',
        is_active: true
      },
      {
        id: 3,
        prefix: 'PARENT',
        discount_percent: 10,
        email_domain: 'yahoo.com',
        is_active: true
      }
    ];

    const emailDomain = email.split('@')[1].toLowerCase();
    const availableCoupon = mockDiscountCodes.find(code => 
      code.email_domain === emailDomain && code.is_active
    );

    return NextResponse.json({
      available: !!availableCoupon,
      coupon_info: availableCoupon || null
    });

  } catch (error) {
    console.error('Error checking coupon availability:', error);
    return NextResponse.json(
      { error: 'Failed to check coupon availability' },
      { status: 500 }
    );
  }
}
