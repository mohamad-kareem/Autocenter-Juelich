import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import StempeluhrClient from "./StempeluhrClient";

export default async function StempeluhrPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect("/login");
  }

  return <StempeluhrClient user={user} />;
}
