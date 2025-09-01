import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId') || 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM'; // Default place ID
    
    // Get Google API key from admin settings
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    let googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (settings && settings.google_settings) {
      try {
        const googleSettings = typeof settings.google_settings === 'string' 
          ? JSON.parse(settings.google_settings) 
          : settings.google_settings;
        
        if (googleSettings.places_api_key) {
          googleApiKey = googleSettings.places_api_key;
        }
      } catch (e) {
        console.error('Error parsing Google settings:', e);
      }
    }

    if (!googleApiKey) {
      console.log('🔄 No Google API key found, returning empty reviews');
      return NextResponse.json({
        success: true,
        source: 'no_api_key',
        reviews: [],
        rating: 0,
        total_reviews: 0,
        message: 'Google API key not configured'
      });
    }

    // Fetch reviews from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${googleApiKey}`;
    
    console.log('🔍 Fetching Google Reviews for place:', placeId);
    
    const response = await fetch(url);
    const data = await response.json();

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
      console.error('Google Places API error:', data.status, data.error_message);
      
      // Return empty reviews on API error
      return NextResponse.json({
        success: false,
        source: 'api_error',
        reviews: [],
        rating: 0,
        total_reviews: 0,
        error: data.error_message || 'Google API error'
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

function getMockReviews() {
  return [
    {
      id: 1,
      author_name: "Priya Sharma",
      rating: 5,
      text: "Excellent chess coaching! My son has improved tremendously under Krishna sir's guidance. Highly recommended for serious chess learning.",
      time: "2 weeks ago",
      profile_photo_url: null
    },
    {
      id: 2,
      author_name: "Rajesh Kumar",
      rating: 5,
      text: "Best chess academy in Bangalore! Professional coaching with personalized attention. My daughter loves the classes.",
      time: "1 month ago",
      profile_photo_url: null
    },
    {
      id: 3,
      author_name: "Anita Reddy",
      rating: 5,
      text: "Amazing experience! The coaches are very knowledgeable and patient. Great environment for learning chess.",
      time: "3 weeks ago",
      profile_photo_url: null
    },
    {
      id: 4,
      author_name: "Suresh Babu",
      rating: 5,
      text: "Outstanding chess coaching center! My son has won several tournaments after joining ThinQ Chess. Thank you!",
      time: "1 week ago",
      profile_photo_url: null
    },
    {
      id: 5,
      author_name: "Meera Nair",
      rating: 5,
      text: "Highly professional and dedicated coaches. The systematic approach to teaching chess is commendable.",
      time: "2 months ago",
      profile_photo_url: null
    }
  ];
}
