import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import ZeiterfassungClient from "./ZeiterfassungClient";

export default async function ZeiterfassungPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <ZeiterfassungClient />;
}
