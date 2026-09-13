import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, Martian_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./agency.css";
import { NavBar } from "@/components/site/NavBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { site } from "@/lib/site";
import { assetPath } from "@/lib/asset-path";

// Type stack from the Lovable build. Bricolage carries the oversized display
// headlines, DM Sans everything readable. Martian Mono is the one addition:
// the site has a lot of small uppercase labels and mono is what makes them
// read as designed rather than as small body text.
const display = Bricolage_Grotesque({
  variable: "--f-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sans = DM_Sans({
  variable: "--f-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const mono = Martian_Mono({
  variable: "--f-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

// The real wordmark face. Supplied directly as a file rather than sourced
// from a fonts-aggregator site, since "Demo" cuts of commercial typefaces
// are typically personal-use-only and this is a commercial site.
const logo = localFont({
  src: "../fonts/LastbornDemoRegular.ttf",
  variable: "--f-logo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  alternates: { canonical: site.url },
  icons: {
    icon: { url: assetPath("/icon.png"), type: "image/png", sizes: "32x32" },
    apple: { url: assetPath("/apple-icon.png"), type: "image/png", sizes: "180x180" },
  },
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0d11",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${logo.variable}`}
    >
      <body>
        <div className="grain min-h-screen">
          <SmoothScroll />
          <NavBar />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
