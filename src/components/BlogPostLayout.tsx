import React from "react";

const BlogPostLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="bg-white min-h-screen">
      {children}
    </main>
  );
};

export default BlogPostLayout;
