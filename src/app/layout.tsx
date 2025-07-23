import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title: "קהילת משרתי המילואים של חטיבה 55",
  description: "פלטפורמה לחיבור בין אנשי מקצוע, עסקים, משרות והזדמנויות בין אנשי המילואים של החטיבה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
