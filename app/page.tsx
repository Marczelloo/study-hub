import { HeroSection, FeaturesSection, DemoSection, BenefitsSection, CTASection, Footer } from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
