import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import CTA from "@/components/CTA"; // ✅ added
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Process />

        {/* ✅ Add CTA only once before footer */}
        <CTA />
      </main>
    </div>
  );
};

export default Index;
