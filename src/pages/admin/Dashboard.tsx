import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) navigate("/admin");

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    fetch(`${API}/api/blogs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin");
          return [];
        }
        return res.json();
      })
      .then((data) => setBlogs(data))
      .catch((err) => console.error("Error fetching blogs:", err));
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
        <div className="space-x-3">
          <Link
            to="/admin/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
          >
            + New Blog
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-400"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {blogs.length > 0 ? (
          blogs.map((b) => (
            <div
              key={b.id}
              className="bg-white border p-5 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold mb-1">{b.title}</h2>
              <p className="text-sm text-gray-500 mb-2">{b.category}</p>
              <p className="text-gray-700 mb-3 line-clamp-2">{b.description}</p>
              <a
                href={`/blog/${b.slug}`}
                target="_blank"
                className="text-blue-600 hover:underline text-sm"
              >
                View Live →
              </a>
            </div>
          ))
        ) : (
          <p>No blogs yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
