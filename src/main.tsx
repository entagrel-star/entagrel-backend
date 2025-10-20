import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";
import "./index.css";

const App = React.lazy(() => import("./App"));
const Index = React.lazy(() => import("./pages/Index"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogSingle = React.lazy(() => import("./pages/BlogSingle"));
const Login = React.lazy(() => import("./pages/admin/Login"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const BlogEditor = React.lazy(() => import("./pages/admin/BlogEditor"));
const MainLayout = React.lazy(() => import("./components/Layout"));
const BlogPostLayout = React.lazy(() => import("./components/BlogPostLayout"));

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
          {/* General Pages with MainLayout (nav/footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
          </Route>

          {/* Standalone Blog Reader (no nav/footer) */}
          <Route
            path="/blog/:slug"
            element={
              <React.Suspense fallback={<Loading />}>
                <BlogPostLayout>
                  <BlogSingle />
                </BlogPostLayout>
              </React.Suspense>
            }
          />


          {/* Admin Login (public) */}
          <Route path="/admin" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/new" element={<BlogEditor />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
);
