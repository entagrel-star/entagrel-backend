// src/components/BlogCard.tsx
import React from 'react';

export type BlogSummary = {
  id?: string | number;
  title: string;
  slug: string;
  category?: string;
  description?: string; // short description / excerpt
  hook?: string;        // optional hook/headline
  thumbnail?: string;   // absolute or /public path
  thumbnailWidth?: number;
  thumbnailHeight?: number;
};

function makeSrcSet(url?: string) {
  if (!url) return undefined;
  const m = url.match(/(.*?)(\.[a-zA-Z0-9]+)(\?.*)?$/);
  if (!m) return undefined;
  const base = m[1];
  const ext = m[2];
  const q = m[3] || '';
  return `${base}-600${ext}${q} 600w, ${base}-1200${ext}${q} 1200w`;
}

export default function BlogCard({ blog }: { blog: BlogSummary }) {
  const thumb = blog.thumbnail || '/default-blog-thumb.jpg';
  const srcSet = makeSrcSet(thumb);
  const width = blog.thumbnailWidth || 1200;
  const height = blog.thumbnailHeight || 630;

  // detect iframe and set target so links escape the iframe when embedded
  const inBrowser = typeof window !== 'undefined';
  const inIframe = inBrowser && window.self !== window.top;
  const target = inIframe ? '_top' : '_self';

  const href = `/blog/${blog.slug}`;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* image area */}
      <div className="bg-slate-100 h-44 md:h-48 flex items-center justify-center">
        <img
          src={thumb}
          alt={blog.title}
          className="object-cover w-full h-full"
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, 420px"
        />
      </div>

      {/* content */}
      <div className="p-6">
        {blog.category && (
          <div className="text-xs text-blue-600 font-semibold mb-2 uppercase">
            {blog.category}
          </div>
        )}

        <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2 leading-snug">
          {blog.hook || blog.title}
        </h3>

        {blog.description && (
          <p className="text-sm text-slate-600 mb-4">
            {blog.description}
          </p>
        )}

        <div>
          {/* Use a plain anchor so navigation always works.
              - target="_top" when inside an iframe (so link escapes iframe)
              - fallback timeout ensures navigation happens if SPA router isn't mounted */}
          <a
            href={href}
            target={target}
            rel="noopener noreferrer"
            className="text-blue-600 font-medium hover:underline"
            aria-label={`Read more about ${blog.title}`}
            onClick={() => {
              // fallback: if router doesn't navigate, force full navigation after short delay
              if (inBrowser) {
                setTimeout(() => {
                  if (window.location.pathname !== href) {
                    window.location.href = href;
                  }
                }, 250);
              }
            }}
          >
            Read More →
          </a>
        </div>
      </div>
    </article>
  );
}
