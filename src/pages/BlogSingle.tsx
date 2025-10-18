import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function BlogSingle() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    fetch(`https://entagrel.com/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => setBlog(data))
      .catch((err) => console.error("Error fetching blog:", err));
  }, [slug]);

  if (!blog) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-blue-600 text-sm mb-2 uppercase">{blog.category}</p>
      {blog.thumbnail && (
        <img
          src={blog.thumbnail}
          alt={blog.title}
          className="w-full rounded-lg mb-6"
        />
      )}
      <div
        className="prose prose-lg text-gray-700"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
