import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE, DEFAULT_OG_IMAGE } from "@/config/site.config";

/**
 * RULE 29: Metadata engine — OG, Twitter, canonical.
 * RULE 25: Self-referencing canonical on every page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    locale: "bn_BD",
    type: "website",
    images: DEFAULT_OG_IMAGE ? [DEFAULT_OG_IMAGE] : undefined,
  },
  twitter: {
    card: DEFAULT_OG_IMAGE ? "summary_large_image" : "summary",
    images: DEFAULT_OG_IMAGE ? [DEFAULT_OG_IMAGE.url] : undefined,
  },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed", title: "BAYA Blog RSS Feed" }],
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.maateen.me" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.maateen.me/solaiman-lipi/font.css" />
        <link rel="alternate" type="application/rss+xml" title={`${SITE.name} RSS`} href="/feed" />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'SolaimanLipi', sans-serif" }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
