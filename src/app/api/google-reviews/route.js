import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId') || 'ChIJ-_jBcPtrrjsRvd658JobDpM'; // ThinQ Chess JP Nagar
    
    // Get Google API key from admin settings
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    // Use direct API key for now
    let googleApiKey = 'AIzaSyDznXxcO6o_OdXyHYJnu5K9myYAV2aGBoY';
    let reviewsEnabled = true;
    
    console.log('🔑 Using direct API key for Google Reviews');
    
    // Check if reviews are disabled
    if (!reviewsEnabled) {
      return NextResponse.json({
        success: false,
        source: 'disabled',
        reviews: [],
        rating: 0,
        total_reviews: 0,
        error: 'Google Reviews are disabled in admin settings'
      });
    }
    
    console.log('🔑 Google API key status:', googleApiKey ? 'Found (' + googleApiKey.length + ' chars)' : 'Not found');

    console.log('🔑 API Key ready, length:', googleApiKey.length);

    // Fetch reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${googleApiKey}`;
    
    console.log('🔍 Fetching Google Reviews for place:', placeId);
    console.log('🔍 API URL:', url.replace(googleApiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📊 Google API Response:', {
      status: data.status,
      error_message: data.error_message,
      has_result: !!data.result,
      reviews_count: data.result?.reviews?.length || 0
    });

    if (data.status === 'OK' && data.result) {
      const place = data.result;
      
      // Format reviews for our component
      const formattedReviews = (place.reviews || []).map((review, index) => ({
        id: index + 1,
        author_name: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.relative_time_description,
        profile_photo_url: review.profile_photo_url || null
      }));

      return NextResponse.json({
        success: true,
        source: 'google',
        reviews: formattedReviews,
        rating: place.rating || 0,
        total_reviews: place.user_ratings_total || 0,
        place_name: place.name
      });
    } else {
      console.error('❌ Google Places API error:', {
        status: data.status,
        error_message: data.error_message,
        place_id: placeId
      });
      
      // Return empty reviews on API error
      return NextResponse.json({
        success: false,
        source: 'api_error',
        reviews: [],
        rating: 0,
        total_reviews: 0,
        error: `Google API Error: ${data.status} - ${data.error_message || 'Unknown error'}`
      });
    }

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    
    // Return empty reviews on error
    return NextResponse.json({
      success: false,
      source: 'fetch_error',
      reviews: [],
      rating: 0,
      total_reviews: 0,
      error: 'Failed to fetch reviews'
    });
  }
}

function getSampleReviews() {
  return [
    {
      id: 1,
      author_name: "Priya Sharma",
      rating: 5,
      text: "Excellent chess coaching! My child has improved tremendously under their guidance. The coaches are very patient and knowledgeable.",
      time: "2 weeks ago"
    },
    {
      id: 2,
      author_name: "Rajesh Kumar",
      rating: 5,
      text: "Great academy with structured learning approach. My daughter loves the online classes and has won several tournaments.",
      time: "1 month ago"
    },
    {
      id: 3,
      author_name: "Anita Reddy",
      rating: 4,
      text: "Professional coaching with good results. The tournament preparation is excellent. Highly recommended for serious chess learners.",
      time: "3 weeks ago"
    }
  ];
}
