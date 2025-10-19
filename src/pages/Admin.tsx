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
  const [me, setMe] = useState<any | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title || !slug || !content) return toast.error('Title, slug and content are required');
    setLoading(true);
    try {
      const API = (await import('@/lib/api')).getApiUrl();
      const headers: any = { 'Content-Type': 'application/json' };
      const t = sessionStorage.getItem('admin_token');
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const res = await fetch(`${API}/api/blogs`, {
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
      const API = (await import('@/lib/api')).getApiUrl();
      const res = await fetch(`${API}/api/admin/login`, {
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
      // fetch admin info after login
      try {
        const API = (await import('@/lib/api')).getApiUrl();
        const t = sessionStorage.getItem('admin_token');
        const headers: any = { 'Content-Type': 'application/json' };
        if (t) headers['Authorization'] = `Bearer ${t}`;
        const resp = await fetch(`${API}/api/admin/me`, { headers });
        if (resp.ok) setMe(await resp.json());
      } catch (e) {
        // ignore
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
            <div className="flex items-center justify-between">
              <div>Signed in as <strong>{sessionStorage.getItem('admin_email') || 'admin'}</strong></div>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
          {me?.admin && (
            <div className="mb-4 border p-4 rounded">
              <div className="text-sm text-muted-foreground">Admin ID: <code>{me.admin.id}</code></div>
              <div className="text-sm">Email: {me.admin.email}</div>
              {typeof me.pendingJobsCount === 'number' && (
                <div className="text-sm mt-2">Queued email jobs: <strong>{me.pendingJobsCount}</strong></div>
              )}
              {me.recent?.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium">Recent posts</div>
                  <ul className="list-disc pl-5">
                    {me.recent.map((r: any) => (
                      <li key={r.id}><strong>{r.title}</strong> — {new Date(r.createdAt).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
