import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminPage() {
  // client-side auth
  const [email, setEmail] = useState(() => sessionStorage.getItem('admin_email') || '');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem('admin_token'));

  // blog fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [content, setContent] = useState('');
  const [notify, setNotify] = useState(true);

  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<any | null>(null);

  // -----------------------------------------------------
  // Helper: Extract body + metadata from full HTML paste
  // -----------------------------------------------------
  const extractBodyHtml = (rawHtml: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      const body = doc.body?.innerHTML?.trim() || rawHtml;

      const extractedTitle =
        doc.querySelector('title')?.textContent?.trim() || '';

      const metaDesc =
        (doc.querySelector('meta[name="description"]') as HTMLMetaElement)?.content?.trim() ||
        '';

      const ogImage =
        (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content?.trim() ||
        (doc.querySelector('meta[name="twitter:image"]') as HTMLMetaElement)?.content?.trim() ||
        '';

      return { body, extractedTitle, metaDesc, ogImage };
    } catch (e) {
      return { body: rawHtml, extractedTitle: '', metaDesc: '', ogImage: '' };
    }
  };

  // -----------------------------------------------------
  // Auto-fill title/description/thumbnail when admin
  // pastes a full HTML document into content field
  // -----------------------------------------------------
  useEffect(() => {
    if (!content) return;
    const { extractedTitle, metaDesc, ogImage } = extractBodyHtml(content);

    if (!title && extractedTitle) setTitle(extractedTitle);
    if (!description && metaDesc) setDescription(metaDesc);
    if (!thumbnail && ogImage) setThumbnail(ogImage);
  }, [content]);

  // -----------------------------------------------------
  // Publish new blog
  // -----------------------------------------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!slug || !content) return toast.error('Slug and content are required');

    setLoading(true);

    try {
      // clean + extract meta before sending to backend
      const extracted = extractBodyHtml(content);

      const safeContent = extracted.body;
      const safeTitle = title || extracted.extractedTitle || 'Untitled';
      const safeDescription =
        description ||
        extracted.metaDesc ||
        safeContent.replace(/<[^>]+>/g, '').slice(0, 160);
      const safeThumbnail = thumbnail || extracted.ogImage || '';

      const API = (await import('@/lib/api')).getApiUrl();
      const headers: any = { 'Content-Type': 'application/json' };
      const t = sessionStorage.getItem('admin_token');
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const payload = {
        title: safeTitle,
        slug,
        category,
        description: safeDescription,
        thumbnail: safeThumbnail,
        content: safeContent,
        notify,
      };

      const res = await fetch(`${API}/api/blogs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to publish');

      toast.success('Blog published successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Publish failed');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Login
  // -----------------------------------------------------
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

      // fetch admin info
      const t = data.token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const resp = await fetch(`${API}/api/admin/me`, { headers });
      if (resp.ok) setMe(await resp.json());
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    setLoggedIn(false);
    toast.success('Logged out');
  };

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
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
          {/* admin header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>Signed in as <strong>{email}</strong></div>
              <Button variant="ghost" onClick={handleLogout}>Logout</Button>
            </div>
          </div>

          {/* admin info */}
          {me?.admin && (
            <div className="mb-4 border p-4 rounded">
              <div className="text-sm">Admin ID: <code>{me.admin.id}</code></div>
              <div className="text-sm">Email: {me.admin.email}</div>

              {me.pendingJobsCount >= 0 && (
                <div className="text-sm mt-2">
                  Email jobs queued: <strong>{me.pendingJobsCount}</strong>
                </div>
              )}

              {me.recent?.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium">Recent posts</div>
                  <ul className="list-disc pl-5">
                    {me.recent.map((r: any) => (
                      <li key={r.id}>
                        <strong>{r.title}</strong> — {new Date(r.createdAt).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* blog editor */}
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Slug (url-friendly)" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
            <Input placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <Textarea
              placeholder="Content (paste HTML here)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[250px]"
            />

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span>Notify subscribers by email</span>
            </label>

            <Button type="submit" disabled={loading}>
              {loading ? 'Publishing…' : 'Publish'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
