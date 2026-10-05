import Image from "next/image";
import Link from "next/link";
import logoWhite from "../../../public/logo-autocenter.png";
import logoDark from "../../../public/logo-autocenter-dark.png";

/**
 * Brand logo.
 * tone="white" (default) for dark/navy backgrounds, tone="dark" for white backgrounds.
 */
export default function Logo({ className = "h-9 w-auto", href = "/", priority = false, tone = "white" }) {
  const img = (
    <Image
      src={tone === "dark" ? logoDark : logoWhite}
      alt="Autocenter Jülich"
      priority={priority}
      className={className}
      sizes="220px"
    />
  );

  if (!href) return img;

  return (
    <Link href={href} aria-label="Autocenter Jülich – Startseite" className="inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}
