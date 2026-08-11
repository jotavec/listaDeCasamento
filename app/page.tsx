import { CountdownSection } from "@/components/CountdownSection";
import { DetailsSection } from "@/components/DetailsSection";
import { GiftsSection } from "@/components/GiftsSection";
import { HeroSection } from "@/components/HeroSection";
import { RsvpSection } from "@/components/RsvpSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StorySection } from "@/components/StorySection";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <StorySection />
      <CountdownSection />
      <DetailsSection />
      <GiftsSection />
      <RsvpSection />
      <SiteFooter />
    </main>
  );
}
