import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout";

export const metadata: Metadata = {
  title: "קהילה | פלטפורמת הקהילה העברית",
  description: "פלטפורמה לחיבור בין אנשי מקצוע, עסקים, משרות והזדמנויות בקהילה",
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
