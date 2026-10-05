import "./globals.css";
import localFont from "next/font/local";
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";
import CookieBanner from "@/app/(components)/CookieBanner";
import ChatWidget from "@/app/(components)/ChatWidget";
import PublicOnly from "@/app/(components)/PublicOnly";
import { SITE } from "@/lib/site";

// Inter (SIL Open Font License) – self-hosted, no requests to Google Fonts (DSGVO-friendly)
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
});

// Cormorant Garamond (SIL Open Font License) – elegant book serif for headlines
const displaySerif = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  display: "swap",
  variable: "--font-display-serif",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Autocenter Jülich – Geprüfte Gebrauchtwagen, Finanzierung & Garantie",
    template: "%s | Autocenter Jülich",
  },
  description:
    "Autocenter Jülich: geprüfte Gebrauchtwagen, flexible Finanzierung und CarGarantie®. Besuchen Sie uns in der Rudolf-Diesel-Straße 5, 52428 Jülich.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE.name,
    images: ["/center.jpg"],
  },
};

export const viewport = {
  themeColor: "#0b1b33",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phoneIntl,
  email: SITE.email,
  image: `${SITE.url}/center.jpg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.street,
    postalCode: SITE.zip,
    addressLocality: SITE.city,
    addressCountry: "DE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:30",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:30",
      closes: "15:00",
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${inter.variable} ${displaySerif.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <PublicOnly>
          <Navbar />
        </PublicOnly>
        <main className="min-h-[60vh]">{children}</main>
        <PublicOnly>
          <Footer />
          <ChatWidget />
          <CookieBanner />
        </PublicOnly>
      </body>
    </html>
  );
}
