"use client";
import React, { useState, useEffect } from "react";

const GoogleReviews = ({ location = "JP Nagar" }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock reviews data (in production, this would come from Google Places API)
  const mockReviews = {
    "JP Nagar": [
      {
        id: 1,
        author_name: "Priya Sharma",
        rating: 5,
        text: "Excellent chess coaching! My son has improved tremendously under Krishna sir's guidance. Highly recommended for serious chess learning.",
        time: "2 weeks ago",
        profile_photo_url: "/images/reviews/user1.jpg"
      },
      {
        id: 2,
        author_name: "Rajesh Kumar",
        rating: 5,
        text: "Best chess academy in Bangalore! Professional coaching with personalized attention. My daughter loves the classes.",
        time: "1 month ago",
        profile_photo_url: "/images/reviews/user2.jpg"
      },
      {
        id: 3,
        author_name: "Anita Reddy",
        rating: 5,
        text: "Amazing experience! The coaches are very knowledgeable and patient. Great environment for learning chess.",
        time: "3 weeks ago",
        profile_photo_url: "/images/reviews/user3.jpg"
      }
    ],
    "Akshayanagar": [
      {
        id: 4,
        author_name: "Suresh Babu",
        rating: 5,
        text: "Outstanding chess coaching center! My son has won several tournaments after joining ThinQ Chess. Thank you!",
        time: "1 week ago",
        profile_photo_url: "/images/reviews/user4.jpg"
      },
      {
        id: 5,
        author_name: "Meera Nair",
        rating: 5,
        text: "Highly professional and dedicated coaches. The systematic approach to teaching chess is commendable.",
        time: "2 months ago",
        profile_photo_url: "/images/reviews/user5.jpg"
      },
      {
        id: 6,
        author_name: "Vikram Singh",
        rating: 4,
        text: "Good chess academy with experienced coaches. Regular tournaments help students gain practical experience.",
        time: "1 month ago",
        profile_photo_url: "/images/reviews/user6.jpg"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews[location] || []);
      setLoading(false);
    }, 1000);
  }, [location]);

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
        <h3 className="text-xl font-bold text-[#2B3AA0]">
          Reviews
        </h3>
        <div className="flex items-center">
          <span className="text-2xl font-bold text-[#2B3AA0] mr-2">
            {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
          </span>
          <div className="flex">
            {renderStars(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length))}
          </div>
          <span className="text-gray-600 ml-2">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
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
        ))}
      </div>

      <div className="mt-6 text-center">
        <a
          href={`https://www.google.com/search?q=ThinQ+Chess+Academy+${location}`}
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
