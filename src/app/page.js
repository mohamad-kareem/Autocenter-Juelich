import HeroSectionWithSearch from "@/app/(components)/Herosection";

import Features from "@/app/(components)/Features";
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSectionWithSearch />
      <Features />
    </div>
  );
}
