import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import CartHydration from "@/providers/CartHydration";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Velora — Thoughtfully Chosen Essentials",
  description:
    "Discover thoughtfully designed essentials at Velora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body>
      <QueryProvider>
        <AuthProvider>
          <CartHydration />
          {children}
        </AuthProvider>
      </QueryProvider>
    </body>
    </html>
  );
}