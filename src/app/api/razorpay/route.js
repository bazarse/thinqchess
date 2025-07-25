import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Development mode - simulate order creation
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const mockOrder = {
        id: `order_${Date.now()}`,
        entity: 'order',
        amount: amount * 100, // Razorpay expects amount in paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: {
          purpose: 'Tournament Registration',
          academy: 'ThinQ Chess Academy'
        }
      };

      console.log('🎯 Mock Razorpay Order Created:', mockOrder);

      return NextResponse.json({
        success: true,
        order: mockOrder,
        key: 'rzp_test_demo_key', // Demo key for development
        message: 'Order created successfully (development mode)'
      });
    }

    // Production mode - real Razorpay integration
    try {
      const Razorpay = (await import('razorpay')).default;

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          purpose: 'Tournament Registration',
          academy: 'ThinQ Chess Academy'
        }
      };

      const order = await razorpay.orders.create(options);

      return NextResponse.json({
        success: true,
        order: order,
        key: process.env.RAZORPAY_KEY_ID,
        message: 'Order created successfully'
      });

    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify payment
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData
    } = body;

    // Development mode - simulate verification
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('🎯 Mock Payment Verification:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature
      });

      // Simulate saving registration data
      const registrationData = {
        id: Date.now(),
        ...formData,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        payment_status: 'completed',
        registered_at: new Date().toISOString(),
        type: 'tournament'
      };

      console.log('🎯 Tournament Registration Saved:', registrationData);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and registration completed (development mode)',
        registration: registrationData
      });
    }

    // Production mode - real verification
    try {
      const crypto = await import('crypto');

      const body_string = razorpay_order_id + "|" + razorpay_payment_id;
      const expected_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body_string.toString())
        .digest('hex');

      if (expected_signature === razorpay_signature) {
        // Save registration data to database
        const { saveTournamentRegistration } = await import('../../../lib/db.js');

        const registrationData = {
          ...formData,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          payment_status: 'completed',
          type: 'tournament'
        };

        const savedRegistration = await saveTournamentRegistration(registrationData);

        return NextResponse.json({
          success: true,
          message: 'Payment verified and registration completed',
          registration: savedRegistration
        });
      } else {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
    } catch (verificationError) {
      console.error('Payment verification error:', verificationError);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
