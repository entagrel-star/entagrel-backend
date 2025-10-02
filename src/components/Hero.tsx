import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center pt-24 md:pt-0">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-primary font-semibold text-sm md:text-base tracking-wide">
            TURN SPEND INTO POWER
          </span>
          <h2 className="text-4xl md:text-6xl font-bold my-4 text-foreground leading-tight">
            Stop Guessing. Start Growing with Intelligent Ads.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            We leverage cutting-edge AI to optimize your Meta & Google Ad campaigns,
            turning your marketing spend into predictable, scalable revenue.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#contact">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg shadow-xl hover:scale-105 transition-transform"
              >
                Book a Strategy Call
              </Button>
            </a>
            <a
              href="#newsletter"
              className="text-primary font-medium py-3 px-8 hover:underline flex items-center gap-2"
            >
              Join AI Insider <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
