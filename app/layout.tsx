import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NAMAN's MEDIA SERVER",
    template: "%s | NAMAN's MEDIA SERVER"
  },
  description: "A self-hosted local network streaming interface with TMDB metadata and modular iframe providers.",
  applicationName: "NAMAN's MEDIA SERVER"
};

export const viewport: Viewport = {
  themeColor: "#050609",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
