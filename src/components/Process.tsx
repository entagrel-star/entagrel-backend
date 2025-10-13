import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Process = () => {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      number: '1',
      title: 'Discovery & Strategy',
      description:
        'We dive deep into your business, goals, and ideal customers to build a custom ad strategy.',
    },
    {
      number: '2',
      title: 'Campaign Launch',
      description:
        'We build and launch your campaigns, focusing on compelling creative and precise targeting.',
    },
    {
      number: '3',
      title: 'AI Optimization',
      description:
        'Our AI tools monitor and optimize your campaigns 24/7 for peak performance and efficiency.',
    },
    {
      number: '4',
      title: 'Reporting & Scaling',
      description:
        "You receive clear, actionable reports. We use the data to scale what's working and drive more growth.",
    },
  ];

  return (
    <section
      id="process"
      ref={ref}
      className={`py-20 bg-card transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">
            Our 4-Step Growth Process
          </h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            A transparent and collaborative path to achieving your marketing goals.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className="bg-accent text-accent-foreground text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {step.number}
              </div>
              <h5 className="font-bold text-lg mb-1 text-foreground">{step.title}</h5>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
