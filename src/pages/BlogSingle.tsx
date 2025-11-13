// src/pages/BlogSingle.tsx  (replace whole file)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function extractBodyOnly(html: string) {
  try {
    // If it's a full doc, parse and extract body.innerHTML
    if (/<(!doctype|html|head)/i.test(html)) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body ? doc.body.innerHTML : html;
    }
    return html;
  } catch {
    // fallback: remove head and html tags crudely
    return html.replace(/<head[\s\S]*?<\/head>/gi, '').replace(/<\/?html[^>]*>/gi, '').replace(/<!doctype[^>]*>/gi, '');
  }
}

export default function BlogSingle() {
  const { slug } = useParams();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const API = import.meta.env.VITE_API_URL;
    (async () => {
      try {
        const res = await fetch(`${API}/api/blogs/${slug}`);
        const data = await res.json();
        // ensure we use cleaned content for rendering
        const raw = data.compiledHtml || data.content || '';
        data.content = extractBodyOnly(raw);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!post) return <div className="text-center mt-20">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-muted-foreground mb-2">{post.description}</p>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
