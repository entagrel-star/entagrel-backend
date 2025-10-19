import { useEffect, useState } from 'react';
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/blogs/${slug}`);
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
      <p className="text-muted-foreground mb-6">{post.description}</p>
      {post.contentType === 'mdx' ? (
        <div className="prose">
          {/*
            NOTE: MDX runtime rendering requires compiling MDX to React —
            recommended approach: compile MDX at publish time (server-side) to a serialized format
            or use a server-side renderer (xdm) and hydrate client-side. For now we render raw content.
          */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
    </div>
  );
}
