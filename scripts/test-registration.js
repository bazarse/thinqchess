// Test tournament registration API
async function testRegistration() {
  console.log('🧪 Testing tournament registration...');
  
  const testData = {
    participantFirstName: "Test",
    participantLastName: "Player", 
    email: "test@example.com",
    phone: "+919876543210",
    dob: "2010-05-15",
    gender: "Male",
    tournament_type: "under12",
    country: "India",
    state: "Karnataka", 
    city: "Bangalore",
    location: "Test Address",
    tournament_id: 1,
    amount_paid: 400,
    discount_code: "DEMO10",
    discount_amount: 40,
    payment_id: "test_payment_123",
    payment_status: "completed"
  };

  try {
    const response = await fetch('http://localhost:3000/api/tournament/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('Registration ID:', result.registration.id);
      console.log('Participant:', result.registration.participant_name);
    } else {
      console.log('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Test active tournament API
async function testActiveTournament() {
  console.log('🧪 Testing active tournament API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/tournament/active');
    const result = await response.json();
    
    if (result.success && result.hasActiveTournament) {
      console.log('✅ Active tournament found!');
      console.log('Tournament:', result.tournament.name);
      console.log('Categories:', result.tournament.categories?.length || 0);
      console.log('Registration Status:', result.registrationStatus);
    } else {
      console.log('❌ No active tournament:', result.message);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Test discount validation
async function testDiscount() {
  console.log('🧪 Testing discount validation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/tournament/validate-discount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: 'DEMO10',
        amount: 400
      })
    });

    const result = await response.json();
    
    if (result.valid) {
      console.log('✅ Discount valid!');
      console.log('Original:', result.original_amount);
      console.log('Discount:', result.discount_amount);
      console.log('Final:', result.final_amount);
    } else {
      console.log('❌ Discount invalid:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  await testActiveTournament();
  console.log('---');
  await testDiscount();
  console.log('---');
  await testRegistration();
}

runTests().catch(console.error);