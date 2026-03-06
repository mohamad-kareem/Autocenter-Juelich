import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  const cards = [
    {
      title: "Stempeluhr",
      description: "Ein- und Ausstempeln für Benutzer und Administratoren.",
      href: "/dashboard/stempeluhr",
      roles: ["user", "admin"],
    },
    {
      title: "Zeiterfassung",
      description: "Arbeitszeiten und Mitarbeiterdaten verwalten.",
      href: "/dashboard/zeiterfassung",
      roles: ["admin"],
    },
    {
      title: "Benutzer registrieren",
      description: "Neue Benutzer oder Administratoren anlegen.",
      href: "/dashboard/register",
      roles: ["admin"],
    },
  ];

  const visibleCards = cards.filter((card) => card.roles.includes(user.role));

  return (
    <div className="min-h-screen ac-page px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-3 text-white/70">
                Willkommen zurück, {user.name}
              </p>
              <p className="mt-1 text-white/60">
                Rolle: {user.role === "admin" ? "Administrator" : "Benutzer"}
              </p>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Abmelden
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-white/70">{card.description}</p>
              <div
                className="mt-5 inline-flex rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: "var(--ac-gradient-primary)" }}
              >
                Seite öffnen
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
