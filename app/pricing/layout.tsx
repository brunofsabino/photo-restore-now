import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing – Photo Restoration Plans',
  description: 'Choose your photo restoration package. Restore 1, 3, or 5 photos starting at $17.99. AI-powered results in 24 hours with 100% satisfaction guarantee.',
  alternates: {
    canonical: 'https://photorestorenow.com/pricing',
  },
  openGraph: {
    title: 'Photo Restoration Pricing – Starting at $17.99',
    description: 'AI photo restoration in 24 hours. Repair, colorize, or deeply restore damaged old photos. 100% satisfaction guarantee.',
    url: 'https://photorestorenow.com/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
