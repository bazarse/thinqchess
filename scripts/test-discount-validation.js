// Test script for discount code validation
async function testDiscountValidation() {
  const baseUrl = 'http://localhost:3000';
  
  const testCases = [
    {
      name: 'TC1_ exact match',
      code: 'TC1_',
      amount: 500,
      expected: true
    },
    {
      name: 'TC1_STUDENT prefix match',
      code: 'TC1_STUDENT',
      amount: 500,
      expected: true
    },
    {
      name: 'TC1_TEACHER prefix match',
      code: 'TC1_TEACHER',
      amount: 500,
      expected: true
    },
    {
      name: 'Invalid code',
      code: 'INVALID123',
      amount: 500,
      expected: false
    }
  ];

  console.log('🧪 Testing discount code validation...\n');

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Code: ${testCase.code}, Amount: ${testCase.amount}`);
      
      const response = await fetch(`${baseUrl}/api/tournament/validate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testCase.code,
          amount: testCase.amount,
          email: 'test@example.com'
        }),
      });

      const data = await response.json();
      
      if (testCase.expected && data.valid) {
        console.log(`✅ PASS: Valid discount applied`);
        console.log(`   Discount: ${data.discount_percent}%`);
        console.log(`   Original: ₹${data.original_amount}`);
        console.log(`   Final: ₹${data.final_amount}`);
      } else if (!testCase.expected && !data.valid) {
        console.log(`✅ PASS: Invalid code correctly rejected`);
        console.log(`   Error: ${data.error}`);
      } else {
        console.log(`❌ FAIL: Unexpected result`);
        console.log(`   Expected valid: ${testCase.expected}`);
        console.log(`   Actual valid: ${data.valid}`);
        console.log(`   Response:`, data);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

// Run the test
testDiscountValidation();
