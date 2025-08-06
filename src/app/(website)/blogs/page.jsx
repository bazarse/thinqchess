"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
// import blogs from "@/utils/blogs"; // Removed static blogs
import Banner from "@/components/ui/Banner";


export default function BlogList() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      // Fetch published blogs from admin-managed SQLite database
      const response = await fetch('/api/blogs?status=published');
      if (response.ok) {
        const adminBlogs = await response.json();
        setAllBlogs(adminBlogs);
      } else {
        throw new Error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      // Show empty state if no blogs
      setAllBlogs([]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Banner
        heading={" Blogs"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />
      <section className="md:w-11/12 w-full max-md:px-4 mx-auto my-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading blogs...</span>
          </div>
        ) : allBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allBlogs.map((blog) => (
            <div
              key={blog.slug}
              className="rounded-md shadow hover:shadow-md overflow-hidden"
            >
              <img
                src={blog.featured_image || blog.banner_img || '/images/default-blog.jpg'}
                className="w-full h-[250px] object-cover"
                alt={blog.title}
              />
              <div className="px-4 py-4">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {blog.created_at?.toDate?.()?.toLocaleDateString() || blog.date}
                </p>
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blogs Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We're working on creating amazing content about chess strategies, tips, and stories. Check back soon for our latest blog posts!
            </p>
          </div>
        )}
      </section>
    </>
  );
}
