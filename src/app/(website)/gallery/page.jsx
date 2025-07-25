"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic import for Banner
const Banner = dynamic(() => import("../../components/ui/Banner"), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse"></div>
});

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Static gallery images (fallback)
  const staticImages = [
    { id: 1, image_url: "/images/indian-img-one.jpg", image_name: "Chess Training Session" },
    { id: 2, image_url: "/images/indian-img-two.jpg", image_name: "Tournament Winners" },
    { id: 3, image_url: "/images/indian-img-three.jpg", image_name: "Young Chess Masters" },
    { id: 4, image_url: "/images/indian-img-four.jpg", image_name: "Strategy Discussion" },
    { id: 5, image_url: "/images/indian-img-five.jpg", image_name: "Chess Academy" },
    { id: 6, image_url: "/images/contact-one.jpg", image_name: "Learning Together" },
  ];

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      if (response.ok) {
        const data = await response.json();
        // Combine admin uploaded images with static images
        const allImages = [...data, ...staticImages];
        setImages(allImages);
      } else {
        // Use static images as fallback
        setImages(staticImages);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      // Use static images as fallback
      setImages(staticImages);
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

        {/* Admin Uploaded Images Section */}
        {images.filter(img => img.id > 1000).length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-bold text-[#2B3AA0] mb-6 text-center">
              Latest Updates from ThinQ Chess
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.filter(img => img.id > 1000).map((image) => (
                <div 
                  key={image.id} 
                  className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                  onClick={() => openModal(image)}
                >
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={image.image_url}
                      alt={image.image_name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      onError={(e) => {
                        e.target.src = '/images/chess-placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#2B3AA0] transition-colors">
                      {image.image_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {image.uploaded_at ? new Date(image.uploaded_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Static Gallery Grid */}
        <div className="md:mt-16 mt-8">
          <h3 className="text-xl font-bold text-[#2B3AA0] mb-6 text-center">
            Our Chess Journey
          </h3>
          <div className="max-md:flex max-md:flex-col md:grid grid-cols-3 grid-rows-2 gap-4">
            {staticImages.map((imgItem, index) => {
              return (
                <div
                  key={index}
                  className="group overflow-hidden rounded-md cursor-pointer relative aspect-video"
                  onClick={() => openModal(imgItem)}
                >
                  <Image
                    src={imgItem.image_url}
                    alt={imgItem.image_name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="group-hover:scale-[105%] transition-all duration-300 object-cover"
                    loading="lazy"
                    quality={80}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modal for Image Preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
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
