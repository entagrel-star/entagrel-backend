// src/pages/BlogSingle.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Blog = {
  id?: string | number;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  thumbnail?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  content?: string; // cleaned body HTML
  compiledHtml?: string; // optional
  author?: { name?: string; email?: string };
  datePublished?: string;
  createdAt?: string;
  updatedAt?: string;
};

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
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = id;
  s.textContent = JSON.stringify(json);
  document.head.appendChild(s);
}

function extractPlainTextFromHtml(html: string) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body ? (doc.body.textContent || '') : '';
  } catch {
    return html.replace(/<[^>]+>/g, '');
  }
}

function makeSrcSet(url?: string) {
  if (!url) return undefined;
  const m = url.match(/(.*?)(\.[a-zA-Z0-9]+)(\?.*)?$/);
  if (!m) return undefined;
  const base = m[1];
  const ext = m[2];
  const q = m[3] || '';
  return `${base}-600${ext}${q} 600w, ${base}-1200${ext}${q} 1200w`;
}

export default function BlogSingle() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const API = import.meta.env.VITE_API_URL || (window as any).__API_URL || '';
    (async () => {
      try {
        const res = await fetch(`${API}/api/blogs/${slug}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Inject SEO meta when post loads
  useEffect(() => {
    if (!post) return;

    const pageTitle = `${post.title} — Entagrel Marketing`;
    document.title = pageTitle;

    const canonical = `${window.location.origin}/blog/${post.slug}`;
    upsertLink('canonical', canonical);

    const plain = extractPlainTextFromHtml(post.content || post.compiledHtml || '');
    const shortDesc = (post.description && post.description.trim()) || (plain ? plain.slice(0, 160).replace(/\s+\S*$/, '') : '');

    upsertMeta('description', shortDesc);
    upsertMeta('og:title', pageTitle, true);
    upsertMeta('og:description', shortDesc, true);
    upsertMeta('og:url', canonical, true);
    upsertMeta('og:image', post.thumbnail || `${window.location.origin}/og-image.png`, true);
    upsertMeta('og:type', 'article', true);

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', pageTitle);
    upsertMeta('twitter:description', shortDesc);
    upsertMeta('twitter:image', post.thumbnail || `${window.location.origin}/og-image.png`);

    const jsonld: any = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
      "headline": post.title,
      "description": shortDesc,
      "image": [post.thumbnail || `${window.location.origin}/og-image.png`],
      "author": { "@type": "Person", "name": post.author?.name || post.author?.email || "Entagrel" },
      "publisher": { "@type": "Organization", "name": "Entagrel Marketing", "logo": { "@type": "ImageObject", "url": `${window.location.origin}/favicon.ico` } },
      "datePublished": post.datePublished || post.createdAt || new Date().toISOString(),
      "dateModified": post.updatedAt || post.datePublished || post.createdAt || new Date().toISOString()
    };
    injectJSONLD('article-jsonld', jsonld);
  }, [post]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!post) return <div className="text-center mt-20">Not found</div>;

  const thumb = post.thumbnail || '';
  const srcSet = makeSrcSet(thumb);
  const imgWidth = post.thumbnailWidth || 1200;
  const imgHeight = post.thumbnailHeight || 630;

  const visibleSummary = post.description || extractPlainTextFromHtml(post.content || post.compiledHtml || '').slice(0, 300);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-blue-600 uppercase mb-2">{post.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              {post.author?.name || post.author?.email || 'Entagrel'} • {new Date(post.datePublished || post.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
          {thumb && (
            <div className="w-full md:w-48 lg:w-56 rounded overflow-hidden shadow-sm">
              <img
                src={thumb}
                alt={post.title}
                width={imgWidth}
                height={imgHeight}
                loading="lazy"
                decoding="async"
                srcSet={srcSet}
                sizes="(max-width: 640px) 100vw, 224px"
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </header>

      {/* Visible summary for readers and search engines */}
      {visibleSummary && (
        <section className="prose mb-6 text-gray-700">
          <strong>Summary:</strong>
          <p>{visibleSummary}</p>
        </section>
      )}

      {/* sr-only structured block for crawlers and screen readers */}
      <div className="sr-only" aria-hidden={false}>
        <div><strong>Title:</strong> {post.title}</div>
        <div><strong>Author:</strong> {post.author?.name || post.author?.email || 'Entagrel'}</div>
        <div><strong>Category:</strong> {post.category}</div>
        <div><strong>Published:</strong> {post.datePublished || post.createdAt}</div>
        <div><strong>Description:</strong> {post.description || visibleSummary}</div>
      </div>

      {/* Article body */}
      <article className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.compiledHtml || post.content || '' }} />
      </article>
    </main>
  );
}
