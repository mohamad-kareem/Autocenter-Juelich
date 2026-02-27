// lib/mobilede.js
const BASE_URL = "https://services.mobile.de";

function getAuthHeader() {
  const user = process.env.MOBILEDE_USERNAME;
  const pass = process.env.MOBILEDE_PASSWORD;

  if (!user || !pass) {
    throw new Error("Missing MOBILEDE_USERNAME or MOBILEDE_PASSWORD in env.");
  }

  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

function getSellerId() {
  const sellerId = process.env.MOBILEDE_SELLER_ID;
  if (!sellerId) throw new Error("Missing MOBILEDE_SELLER_ID in env.");
  return sellerId;
}

/**
 * Fetch all ads for the seller.
 * NOTE: This can be a lot. For production you may want pagination if supported by your account/endpoints.
 */
export async function fetchSellerAds() {
  const sellerId = getSellerId();

  const res = await fetch(`${BASE_URL}/seller-api/sellers/${sellerId}/ads`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/vnd.de.mobile.api+json",
    },
    // change caching to your preference:
    // - "no-store" for always fresh
    // - or revalidate for better performance
    cache: "no-store",
    // next: { revalidate: 60 }, // alternative: cache 60s
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `mobile.de ads fetch failed: ${res.status} ${res.statusText} ${txt}`.slice(
        0,
        600,
      ),
    );
  }

  const data = await res.json();
  console.log(
    "MOBILE.DE ADS RESPONSE (first 2):",
    JSON.stringify({ ...data, ads: (data?.ads || []).slice(0, 2) }, null, 2),
  );
  return Array.isArray(data?.ads) ? data.ads : [];
}

export async function fetchSingleAd(mobileAdId) {
  const sellerId = getSellerId();

  const res = await fetch(
    `${BASE_URL}/seller-api/sellers/${sellerId}/ads/${encodeURIComponent(
      mobileAdId,
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
        Accept: "application/vnd.de.mobile.api+json",
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `mobile.de ad fetch failed: ${res.status} ${res.statusText} ${txt}`.slice(
        0,
        600,
      ),
    );
  }

  return await res.json();
}

/**
 * Map mobile.de ad -> your UI model
 * (Adjust fields if your account returns slightly different shapes)
 */
export function mapAdToUiCar(ad) {
  const make = ad?.make || "";
  const model = ad?.model || "";
  const modelDescription = ad?.modelDescription || "";
  const title = [make, model, modelDescription]
    .filter(Boolean)
    .join(" ")
    .trim();

  // power is in kW in Seller API (docs). Your UI shows "PS".
  const powerKw = Number(ad?.power || 0);
  const powerPs = powerKw ? Math.round(powerKw * 1.35962) : null;

  const images = Array.isArray(ad?.images)
    ? ad.images
        .map((i) => i?.ref)
        .filter(Boolean)
        // optional: force a usable size rule
        .map((ref) => {
          // keep as-is; many refs already include ?rule=mo-640.jpg etc.
          return ref;
        })
    : [];

  const price =
    ad?.price?.consumerPriceGross ??
    ad?.price?.dealerPriceGross ??
    ad?.price?.consumerPriceNet ??
    ad?.price?.dealerPriceNet ??
    null;

  return {
    id: String(ad?.mobileAdId),
    title: title || `Anzeige ${ad?.mobileAdId}`,
    price: price ? Number(String(price).replace(",", ".")) : 0,
    year: ad?.firstRegistration
      ? String(ad.firstRegistration).slice(0, 4)
      : null, // yyyyMM -> yyyy
    km: typeof ad?.mileage === "number" ? ad.mileage : null,
    fuel: ad?.fuel || null,
    gearbox: ad?.gearbox || null,
    power: powerPs,
    location: "Jülich", // mobile API can have seller location; keep your branding or extend later
    images: images.length ? images : ["/placeholder-car.jpg"],
    isSold: Boolean(ad?.reserved) === true ? true : false, // adjust if you have a real "sold" flag elsewhere
    raw: ad,
  };
}
