// src/components/newsletter-signup.tsx
import { useState } from "react";
import { getApiUrl } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const API = getApiUrl();
    if (!API) {
      toast.error("Server URL is not configured. Check environment variables.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/saveEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        toast.error(data?.error || "Subscription failed");
      } else {
        toast.success(data?.message || "Subscribed successfully!");
        setEmail("");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit}>
      <div className="flex items-center space-x-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Mail className="mr-2 h-4 w-4" />
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
    </form>
  );
}
