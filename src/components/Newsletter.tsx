import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Newsletter = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState({
    title: '',
    content: '',
  });

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

  const handleSubscribe = async () => {
  if (!isValidEmail(email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/saveEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to subscribe');
    }

    toast.success(data.message || 'Subscribed successfully!');
    setEmail('');
  } catch (error: any) {
    console.error(error);
    toast.error(error.message || 'Failed to subscribe');
  }
};


  const handlePreview = async () => {
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const domain = email.split('@')[1];
      setPreviewContent({
        title: `AI Marketing Insights for ${domain}`,
        content: `Welcome to AI Insider! Based on your domain (${domain}), we've curated personalized insights on leveraging AI for digital marketing growth.\n\nIn this week's edition:\n• Advanced Meta Ads strategies using machine learning\n• Google's latest algorithm updates and what they mean for your campaigns\n• New AI tools that are revolutionizing creative production\n\nJoin thousands of marketers who are staying ahead of the curve with data-driven strategies powered by artificial intelligence.`,
      });
      setIsModalOpen(true);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <>
      <section
        id="newsletter"
        ref={ref}
        className={`transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto bg-primary text-primary-foreground rounded-2xl p-10 md:p-16 text-center shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold">Stay Ahead of the Curve</h3>
            <p className="mt-4 text-primary-foreground/90 max-w-xl mx-auto">
              Join our free AI Insider newsletter for weekly tactics, news, and AI tool
              recommendations that top marketers use.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-white text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <Button
                onClick={handleSubscribe}
                variant="secondary"
                size="lg"
                className="font-bold"
              >
                Subscribe
              </Button>
             
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">{previewContent.title}</DialogTitle>
            <DialogDescription className="text-base pt-4 whitespace-pre-line">
              {previewContent.content}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Newsletter;
