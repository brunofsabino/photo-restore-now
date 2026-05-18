import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Choose Your Restoration Service',
  description: 'Select from photo restoration, colorization, or deep restoration for severely damaged photos. AI results in 24 hours.',
  alternates: {
    canonical: 'https://photorestorenow.com/select-service',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function SelectServiceLayout({ children }: { children: React.ReactNode }) {
  return children
}
