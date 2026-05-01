import type { Metadata } from 'next'
import { Header } from '@/app/ui/header'
import { Inter, Playfair_Display } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import './ui/globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang="es" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased">
        <Header />
        {children}
        {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
        {process.env.NODE_ENV === 'production'}
      </body>
    </html>
  )
}
