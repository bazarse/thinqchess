"use client";
import React, { useState, useEffect } from "react";

const GoogleReviews = ({ location = "JP Nagar", placeId = "ChIJ-_jBcPtrrjsRvd658JobDpM" }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [source, setSource] = useState('loading');

  useEffect(() => {
    fetchGoogleReviews();
  }, [location, placeId]);

  const fetchGoogleReviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching reviews for:', location);

      const response = await fetch(`/api/google-reviews?placeId=${placeId}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setRating(data.rating || 0);
        setTotalReviews(data.total_reviews || 0);
        setSource(data.source || 'unknown');

        console.log('✅ Reviews loaded:', {
          source: data.source,
          count: data.reviews?.length || 0,
          rating: data.rating
        });
      } else {
        console.error('❌ Failed to fetch reviews:', data.error);
        setReviews([]);
        setRating(0);
        setTotalReviews(0);
        setSource('error');
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      setReviews([]);
      setRating(0);
      setTotalReviews(0);
      setSource('error');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2B3AA0]">
            Google Reviews
          </h3>
          {source && (
            <div className="flex items-center mt-1">
              {source === 'google' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ✅ Live from Google
                </span>
              )}
              {(source === 'no_api_key' || source === 'error' || source === 'api_error') && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  ⚠️ Setup Required
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-[#2B3AA0] mr-2">
            {rating > 0 ? rating.toFixed(1) : (reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0')}
          </span>
          <div className="flex">
            {renderStars(Math.round(rating > 0 ? rating : (reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0)))}
          </div>
          <span className="text-gray-600 ml-2">
            ({totalReviews > 0 ? totalReviews : reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-[#2B3AA0] rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {review.author_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{review.author_name}</h4>
                    <span className="text-sm text-gray-500">{review.time}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No reviews available</p>
            <p className="text-sm text-gray-500">Configure Google Places API in admin settings to show reviews</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <a
          href="https://g.page/r/Cb3eufCaGw6TEAI/review"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-[#2B3AA0] text-white rounded-lg hover:bg-[#1e2a70] transition-colors"
        >
          <span className="mr-2">📝</span>
          Write a Review
        </a>
      </div>
    </div>
  );
};

export default GoogleReviews;
