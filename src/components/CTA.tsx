import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function CTA() {
  return (
    <section id="contact" className="bg-card border-t border-border py-16 text-center">
      <div className="container mx-auto px-6">
        <h3 className="text-3xl md:text-4xl font-bold text-foreground">
          Ready to Grow?
        </h3>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Let's talk about your goals. Schedule a free, no-obligation strategy call with one
          of our experts.
        </p>
        <div className="mt-8">
          <a href="mailto:entagrel@gmail.com">
            <Button size="lg" className="text-lg shadow-lg">
              <Mail className="w-5 h-5 mr-2" />
              entagrel@gmail.com
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
