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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
