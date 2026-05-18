import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import AuthSessionProvider from "./providers/SessionProvider";
// import { MixpanelProvider } from "@/components/MixpanelProvider"; // Desabilitado temporariamente
// import { CrispProvider } from "@/components/CrispProvider"; // Desabilitado temporariamente

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://photorestorenow.com'),
  title: {
    default: "PhotoRestoreNow – Restore Old Photos with AI | Starting at $17.99",
    template: "%s | PhotoRestoreNow",
  },
  description: "Turn faded, damaged, or torn old photos into beautiful memories. AI-powered restoration in 24 hours. 100% satisfaction guarantee. Starting at $17.99.",
  keywords: ["photo restoration", "restore old photos", "old photo repair", "AI photo restoration", "vintage photo repair", "damaged photo fix", "colorize old photos", "photo enhancement"],
  authors: [{ name: "PhotoRestoreNow" }],
  creator: "PhotoRestoreNow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://photorestorenow.com",
    siteName: "PhotoRestoreNow",
    title: "Restore Old Photos with AI – Starting at $17.99",
    description: "Turn faded, damaged, or torn old photos into beautiful memories. AI-powered restoration in 24 hours. 100% satisfaction guarantee.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PhotoRestoreNow – AI Photo Restoration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Restore Old Photos with AI – Starting at $17.99",
    description: "Turn faded, damaged, or torn old photos into beautiful memories. AI-powered restoration in 24 hours.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://photorestorenow.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'PhotoRestoreNow',
    description: 'AI-powered photo restoration service. Repair old, faded, torn, or damaged photographs in 24 hours.',
    url: 'https://photorestorenow.com',
    provider: {
      '@type': 'Organization',
      name: 'PhotoRestoreNow',
      url: 'https://photorestorenow.com',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '17.99',
      priceSpecification: {
        '@type': 'PriceSpecification',
        price: '17.99',
        priceCurrency: 'USD',
        description: 'Starting price for 1 photo restoration',
      },
    },
    serviceType: 'Photo Restoration',
    areaServed: 'US',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photo Restoration Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Photo Restoration' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Photo Colorization' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Restoration + Colorization' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Deep Restoration' } },
      ],
    },
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthSessionProvider>
          {/* <MixpanelProvider> */}
            <CartProvider>
              {children}
              <Toaster />
              {/* <CrispProvider /> */}
            </CartProvider>
          {/* </MixpanelProvider> */}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
