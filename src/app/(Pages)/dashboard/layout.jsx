import { cookies } from "next/headers";
import DashboardNav from "@/app/(components)/DashboardNav";
import UserMenu from "@/app/(components)/UserMenu";
import { verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ContactMessage from "@/app/models/ContactMessage";

export const metadata = {
  title: "Mitarbeiterbereich",
  robots: { index: false, follow: false },
};

/** Unread badge – never blocks the page if the database is slow or offline. */
async function countUnread() {
  const timeout = new Promise((resolve) => setTimeout(() => resolve(0), 2000));
  const query = (async () => {
    await dbConnect();
    return ContactMessage.countDocuments({ read: false }).maxTimeMS(1500);
  })().catch(() => 0);
  return (await Promise.race([query, timeout])) ?? 0;
}

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const role = user?.role === "admin" ? "admin" : "user";
  const unread = user ? await countUnread() : 0;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="dash-main">
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            {/* renders the fixed sidebar, the mobile button and the drawer */}
            <DashboardNav
              role={role}
              badges={{ unread }}
              user={user ? { name: user.name, role: user.role } : null}
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Händlerportal</p>
            <div className="ml-auto">
              {user ? (
                <UserMenu
                  user={{ name: user.name, email: user.email, role: user.role }}
                  variant="light"
                  showWebsiteLink={false}
                />
              ) : null}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
