import { Footer } from "../components/Footer";
import { DualCTA } from "../components/DualCTA";
import { Features } from "../components/Features";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { SmartNavbar } from "../components/SmartNavbar";
import { ProblemSolution } from "../components/ProblemSolution";
import { Stats } from "../components/Stats";
import { Testimonial } from "../components/Testimonial";
import { TrustBar } from "../components/TrustBar";

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <SmartNavbar />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSolution />
        <HowItWorks />
        <Features />
        <Stats />
        <Testimonial />
        <DualCTA />
      </main>
      <Footer />
    </div>
  );
}