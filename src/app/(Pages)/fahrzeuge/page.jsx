// app/fahrzeuge/page.jsx
import { fetchSellerAds, mapAdToUiCar } from "@/lib/mobilede";
import FahrzeugeClient from "./FahrzeugeClient";

export default async function FahrzeugePage() {
  const ads = await fetchSellerAds();
  const cars = ads.map(mapAdToUiCar);

  return (
    <div className="ac-page">
      <FahrzeugeClient initialCars={cars} />
    </div>
  );
}
