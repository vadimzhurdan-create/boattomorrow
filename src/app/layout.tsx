import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'BOATTOMORROW - Yacht Charter, Boats & Sailing Education',
    template: '%s | BOATTOMORROW',
  },
  description: 'Discover sailing destinations, yacht reviews, and sailing courses. Your gateway to the yachting world.',
  openGraph: {
    type: 'website',
    siteName: 'BOATTOMORROW',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
