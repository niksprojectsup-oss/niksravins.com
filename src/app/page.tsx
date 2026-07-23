import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { About } from "@/components/sections/About";
import { AAPMethod } from "@/components/sections/AAPMethod";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#2B2B27]">
      <Header />

      <main>
        <Hero />
        <Trust />
        <About />
        <AAPMethod />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}