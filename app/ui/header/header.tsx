"use client"

import Link from "next/link"
import { Menu, X, ChevronDown, Map, Sparkles } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "../utils/button"
import ClerkInit from "./clerk-init"
import { MobileSitemapMenu, SitemapMenuContent } from "./sitemap-menu"
import { ProfileMenu } from "./profile-menu"
import styles from "./header.module.css"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sitemapMenuOpen, setSitemapMenuOpen] = useState(false)
  const sitemapMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Prevent forced reflow by checking event.target directly
      const target = event.target as Node
      if (sitemapMenuRef.current) {
        // Use a flag instead of querying DOM properties
        if (!sitemapMenuRef.current.contains(target)) {
          setSitemapMenuOpen(false)
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSitemapMenuOpen(false)
      }
    }

    // Use capture phase for better performance
    document.addEventListener("mousedown", handleClickOutside, true)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="relative">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="infusio">Infusio</span>
            </Link>
            <Link
              href="/help"
              aria-label="Centro de ayuda"
              title="Centro de ayuda"
              className="btn btn-outline btn-icon-sm rounded-full border-foreground/20 hover:bg-secondary"
            >
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative flex items-center gap-2" ref={sitemapMenuRef}>
              <ProfileMenu />
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
            id="mobile-menu-button"
            aria-label="Mobile Menu Button"
            className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        <div
          className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="grid grid-cols-1 gap-3">
            <ProfileMenu />
            <MobileSitemapMenu sitemapMenuOpen={sitemapMenuOpen} setSitemapMenuOpen={setSitemapMenuOpen} />
          </div>
          <ClerkInit />
        </div>
      </div>
    </header>
  )
}