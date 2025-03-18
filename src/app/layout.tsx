import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/providers/client-providers";

export const metadata: Metadata = {
  title: "LawnSync",
  description: "AI-driven lawn care management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
