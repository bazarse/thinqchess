"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";


// Dynamic import for Banner
const Banner = dynamic(() => import("../../../components/ui/Banner"), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse"></div>
});

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // No static images - only show admin-managed gallery

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      // Fetch gallery images from admin-managed SQLite database
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const adminImages = await response.json();
        setImages(adminImages);
      } else {
        throw new Error('Failed to fetch gallery images');
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      // Show empty gallery if no images
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#2B3AA0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-12 h-12 border-4 border-[#FFB31A] border-t-transparent rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h3 className="text-lg font-semibold text-[#2B3AA0] mb-2">ThinQ Chess Academy</h3>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Banner
        heading={"Faces. Moments. Milestones"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />

      <section className="w-11/12 mx-auto md:my-28 my-14">
        <h4 className="md:text-2xl text-xl text-center font-bold text-[#2B3AA0] mb-8">
          From practice sessions to tournaments, from first wins to lifelong
          friendships - here's a look into the world of ThinQ Chess.
        </h4>

        {/* Gallery Images */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                onClick={() => openModal(item)}
              >
                <div className="aspect-video overflow-hidden relative">
                  <Image
                    src={item.image_url}
                    alt={item.image_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    quality={75}
                    onError={(e) => {
                      e.target.src = '/images/chess-placeholder.jpg';
                    }}
                  />
                  {/* Video Play Button Overlay */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                      <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Shorts Badge */}
                  {item.category === 'shorts' && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Shorts
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#2B3AA0] transition-colors">
                    {item.image_name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : 'Recent'}
                    </p>
                    {item.type === 'video' && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        {item.category === 'shorts' ? 'Short' : 'Video'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Our gallery is being updated with amazing moments from ThinQ Chess. Check back soon to see photos from our tournaments, training sessions, and events!
            </p>
          </div>
        )}


      </section>

      {/* Modal for Image/Video Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            >
              ✕
            </button>

            {selectedImage.type === 'video' && selectedImage.youtube_id ? (
              // YouTube Video/Short Embed
              <div className="relative bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedImage.youtube_id}?autoplay=1&rel=0`}
                  title={selectedImage.image_name}
                  className="w-full h-[60vh] md:h-[70vh]"
                  style={{ minWidth: '320px', minHeight: '240px' }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
                  <h3 className="text-xl font-bold">{selectedImage.image_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm bg-red-600 px-2 py-1 rounded-full">
                      {selectedImage.category === 'shorts' ? 'YouTube Short' : 'YouTube Video'}
                    </span>
                    <p className="text-sm opacity-75">
                      {selectedImage.uploaded_at ?
                        new Date(selectedImage.uploaded_at).toLocaleDateString() :
                        'ThinQ Chess Academy'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Regular Image
              <>
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.image_name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = '/images/chess-placeholder.jpg';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-6">
                  <h3 className="text-xl font-bold">{selectedImage.image_name}</h3>
                  <p className="text-sm opacity-75">
                    {selectedImage.uploaded_at ?
                      new Date(selectedImage.uploaded_at).toLocaleDateString() :
                      'ThinQ Chess Academy'
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-[#2B3AA0] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Chess Community
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Be part of these amazing moments! Enroll in our courses and participate in tournaments.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="/registration"
              className="bg-[#FFB31A] hover:bg-[#e6a117] text-[#2B3AA0] px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Enroll in Courses
            </a>
            <a
              href="/tournaments"
              className="border-2 border-white hover:bg-white hover:text-[#2B3AA0] px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Join Tournaments
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
