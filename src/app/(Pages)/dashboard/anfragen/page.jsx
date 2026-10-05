import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AnfragenClient from "./AnfragenClient";

export const metadata = {
  title: "Anfragen",
  robots: { index: false, follow: false },
};

export default async function AnfragenPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return <AnfragenClient />;
}
