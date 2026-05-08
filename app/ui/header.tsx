"use client"

import Link from "next/link"
import { User, Menu, X, ChevronDown, Map } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "./button"
import ClerkInit from "./clerk-init"
import { MobileSitemapMenu, SitemapMenuContent } from "./sitemap-menu"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sitemapMenuOpen, setSitemapMenuOpen] = useState(false)
  const sitemapMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sitemapMenuRef.current && !sitemapMenuRef.current.contains(event.target as Node)) {
        setSitemapMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSitemapMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="infusio">Infusio</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative" ref={sitemapMenuRef}>
            <Button
              variant="default"
              size="sm"
              className="rounded-full mr-2"
            >
              <User className="h-4 w-4 mr-2" />
              Mi perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-foreground/20 hover:bg-secondary"
              onClick={() => setSitemapMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={sitemapMenuOpen}
            >
              <Map className="h-4 w-4 mr-2" />
              Mapa del Sitio
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${sitemapMenuOpen ? "rotate-180" : ""}`} />
            </Button>
            <SitemapMenuContent sitemapMenuOpen={sitemapMenuOpen} setSitemapMenuOpen={setSitemapMenuOpen} />
          </div>
          <ClerkInit />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/user-profile"
              className="btn btn-default btn-sm w-full justify-center rounded-full"
            >
              <User className="h-4 w-4 mr-2" />
              Mi perfil
            </Link>
            <MobileSitemapMenu sitemapMenuOpen={sitemapMenuOpen} setSitemapMenuOpen={setSitemapMenuOpen} />
          </div>
          <ClerkInit />
        </div>
      )}
    </header>
  )
}
