import type { Metadata } from 'next'
import { Header } from '@/app/ui/header'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import './ui/globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: 'Infusio | Seguimiento de Envíos',
  description: 'Rastrea tus pedidos de infusiones y accesorios premium',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable} bg-background`}>
      <body className="font-sans antialiased">
        <Header />
        {children}
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
        {process.env.NODE_ENV === 'production'}
      </body>
    </html>
  )
}
