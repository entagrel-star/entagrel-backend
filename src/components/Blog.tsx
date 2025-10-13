import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowRight } from 'lucide-react';
import blogAiCreative from '@/assets/blog-ai-creative.jpg';
import blogGoogleAds from '@/assets/blog-google-ads.jpg';
import blogAnalytics from '@/assets/blog-analytics.jpg';

const Blog = () => {
  const { ref, isVisible } = useScrollAnimation();

  const posts = [
    {
      image: blogAiCreative,
      category: 'ARTIFICIAL INTELLIGENCE',
      title: '5 Ways Generative AI is Changing Ad Creative Forever',
      description:
        'From copywriting to video generation, discover the AI tools that are becoming essential for marketers.',
    },
    {
      image: blogGoogleAds,
      category: 'GOOGLE ADS',
      title: 'Beyond Keywords: The Rise of Performance Max Campaigns',
      description:
        'Is PMax a black box? We break down how it works and how to get the most out of it.',
    },
    {
      image: blogAnalytics,
      category: 'MARKETING ANALYTICS',
      title: 'Are You Ready for a Cookieless Future? Preparing Your Analytics',
      description:
        "Third-party cookies are disappearing. Here's how to adapt your measurement strategy for 2025.",
    },
  ];

  return (
    <section
      id="blog"
      ref={ref}
      className={`py-20 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          
         
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-card rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow"
            >
              <div className="overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <span className="text-sm text-primary font-medium">{post.category}</span>
                <h4 className="text-xl font-bold my-2 text-foreground">{post.title}</h4>
                <p className="text-muted-foreground text-sm mb-4">{post.description}</p>
                <a
                  href="#"
                  className="font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  Read More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
