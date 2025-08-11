// Add TC1_ discount code via API
async function addTC1DiscountViaAPI() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('🚀 Adding TC1_ discount code via API...');
    
    const response = await fetch(`${baseUrl}/api/admin/discount-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'TC1_',
        discount_percent: 10,
        usage_limit: 100,
        is_active: true,
        code_type: 'prefix',
        prefix: 'TC1_'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ TC1_ discount code added successfully!');
      console.log('📋 Code details:', data.discountCode);
      
      // Test the validation immediately
      console.log('\n🧪 Testing validation...');
      await testValidation();
      
    } else {
      console.log('❌ Failed to add TC1_ discount code:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testValidation() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/tournament/validate-discount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'TC1_',
        amount: 500,
        email: 'test@example.com'
      }),
    });

    const data = await response.json();
    
    if (data.valid) {
      console.log('✅ Validation successful!');
      console.log(`   Discount: ${data.discount_percent}%`);
      console.log(`   Original: ₹${data.original_amount}`);
      console.log(`   Final: ₹${data.final_amount}`);
    } else {
      console.log('❌ Validation failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Validation test error:', error.message);
  }
}

// Run the script
addTC1DiscountViaAPI();
