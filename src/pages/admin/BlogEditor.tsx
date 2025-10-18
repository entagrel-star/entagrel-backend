import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BlogEditor: React.FC = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) navigate("/admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("https://entagrel.com/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        slug,
        category,
        description,
        thumbnail,
        content,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Blog published successfully!");
      setTimeout(() => navigate("/admin/dashboard"), 2000);
    } else {
      setMessage(`❌ ${data.error || "Failed to publish blog"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
          }}
          className="border p-3 rounded-md w-full"
          required
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border p-3 rounded-md w-full"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="border p-3 rounded-md w-full"
        />
        <textarea
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-3 rounded-md w-full"
          rows={3}
        />
        <textarea
          placeholder="Blog Content (HTML supported)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-3 rounded-md w-full font-mono"
          rows={10}
        />

        {message && <p className="text-center text-sm text-blue-600">{message}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Publish Blog
        </button>
      </form>
    </div>
  );
};

export default BlogEditor;
