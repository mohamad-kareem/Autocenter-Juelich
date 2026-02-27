import "./globals.css";
import Navbar from "@/app/(components)/Navbar";
import Footer from "@/app/(components)/Footer";

export const metadata = {
  title: "AutoCenter Jülich",
  description: "AutoCenter Jülich – Finanzierung, Garantie und Kontakt.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className="min-h-screen ac-page">
        <Navbar />
        <main className="min-h-[calc(100vh-180px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
