import ContactUs from "@/components/ContactUs";
import Banner from "@/components/ui/Banner";
import { notFound } from "next/navigation";

// Fetch blog from database
async function getBlog(slug) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    const blog = await db.get('SELECT * FROM blogs WHERE slug = ? AND is_published = 1', [slug]);
    return blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// ✅ Page component
export default async function BlogDetail({ params }) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog) return notFound();

  return (
    <>
      <Banner
        heading={blog.title}
        image={blog.featured_image || "/images/about-banner.jpg"}
        link={"/"}
      />
      <section className="md:w-11/12 w-full max-md:px-4 mx-auto my-20">
        <h1 className="text-5xl font-bold mb-4 leading-[60px]">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(blog.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}
        </p>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </section>
    </>
  );
}
