import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthProvider } from '@/components/auth/auth-provider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GameTopUp - Instant Game Top-ups & Gift Cards',
  description: 'Your trusted gaming platform for instant top-ups and gift cards. Fast, secure, and reliable digital game currency delivery.',
  keywords: 'game top-up, gift cards, PUBG Mobile, Free Fire, Call of Duty Mobile, Google Play, Amazon',
  authors: [{ name: 'GameTopUp Team' }],
  openGraph: {
    title: 'GameTopUp - Instant Game Top-ups & Gift Cards',
    description: 'Your trusted gaming platform for instant top-ups and gift cards.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameTopUp - Instant Game Top-ups & Gift Cards',
    description: 'Your trusted gaming platform for instant top-ups and gift cards.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06b6d4',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-gaming-dark text-foreground antialiased">
        <div className="relative flex min-h-screen flex-col">
          <AuthProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
