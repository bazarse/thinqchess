import ContactUs from "@/components/ContactUs";
import Banner from "@/components/ui/Banner";
import blogs from "@/utils/blogs";
import { notFound } from "next/navigation";

// ✅ Static params for export
export function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

// ✅ Page component
export default function BlogDetail({ params }) {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) return notFound();

  return (
    <>
      <Banner
        heading={blog.title}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />
      <section className="md:w-11/12 w-full max-md:px-4 mx-auto my-20">
        <h1 className="text-5xl font-bold mb-4 leading-[60px]">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{blog.date}</p>
        <div>{blog.content}</div>
      </section>
    </>
  );
}
