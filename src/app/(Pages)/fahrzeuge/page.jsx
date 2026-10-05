import { Suspense } from "react";
import { getCarsSafe } from "@/lib/mobilede";
import { toCardCar } from "@/lib/cars";
import FahrzeugeClient from "./FahrzeugeClient";

export const metadata = {
  title: "Gebrauchtwagen kaufen in Jülich",
  description:
    "Alle aktuellen Gebrauchtwagen von Autocenter Jülich – mit Filtern nach Marke, Preis, Baujahr, Kraftstoff und Getriebe.",
};

export default async function FahrzeugePage() {
  const cars = (await getCarsSafe()).map(toCardCar);

  return (
    <Suspense fallback={<div className="container-ac py-20 text-center text-muted">Fahrzeuge werden geladen …</div>}>
      <FahrzeugeClient initialCars={cars} />
    </Suspense>
  );
}
