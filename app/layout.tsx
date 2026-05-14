import type { Metadata } from 'next'
import { Header } from './ui/header/header'
import { Footer } from './ui/footer'
import { Inter, Playfair_Display } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import './ui/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { syncUserFromClerk } from './lib/actions'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let user: Awaited<ReturnType<typeof currentUser>> = null

  try {
    user = await currentUser()
  } catch (error) {
    console.error('Clerk currentUser failed in layout:', error)
  }

  if (user) {
    try {
      await syncUserFromClerk({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses.map((email) => ({
          emailAddress: email.emailAddress,
        })),
        publicMetadata: user.publicMetadata as { roles?: unknown } | undefined,
      })
    } catch (error) {
      console.error('Error syncing user from layout:', error)
    }
  }

  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen flex flex-col overflow-x-hidden">
        <ClerkProvider>
          <Header />
          <main className="flex-1 min-h-0 flex flex-col">
            {children}
          </main>
          {/* {process.env.NODE_ENV === 'production' && <Analytics />} */}
          {process.env.NODE_ENV === 'production'}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  )
}
