import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Target, TrendingUp, CheckCircle2 } from 'lucide-react';

const Services = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="services"
      ref={ref}
      className={`py-20 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Our Core Services
          </h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            We focus on what moves the needle. Master the two most powerful ad platforms on
            the planet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-primary mb-4" />
            <h4 className="text-2xl font-bold mb-3 text-foreground">Meta Ads Management</h4>
            <p className="text-muted-foreground mb-4">
              Engage your ideal customers on Facebook & Instagram with campaigns that convert.
            </p>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Precision audience targeting & retargeting.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Creative A/B testing and optimization.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>AI-driven budget and bid management.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Comprehensive performance analytics.</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h4 className="text-2xl font-bold mb-3 text-foreground">Google Ads & Analytics</h4>
            <p className="text-muted-foreground mb-4">
              Capture high-intent customers actively searching for your solution.
            </p>
            <ul className="space-y-2 text-foreground">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Search, Display, and YouTube ad campaigns.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Keyword research and competitor analysis.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Conversion tracking and ROI analysis.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>In-depth Google Analytics 4 insights.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
