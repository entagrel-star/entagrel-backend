import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminPage() {
  // client-side auth: obtain JWT from server and store in sessionStorage
  const [email, setEmail] = useState(() => sessionStorage.getItem('admin_email') || '');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem('admin_token'));
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
  const headers: any = { 'Content-Type': 'application/json' };
  const t = sessionStorage.getItem('admin_token');
  if (t) headers['Authorization'] = `Bearer ${t}`;

      const res = await fetch(`${API}/api/publishBlog`, {
        method: 'POST',
        headers,
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

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) return toast.error('Enter email and password');
    try {
      const API = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API}/api/adminLogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_email', email);
      setToken(data.token);
      setLoggedIn(true);
      toast.success('Logged in');
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    setEmail('');
    setToken('');
    setLoggedIn(false);
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Admin — Publish Blog</h1>
      {!loggedIn ? (
        <form onSubmit={handleLogin} className="max-w-md space-y-4">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login</Button>
        </form>
      ) : (
        <>
          <div className="mb-4">
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
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
        </>
      )}
    </div>
  );
}
