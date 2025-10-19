import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";

const App = React.lazy(() => import("./App"));
const Index = React.lazy(() => import("./pages/Index"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogSingle = React.lazy(() => import("./pages/BlogSingle"));
const Login = React.lazy(() => import("./pages/admin/Login"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const BlogEditor = React.lazy(() => import("./pages/admin/BlogEditor"));
const Layout = React.lazy(() => import("./components/Layout"));

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div>Loading...</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          style: { fontSize: "15px", borderRadius: "10px" },
          duration: 3500,
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Pages with layout */}
          <Route
            path="/"
            element={
              <React.Suspense fallback={<Loading />}>
                <Layout>
                  <Index />
                </Layout>
              </React.Suspense>
            }
          />
          <Route
            path="/blog"
            element={
              <React.Suspense fallback={<Loading />}>
                <Layout>
                  <Blog />
                </Layout>
              </React.Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <React.Suspense fallback={<Loading />}>
                <Layout>
                  <BlogSingle />
                </Layout>
              </React.Suspense>
            }
          />

          {/* Admin Pages (without Header/Footer) */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/new" element={<BlogEditor />} />

          {/* Fallback */}
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
