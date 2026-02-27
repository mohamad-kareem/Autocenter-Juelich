// app/page.jsx (Server Component)
import HeroSectionWithSearch from "@/app/(components)/Herosection";
import Features from "@/app/(components)/Features";
import { fetchSellerAds, mapAdToUiCar } from "@/lib/mobilede";

export default async function Home() {
  const ads = await fetchSellerAds();
  const cars = ads.map(mapAdToUiCar);

  const brands = Array.from(
    new Set(cars.map((c) => String(c.brand || "").trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "de"));

  return (
    <div className="min-h-screen ac-page">
      <HeroSectionWithSearch brands={brands} />
      <Features />
    </div>
  );
}
