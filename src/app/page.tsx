import { HeroSection } from "@/components/hero/hero-section";
import { SkillsSection } from "@/components/home/skills-section";
import { TechStack } from "@/components/home/tech-stack";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SkillsSection />
      <TechStack />
    </>
  );
}
