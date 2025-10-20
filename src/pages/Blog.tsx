import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard"; // ✅ modular blog card
import Newsletter from "@/components/Newsletter"; // ✅ your working subscribe section

export default function Blog() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const API = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API}/api/blogs`);

        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("❌ Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28">
      {/* ✅ Page Header */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-6">
          AI Marketing <span className="text-blue-600">Insights</span>
        </h1>
        <p className="text-center text-gray-500 mb-12">
          Stay updated with the latest trends, strategies, and insights in AI-powered digital marketing.
        </p>

        {/* ✅ Blog List */}
        {loading ? (
          <p className="text-center text-gray-400">Loading blogs...</p>
        ) : blogs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 col-span-full">
            No blogs published yet.
          </p>
        )}

        {/* ✅ Newsletter Section (Only one instance, bottom) */}
        <div className="mt-20">
          <Newsletter />
        </div>
      </div>
    </div>
  );
}
