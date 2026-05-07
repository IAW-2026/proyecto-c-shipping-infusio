"use client"

import Link from "next/link"
import { Package, User, Menu, X, ChevronDown, Map } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "./button"
import ClerkInit from "./clerk-init"

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

  function SitemapMenuContent() {
    if (!sitemapMenuOpen) return null

    return (
      <div
        className="absolute z-50 mt-4 right-0 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
        role="menu"
      >
        <div className="px-4 pt-6 pb-4 space-y-4">
          {/* Cuenta Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Cuenta</h3>
            <div className="space-y-1">
              <Link
                href="/user-profile"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-primary shrink-0" />
                <span>Mi Perfil</span>
              </Link>
              <Link
                href="/"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span>Mis Envíos</span>
              </Link>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Rastreo Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Rastreo</h3>
            <div className="space-y-1">
              <Link
                href="/viewer-refactor/tracking"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span>Buscar Envío</span>
              </Link>
              <Link
                href="/viewer-refactor/subscription"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span>Suscripción a Eventos</span>
              </Link>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Soporte Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Soporte</h3>
            <div className="space-y-1">
              <Link
                href="/help"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-primary shrink-0" />
                <span>Centro de Ayuda</span>
              </Link>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Información Legal Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Legal</h3>
            <div className="space-y-1">
              <Link
                href="/privacy"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-primary shrink-0" />
                <span>Privacidad</span>
              </Link>
              <Link
                href="/terms"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 text-primary shrink-0" />
                <span>Términos de Servicio</span>
              </Link>
              <Link
                href="/shipping-policies"
                onClick={() => setSitemapMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span>Políticas de Envío</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <SitemapMenuContent />
            <ClerkInit />
          </div>
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
          <div className="relative" ref={sitemapMenuRef}>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start rounded-full border-foreground/20 hover:bg-secondary"
              onClick={() => setSitemapMenuOpen((value) => !value)}
              aria-haspopup="menu"
              aria-expanded={sitemapMenuOpen}
            >
              <Map className="h-4 w-4 mr-2" />
              Mapa del Sitio
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${sitemapMenuOpen ? "rotate-180" : ""}`} />
            </Button>
            {sitemapMenuOpen && (
              <div className="mt-4 space-y-4 pl-4 border-t border-border pt-4">
                {/* Cuenta Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Cuenta</h3>
                  <div className="space-y-1">
                    <Link
                      href="/user-profile"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span>Mis Envíos</span>
                    </Link>
                  </div>
                </div>

                {/* Rastreo Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Rastreo</h3>
                  <div className="space-y-1">
                    <Link
                      href="/viewer-refactor/tracking"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span>Buscar Envío</span>
                    </Link>
                    <Link
                      href="/viewer-refactor/subscription"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span>Suscripción a Eventos</span>
                    </Link>
                  </div>
                </div>

                {/* Soporte Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Soporte</h3>
                  <div className="space-y-1">
                    <Link
                      href="/help"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Centro de Ayuda</span>
                    </Link>
                  </div>
                </div>

                {/* Información Legal Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">Legal</h3>
                  <div className="space-y-1">
                    <Link
                      href="/privacy"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Privacidad</span>
                    </Link>
                    <Link
                      href="/terms"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      <span>Términos de Servicio</span>
                    </Link>
                    <Link
                      href="/shipping-policies"
                      onClick={() => setSitemapMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span>Políticas de Envío</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <UserButton />
          </div>
        </div>
      )}
    </header>
  )
}
