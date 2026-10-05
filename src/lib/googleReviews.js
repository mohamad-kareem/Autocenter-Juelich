// Google reviews via the official Google Places API (New).
//
// Env:
//   GOOGLE_PLACES_API_KEY  – required (Google Cloud key with "Places API (New)" enabled)
//   GOOGLE_PLACE_ID        – optional; if missing the place is looked up once by name/address
//
// Results are cached by Next.js for 12 hours, so the API is only called a few
// times per day (well inside Google's free monthly usage).

import { unstable_rethrow } from "next/navigation";
import { SITE } from "@/lib/site";

const REVALIDATE_SECONDS = 60 * 60 * 12;
const SEARCH_QUERY = `${SITE.name}, ${SITE.street}, ${SITE.zip} ${SITE.city}`;

async function resolvePlaceId(apiKey) {
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID;

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      // IDs only – this lookup is free of charge
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY, languageCode: "de", regionCode: "DE" }),
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!res.ok) {
    throw new Error(`Places text search failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 400));
  }

  const data = await res.json();
  return data?.places?.[0]?.id || null;
}

/**
 * @returns {Promise<{
 *   configured: boolean,
 *   rating: number|null,
 *   count: number|null,
 *   mapsUrl: string,
 *   writeReviewUrl: string|null,
 *   reviews: Array<{ id: string, author: string, authorUrl: string|null, photo: string|null,
 *                    rating: number, text: string, relativeTime: string, publishTime: string|null, url: string|null }>
 * }>}
 */
export async function getGoogleReviews() {
  const fallback = {
    configured: false,
    rating: SITE.googleRatingFallback.rating,
    count: SITE.googleRatingFallback.count,
    mapsUrl: SITE.mapsLink,
    writeReviewUrl: null,
    reviews: [],
  };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return fallback;

  try {
    const placeId = await resolvePlaceId(apiKey);
    if (!placeId) return fallback;

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de&regionCode=DE`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );

    if (!res.ok) {
      throw new Error(`Place details failed: ${res.status} ${await res.text().catch(() => "")}`.slice(0, 400));
    }

    const place = await res.json();

    const reviews = (Array.isArray(place.reviews) ? place.reviews : [])
      .map((r, i) => ({
        id: r.name || String(i),
        author: r.authorAttribution?.displayName || "Google-Nutzer",
        authorUrl: r.authorAttribution?.uri || null,
        photo: r.authorAttribution?.photoUri || null,
        rating: Number(r.rating || 0),
        text: r.text?.text || r.originalText?.text || "",
        relativeTime: r.relativePublishTimeDescription || "",
        publishTime: r.publishTime || null,
        url: r.googleMapsUri || null,
      }))
      .filter((r) => r.rating > 0);

    return {
      configured: true,
      rating: typeof place.rating === "number" ? place.rating : fallback.rating,
      count: typeof place.userRatingCount === "number" ? place.userRatingCount : fallback.count,
      mapsUrl: place.googleMapsUri || SITE.mapsLink,
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.id || placeId)}`,
      reviews,
    };
  } catch (err) {
    unstable_rethrow(err);
    console.error("GOOGLE_REVIEWS_ERROR:", err?.message || err);
    return fallback;
  }
}
