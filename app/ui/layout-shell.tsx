"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header/header"
import { Footer } from "./footer"
import { ClerkSync } from "./clerk-sync"

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEmbedRoute = pathname?.startsWith("/tracking/embed")

  if (isEmbedRoute) {
    return <>{children}</>
  }

  return (
    <>
      <ClerkSync />
      <Header />
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      <Footer />
    </>
  )
}
