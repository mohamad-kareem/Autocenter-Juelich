import { Suspense } from "react";
import HeroSectionWithSearch from "@/app/(components)/Herosection";
import BrandStrip from "@/app/(components)/BrandStrip";
import FeaturedCarsSlider from "@/app/(components)/FeaturedCarsSlider";
import Features from "@/app/(components)/Features";
import GoogleReviews, { GoogleReviewsSkeleton } from "@/app/(components)/GoogleReviews";
import HowItWorks from "@/app/(components)/HowItWorks";
import { getCarsSafe } from "@/lib/mobilede";
import { getGoogleReviews } from "@/lib/googleReviews";
import { toCardCar } from "@/lib/cars";
import { getAboutImage, getHeroSlides } from "@/lib/heroImages";

export default async function Home() {
  const [rawCars, reviews, heroSlides, aboutImage] = await Promise.all([
    getCarsSafe(),
    getGoogleReviews(),
    getHeroSlides(),
    getAboutImage(),
  ]);
  const cars = rawCars.map(toCardCar);
  const available = cars.filter((c) => !c.reserved);

  const tabs = [
    {
      key: "newest",
      label: "Neueste",
      href: "/fahrzeuge",
      cars: [...available].sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0, 8),
    },
    {
      key: "cheap",
      label: "Günstigste",
      href: "/fahrzeuge?sort=price-asc",
      cars: [...available].filter((c) => c.price > 0).sort((a, b) => a.price - b.price).slice(0, 8),
    },
    {
      key: "auto",
      label: "Automatik",
      href: "/fahrzeuge?gearbox=AUTOMATIC_GEAR",
      cars: available.filter((c) => c.gearbox === "AUTOMATIC_GEAR").slice(0, 8),
    },
  ];

  const searchData = cars.map(({ brand, price, year, fuel }) => ({ brand, price, year, fuel }));
  const rating = { rating: reviews.rating, count: reviews.count };

  return (
    <>
      <HeroSectionWithSearch cars={searchData} rating={rating} slides={heroSlides} />

      <BrandStrip cars={cars} />

      <FeaturedCarsSlider tabs={tabs} total={cars.length} />

      <Features rating={rating} image={aboutImage} />

      <Suspense fallback={<GoogleReviewsSkeleton />}>
        <GoogleReviews />
      </Suspense>

      <HowItWorks />
    </>
  );
}
