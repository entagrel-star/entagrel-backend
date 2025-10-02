import Header from '@/components/Header';
import Blog from '@/components/Blog';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const BlogPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            AI Marketing <span className="text-primary">Insights</span>
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Stay updated with the latest trends, strategies, and insights in AI-powered digital marketing
          </p>
        </div>
        <Blog />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
