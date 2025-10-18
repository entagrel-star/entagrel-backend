import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Newsletter from "@/components/Newsletter"; // ✅ added

export default function Blog() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetch("https://entagrel.com/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Error fetching blogs:", err));
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Marketing <span className="text-blue-600">Insights</span>
        </h1>
        <p className="text-center text-gray-500 mb-10">
          Stay updated with the latest trends, strategies, and insights in AI-powered digital marketing.
        </p>

        <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          {blogs.length > 0 ? (
            blogs.map((blog: any) => (
              <div
                key={blog.id}
                className="rounded-xl overflow-hidden border shadow hover:shadow-md transition"
              >
                {blog.thumbnail && (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-sm text-blue-600 uppercase tracking-wide font-semibold mb-2">
                    {blog.category}
                  </p>
                  <h2 className="text-lg font-semibold mb-2">{blog.title}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {blog.description?.substring(0, 100)}...
                  </p>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-blue-500 text-sm font-medium hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-full">
              No blogs published yet.
            </p>
          )}
        </div>

        {/* ✅ Newsletter section */}
        <div className="mt-20">
          <Newsletter />
        </div>
      </div>
    </div>
  );
}
