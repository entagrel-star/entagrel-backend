import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { useParams } from 'react-router-dom';

export default function BlogPost() {
  // This file assumes you're using react-router and have a route like /blog/:slug
  const params = (useParams as any)();
  const slug = params.slug as string | undefined;
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const API = getApiUrl();
        const res = await fetch(`${API}/api/blogs/${slug}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-muted-foreground mb-2">{post.description}</p>
      <p className="text-sm text-muted-foreground mb-6">By {post.author?.name || post.author?.email || 'Unknown'}</p>
      {post.compiledHtml ? (
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.compiledHtml }} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
    </div>
  );
}
