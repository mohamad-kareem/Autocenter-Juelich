// Central business information – used by navbar, footer, contact page,
// structured data and the AI chat assistant. Update here once.

export const SITE = {
  legalOwner: "Jibrail Alawie",
  tagline: "Geprüfte Gebrauchtwagen in Jülich",
  url: "https://www.autocenter-juelich.de",

  phoneDisplay: "02461 9163780",
  phoneIntl: "+49 2461 9163780",
  phoneHref: "tel:+4924619163780",
  email: "info@autocenter-juelich.de",

  street: "Rudolf-Diesel-Straße 5",
  zip: "52428",
  city: "Jülich",
  country: "Deutschland",

  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Autocenter+J%C3%BClich+Rudolf-Diesel-Stra%C3%9Fe+5+52428+J%C3%BClich",
  mapsEmbed:
    "https://www.google.com/maps?q=Autocenter%20J%C3%BClich%2C%20Rudolf-Diesel-Stra%C3%9Fe%205%2C%2052428%20J%C3%BClich&output=embed",

  // 0 = Sunday … 6 = Saturday. Times in Europe/Berlin.
  openingHours: [
    { days: "Montag – Freitag", short: "Mo–Fr", time: "09:30 – 18:00 Uhr" },
    { days: "Samstag", short: "Sa", time: "09:30 – 15:00 Uhr" },
    { days: "Sonntag", short: "So", time: "Nach telefonischer Absprache" },
  ],
  openingSchedule: {
    0: null,
    1: ["09:30", "18:00"],
    2: ["09:30", "18:00"],
    3: ["09:30", "18:00"],
    4: ["09:30", "18:00"],
    5: ["09:30", "18:00"],
    6: ["09:30", "15:00"],
  },

  // Fallback values shown when the Google Places API is not configured.
  googleRatingFallback: { rating: 5.0, count: 14 },
};

export const fullAddress = `${SITE.street}, ${SITE.zip} ${SITE.city}`;

const DAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

/** Returns { open, label } for the current moment in Europe/Berlin. */
export function getOpeningStatus(date = new Date()) {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (t) => parts.find((p) => p.type === t)?.value;
  const wdMap = { So: 0, Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6 };
  const day = wdMap[String(get("weekday")).replace(".", "")] ?? date.getDay();
  const minutesNow = Number(get("hour")) * 60 + Number(get("minute"));

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const today = SITE.openingSchedule[day];
  if (today) {
    const [from, to] = today.map(toMin);
    if (minutesNow >= from && minutesNow < to) {
      return { open: true, label: `Jetzt geöffnet · bis ${today[1]} Uhr` };
    }
    if (minutesNow < from) {
      return { open: false, label: `Geschlossen · öffnet ${today[0]} Uhr` };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const slot = SITE.openingSchedule[d];
    if (slot) {
      const when = i === 1 ? "morgen" : DAY_NAMES[d];
      return {
        open: false,
        label: `Geschlossen · öffnet ${when} ${slot[0]} Uhr`,
      };
    }
  }

  return { open: false, label: "Geschlossen" };
}
