import { Link } from "react-router-dom";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    category: string;
    description?: string;
    thumbnail?: string;
  };
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <div className="rounded-xl overflow-hidden border shadow hover:shadow-md transition bg-white">
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
  );
}
