import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import AnkaufClient from "./AnkaufClient";

export const metadata = {
  title: "Ankauf",
  robots: { index: false, follow: false },
};

export default async function AnkaufPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user) redirect("/login");

  return (
    <Suspense fallback={null}>
      <AnkaufClient canDelete={user.role === "admin"} />
    </Suspense>
  );
}
