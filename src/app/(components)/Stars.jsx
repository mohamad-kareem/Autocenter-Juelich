import { Star } from "lucide-react";

export default function Stars({ value = 5, size = "h-4 w-4", className = "" }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} von 5 Sternen`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${size} ${i < full ? "fill-star text-star" : "fill-line text-line"}`}
          aria-hidden
        />
      ))}
    </span>
  );
}
