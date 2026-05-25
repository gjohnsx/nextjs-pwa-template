import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  BIZ_UDPGothic,
  DotGothic16,
  Shippori_Mincho,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const zineSerif = Shippori_Mincho({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zine-serif",
});

const zineGothic = BIZ_UDPGothic({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zine-gothic",
});

const zinePixel = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zine-pixel",
});

export const metadata: Metadata = {
  title: {
    default: "Yen Sense",
    template: "%s | Yen Sense",
  },
  description:
    "A fast Japan travel PWA for converting yen to USD and practicing mental exchange-rate estimates.",
  applicationName: "Yen Sense",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon-192x192.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Yen Sense",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f0e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zineSerif.variable} ${zineGothic.variable} ${zinePixel.variable} antialiased`}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
