import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import VisitorLog from "@/app/models/VisitorLog";
import { verifyToken } from "@/lib/auth";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function SecretVisitorsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  await dbConnect();

  const logs = await VisitorLog.find({})
    .sort({ visitedAt: -1 })
    .limit(200)
    .lean();

  return (
    <div className="min-h-screen ac-page px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
          <h1 className="text-3xl font-bold">Besucherübersicht</h1>
          <p className="mt-2 text-sm text-white/70">
            Versteckte Seite mit allen Besuchern der Website.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-white/10 text-left">
                <tr>
                  <th className="px-4 py-3">Zeit</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Seite</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-6 text-center text-white/60"
                    >
                      Keine Besucherdaten gefunden.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={String(log._id)}
                      className="border-t border-white/10"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(log.visitedAt)}
                      </td>
                      <td className="px-4 py-3">{log.visitorName || "Gast"}</td>
                      <td className="px-4 py-3">{log.page || "/"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
