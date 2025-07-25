import Link from "next/link";
import blogs from "@/utils/blogs";
import Banner from "@/components/ui/Banner";

export default function BlogList() {
  return (
    <>
      <Banner
        heading={" Blogs"}
        image={"/images/about-banner.jpg"}
        link={"/"}
      />
      <section className="md:w-11/12 w-full max-md:px-4 mx-auto my-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.slug}
              className="rounded-md shadow hover:shadow-md overflow-hidden"
            >
              <img
                src={blog.banner_img}
                className="w-full h-[250px] object-cover"
              />
              <div className="px-4 py-4">
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{blog.date}</p>
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
      </section>
    </>
  );
}
