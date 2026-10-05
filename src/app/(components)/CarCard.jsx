import Image from "next/image";
import Link from "next/link";
import { Camera, ShieldCheck } from "lucide-react";
import { formatKm, formatPrice, fuelLabel, gearboxLabel, isRemoteImage } from "@/lib/cars";

const cx = (...c) => c.filter(Boolean).join(" ");

/**
 * Compact vehicle card (grid or list).
 * @param {{ car: ReturnType<import("@/lib/cars").toCardCar>, layout?: "grid"|"list", priority?: boolean, className?: string }} props
 */
export default function CarCard({ car, layout = "grid", priority = false, className = "" }) {
  const isList = layout === "list";
  const reg = car.firstRegistration ? `EZ ${car.firstRegistration}` : car.year ? `EZ ${car.year}` : null;
  const facts = [
    reg,
    car.km != null ? formatKm(car.km) : null,
    car.power ? `${car.power} PS` : null,
    fuelLabel(car.fuel),
    gearboxLabel(car.gearbox),
  ].filter(Boolean);

  return (
    <Link
      href={`/fahrzeuge/${car.id}`}
      className={cx(
        "group flex overflow-hidden rounded-lg border border-line bg-white transition hover:border-line-strong hover:shadow-card-hover",
        isList ? "flex-row" : "flex-col",
        className,
      )}
    >
      <div
        className={cx(
          "relative shrink-0 overflow-hidden bg-canvas",
          isList ? "w-36 sm:w-60" : "aspect-[4/3] w-full",
        )}
      >
        <Image
          src={car.image}
          alt={car.title}
          fill
          priority={priority}
          unoptimized={isRemoteImage(car.image)}
          className="object-cover"
          sizes={isList ? "240px" : "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 290px"}
        />
        {car.reserved ? (
          <span className="chip absolute left-2 top-2 bg-amber-400 text-amber-950">Reserviert</span>
        ) : null}
        {car.imageCount > 1 ? (
          <span className="chip absolute bottom-2 right-2 bg-black/60 font-medium text-white">
            <Camera className="h-3 w-3" />
            {car.imageCount}
          </span>
        ) : null}
      </div>

      <div className={cx("flex min-w-0 flex-1 flex-col p-3", isList && "sm:p-4")}>
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink group-hover:text-brand-700 sm:line-clamp-1 sm:text-sm">
          {car.title}
        </h3>
        <p className={cx("mt-1 text-xs leading-[1.1rem] text-muted", isList ? "line-clamp-3" : "line-clamp-2")}>
          {facts.join(" · ")}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-base font-bold text-ink">{formatPrice(car.price)}</span>
          {car.warranty ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700">
              <ShieldCheck className="h-3 w-3" />
              Garantie
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
