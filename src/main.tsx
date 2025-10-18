import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogSingle from "./pages/BlogSingle";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import BlogEditor from "./pages/admin/BlogEditor";
import Layout from "./components/Layout";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public Pages with layout */}
        <Route
          path="/"
          element={
            <Layout>
              <Index />
            </Layout>
          }
        />
        <Route
          path="/blog"
          element={
            <Layout>
              <Blog />
            </Layout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <Layout>
              <BlogSingle />
            </Layout>
          }
        />

        {/* Admin Pages (without Header/Footer) */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/new" element={<BlogEditor />} />

        {/* Fallback */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
