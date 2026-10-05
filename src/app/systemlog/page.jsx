import { isMonitorSession } from "@/lib/monitor";
import MonitorClient from "./MonitorClient";
import MonitorLogin from "./MonitorLogin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Systemlog",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SystemlogPage() {
  const ok = await isMonitorSession();
  return ok ? <MonitorClient /> : <MonitorLogin />;
}
