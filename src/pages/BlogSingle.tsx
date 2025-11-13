// src/pages/BlogSingle.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * SEO-friendly single blog page:
 * - runtime meta tags + OG + twitter
 * - JSON-LD Article markup
 * - accessible summary + hidden machine-readable block
 * - improved <img> attributes + srcset generation
 *
 * Note: This approach uses DOM APIs to set head elements so it works
 * without a head-manager library.
 */

function setMetaTag(selector: string, attr: string, value: string) {
  let el = document.querySelector(`${selector}[${attr}]`) as HTMLElement | null;
  if (el) {
    el.setAttribute(attr, value);
  } else {
    // selector e.g. 'meta[name="description"]' or 'link[rel="canonical"]'
    const parts = selector.split('[')[0];
    if (parts === 'meta') {
      const m = document.createElement('meta');
      // extract name or property from selector like meta[name="..."]
      const match = selector.match(/\[(name|property)=["'](.+)["']\]/);
      if (match) (m as any)[match[1]] = match[2];
      m.setAttribute(attr, value);
      document.head.appendChild(m);
    } else if (parts === 'link') {
      const link = document.createElement('link');
      const match = selector.match(/\[(rel)=["'](.+)["']\]/);
      if (match) (link as any)[match[1]] = match[2];
      link.setAttribute(attr, value);
      document.head.appendChild(link);
    }
  }
}

function upsertMeta(nameOrProp: string, value: string, isProperty = false) {
  if (!value) return;
  if (isProperty) {
    let m = document.querySelector(`meta[property="${nameOrProp}"]`) as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('property', nameOrProp);
      document.head.appendChild(m);
    }
    m.content = value;
  } else {
    let m = document.querySelector(`meta[name="${nameOrProp}"]`) as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', nameOrProp);
      document.head.appendChild(m);
    }
    m.content = value;
  }
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function injectJSONLD(id: string, json: object) {
  // remove old
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(json);
  document.head.appendChild(s);
}

function generateSrcSet(url: string) {
  // naive generator: insert -600 and -1200 before extension if URL is local or remote
  if (!url) return undefined;
  const m = url.match(/(.*?)(\.[a-zA-Z0-9]+)(\?.*)?$/);
  if (!m) return undefined;
  const base = m[1];
  const ext = m[2];
  const query = m[3] || '';
  const s600 = `${base}-600${ext}${query} 600w`;
  const s1200 = `${base}-1200${ext}${query} 1200w`;
  return `${s600}, ${s1200}`;
}

export default function BlogSingle() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL;
    if (!slug) return;
    fetch(`${API}/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => setBlog(data))
      .catch((err) => console.error("Error fetching blog:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!blog) return;

    // TITLE
    const pageTitle = `${blog.title} — Entagrel Marketing`;
    document.title = pageTitle;

    // description fallback: blog.description or first 160 chars from content
    const parser = new DOMParser();
    let plain = '';
    try {
      const doc = parser.parseFromString(blog.content || blog.compiledHtml || '', 'text/html');
      plain = doc.body ? doc.body.textContent?.trim() || '' : '';
    } catch (e) {
      plain = '';
    }
    const shortDesc = (blog.description && blog.description.trim()) || (plain ? plain.slice(0, 160).replace(/\s+\S*$/, '') : '');

    // Basic meta
    upsertMeta('description', shortDesc || 'Read this article on Entagrel Marketing.');
    upsertLink('canonical', blog.canonical || `${window.location.origin}/blog/${blog.slug || slug}`);

    // Open Graph
    upsertMeta('og:title', pageTitle, true);
    upsertMeta('og:description', shortDesc || '', true);
    upsertMeta('og:url', `${window.location.origin}/blog/${blog.slug || slug}`, true);
    upsertMeta('og:image', blog.ogImage || blog.thumbnail || `${window.location.origin}/og-image.png`, true);
    upsertMeta('og:type', 'article', true);

    // Twitter
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', pageTitle);
    upsertMeta('twitter:description', shortDesc || '');
    upsertMeta('twitter:image', blog.ogImage || blog.thumbnail || `${window.location.origin}/og-image.png`);

    // JSON-LD
    const jsonld: any = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${window.location.origin}/blog/${blog.slug || slug}`
      },
      "headline": blog.title,
      "description": shortDesc || '',
      "image": [blog.ogImage || blog.thumbnail || `${window.location.origin}/og-image.png`],
      "author": {
        "@type": "Person",
        "name": blog.author?.name || blog.author?.email || "Entagrel"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Entagrel Marketing",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/favicon.ico`
        }
      },
      "datePublished": blog.datePublished || blog.createdAt || new Date().toISOString(),
      "dateModified": blog.dateModified || blog.updatedAt || blog.datePublished || new Date().toISOString()
    };

    injectJSONLD('article-jsonld', jsonld);
  }, [blog, slug]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!blog) return <p className="text-center mt-20">Not found</p>;

  // build srcset and sizes for thumbnail
  const thumb = blog.thumbnail || blog.ogImage || '';
  const srcSet = generateSrcSet(thumb);
  const imgWidth = blog.thumbnailWidth || 1200;
  const imgHeight = blog.thumbnailHeight || 630;

  // Accessible summary: visible and a screen-reader block.
  // Visible summary helps users and bots. SR-only block helps screenreaders and crawlers index raw data/tables.
  const visibleSummary = blog.shortSummary || blog.description || '';
  // extra fallback: extract first 300 chars from HTML content (already attempted above)
  const extractPlain = (html: string) => {
    try {
      const doc = new DOMParser().parseFromString(html || '', 'text/html');
      return doc.body ? (doc.body.textContent || '') : '';
    } catch (e) {
      return '';
    }
  };
  const fallbackSummary = visibleSummary || extractPlain(blog.content || blog.compiledHtml || '').slice(0, 300);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <p className="text-blue-600 text-sm mb-2 uppercase">{blog.category}</p>
      {blog.author && <p className="text-sm text-muted-foreground mb-2">By {blog.author?.name || blog.author?.email}</p>}
      {blog.datePublished && <p className="text-sm text-muted-foreground mb-4">Published: {new Date(blog.datePublished).toLocaleDateString()}</p>}

      {thumb && (
        <img
          src={thumb}
          alt={blog.title || 'Article image'}
          className="w-full rounded-lg mb-6"
          width={imgWidth}
          height={imgHeight}
          loading="lazy"
          decoding="async"
          srcSet={srcSet}
          sizes="(max-width: 600px) 100vw, 1200px"
        />
      )}

      {/* Visible summary for humans and search engines */}
      {fallbackSummary && (
        <div className="mb-6 prose text-gray-700">
          <strong>Summary:</strong>
          <p>{fallbackSummary}</p>
        </div>
      )}

      {/* Hidden but crawlable structured block (screen readers included) */}
      <div className="sr-only" aria-hidden={false}>
        <div><strong>Title:</strong> {blog.title}</div>
        <div><strong>Author:</strong> {blog.author?.name || blog.author?.email || 'Entagrel'}</div>
        <div><strong>Category:</strong> {blog.category}</div>
        <div><strong>Published:</strong> {blog.datePublished || blog.createdAt || ''}</div>
        <div><strong>Description:</strong> {blog.description || extractPlain(blog.content || blog.compiledHtml || '').slice(0, 300)}</div>
      </div>

      <div
        className="prose prose-lg text-gray-700"
        dangerouslySetInnerHTML={{ __html: blog.compiledHtml || blog.content }}
      />
    </div>
  );
}
