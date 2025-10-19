import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [content, setContent] = useState('');
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title || !slug || !content) return toast.error('Title, slug and content are required');
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/publishBlog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, category, description, thumbnail, content, notify }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      toast.success('Blog published');
    } catch (err: any) {
      toast.error(err?.message || 'Publish failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Admin — Publish Blog</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Slug (url-friendly)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
        <Input placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Textarea placeholder="Content (HTML/JSX/MDX)" value={content} onChange={(e) => setContent(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          <span>Notify subscribers by email</span>
        </label>
        <div>
          <Button type="submit" disabled={loading}>{loading ? 'Publishing...' : 'Publish'}</Button>
        </div>
      </form>
    </div>
  );
}
