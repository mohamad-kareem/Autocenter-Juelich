import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "Mein Profil",
  robots: { index: false, follow: false },
};

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect("/login");

  return (
    <ProfileClient
      initialUser={{
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
      }}
    />
  );
}
