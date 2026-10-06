import { Suspense } from "react";
import { CountdownSection } from "@/components/CountdownSection";
import { DetailsSection } from "@/components/DetailsSection";
import { GiftsSection } from "@/components/GiftsSection";
import { HeroSection } from "@/components/HeroSection";
import { RsvpSection } from "@/components/RsvpSection";
import { SiteHeader } from "@/components/SiteHeader";
import { StorySection } from "@/components/StorySection";

export default function Home() {
  return (
    <main className="wedding-site">
      <SiteHeader />
      <HeroSection />
      <StorySection />
      <CountdownSection />
      <DetailsSection />
      <Suspense fallback={<section className="gifts" id="presentes"><div className="gifts-card"><h2>Lista de presentes</h2><p>Carregando presentes…</p></div></section>}><GiftsSection /></Suspense>
      <RsvpSection />
    </main>
  );
}
