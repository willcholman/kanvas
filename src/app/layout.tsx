import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MotionConfig } from "motion/react";
import { SITE } from "@/content/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WaitlistProvider } from "@/components/waitlist/WaitlistProvider";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter-tight",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s | Kanvas" },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={interTight.variable}>
      <body className="min-h-svh overflow-x-clip">
        <MotionConfig reducedMotion="user">
          <WaitlistProvider>
            <a
              href="#main"
              className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-full bg-ink px-4 py-2 text-[14px] text-white focus-visible:translate-y-0"
            >
              Skip to content
            </a>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </WaitlistProvider>
        </MotionConfig>
        <Analytics />
      </body>
    </html>
  );
}
