import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const emailParts = email.split('@');
    const emailUsername = emailParts[0].toLowerCase();
    const emailDomain = emailParts[1];

    console.log('🔍 Checking email for discount:', email);
    console.log('📧 Email parts:', { username: emailUsername, domain: emailDomain });

    // Find matching prefix codes
    const prefixCodes = db.prepare(`
      SELECT * FROM discount_codes 
      WHERE code_type = 'prefix' AND is_active = 1 AND used_count < usage_limit
    `).all();

    console.log('📋 Available prefix codes:', prefixCodes.length);

    for (const prefixCode of prefixCodes) {
      let isMatch = false;
      let matchReason = '';

      if (prefixCode.match_type === 'domain' && prefixCode.email_domain) {
        // Domain-based matching
        isMatch = prefixCode.email_domain === emailDomain;
        matchReason = `Domain match: ${prefixCode.email_domain} === ${emailDomain}`;
      } else if (prefixCode.match_type === 'email_prefix' && prefixCode.email_prefix) {
        // Email prefix/name-based matching
        const searchPrefix = prefixCode.email_prefix.toLowerCase();
        isMatch = emailUsername.includes(searchPrefix);
        matchReason = `Email contains: "${searchPrefix}" in "${emailUsername}"`;
      }

      console.log(`🎯 Checking prefix code ${prefixCode.prefix}:`, {
        match_type: prefixCode.match_type,
        email_domain: prefixCode.email_domain,
        email_prefix: prefixCode.email_prefix,
        isMatch,
        matchReason
      });

      if (isMatch) {
        // Generate unique coupon code
        const timestamp = Date.now().toString().slice(-6);
        const emailPrefix = emailUsername.slice(0, 3).toUpperCase();
        const generatedCode = `${prefixCode.prefix}${emailPrefix}${timestamp}`;

        console.log('✅ Match found! Generated code:', generatedCode);

        // Check if this specific generated code already exists
        const existingCode = db.prepare('SELECT id FROM discount_codes WHERE code = ?').get(generatedCode);
        
        if (!existingCode) {
          // Create the generated code in database
          const insertStmt = db.prepare(`
            INSERT INTO discount_codes (
              code, discount_percent, usage_limit, is_active, code_type, 
              prefix, email_domain, email_prefix, match_type, used_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insertStmt.run(
            generatedCode,
            prefixCode.discount_percent,
            1, // Single use for generated codes
            1, // Active
            'generated',
            prefixCode.prefix,
            prefixCode.email_domain,
            prefixCode.email_prefix,
            prefixCode.match_type,
            0
          );

          console.log('💾 Generated code saved to database');
        }

        return NextResponse.json({
          success: true,
          discount: {
            code: generatedCode,
            discount_percent: prefixCode.discount_percent,
            type: 'auto_generated',
            match_type: prefixCode.match_type,
            matched_value: prefixCode.match_type === 'domain' ? prefixCode.email_domain : prefixCode.email_prefix,
            message: `🎉 Congratulations! You got ${prefixCode.discount_percent}% discount!`
          }
        });
      }
    }

    console.log('❌ No matching discount found for email:', email);

    // No matching discount found
    return NextResponse.json({
      success: true,
      discount: null,
      message: 'No discount available for this email'
    });

  } catch (error) {
    console.error('❌ Error checking email discount:', error);
    return NextResponse.json(
      { error: 'Failed to check email discount' },
      { status: 500 }
    );
  }
}

// GET endpoint to check available discounts for an email
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const emailParts = email.split('@');
    const emailUsername = emailParts[0].toLowerCase();
    const emailDomain = emailParts[1];

    // Find matching prefix codes
    const availableDiscounts = [];
    const prefixCodes = db.prepare(`
      SELECT * FROM discount_codes 
      WHERE code_type = 'prefix' AND is_active = 1 AND used_count < usage_limit
    `).all();

    for (const prefixCode of prefixCodes) {
      let isMatch = false;
      let matchInfo = '';

      if (prefixCode.match_type === 'domain' && prefixCode.email_domain) {
        isMatch = prefixCode.email_domain === emailDomain;
        matchInfo = `Domain: ${prefixCode.email_domain}`;
      } else if (prefixCode.match_type === 'email_prefix' && prefixCode.email_prefix) {
        isMatch = emailUsername.includes(prefixCode.email_prefix.toLowerCase());
        matchInfo = `Email contains: ${prefixCode.email_prefix}`;
      }

      if (isMatch) {
        availableDiscounts.push({
          prefix: prefixCode.prefix,
          discount_percent: prefixCode.discount_percent,
          match_type: prefixCode.match_type,
          match_info: matchInfo
        });
      }
    }

    return NextResponse.json({
      success: true,
      email: email,
      available_discounts: availableDiscounts
    });

  } catch (error) {
    console.error('Error checking available discounts:', error);
    return NextResponse.json(
      { error: 'Failed to check available discounts' },
      { status: 500 }
    );
  }
}
