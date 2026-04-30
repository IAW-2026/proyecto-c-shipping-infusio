"use client"

import Link from "next/link"
import { Package, User, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/app/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="infusio">Infusio</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="uppernav-component">
            Mis Envíos
          </Link>
          <Link href="/" className="uppernav-component">
            Historial
          </Link>
          <Link href="/" className="uppernav-component">
            Direcciones
          </Link>
          <Link href="/" className="uppernav-component">
            Ayuda
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-full border-foreground/20 hover:bg-secondary">
            <User className="h-4 w-4 mr-2" />
            Cuenta
          </Button>
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Package className="h-4 w-4 mr-2" />
            Rastrear
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
          <Link href="/" className="uppernav-component">
            Mis Envíos
          </Link>
          <Link href="/" className="uppernav-component">
            Historial
          </Link>
          <Link href="/" className="uppernav-component">
            Direcciones
          </Link>
          <Link href="/" className="uppernav-component">
            Ayuda
          </Link>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" size="sm" className="rounded-full flex-1">
              <User className="h-4 w-4 mr-2" />
              Cuenta
            </Button>
            <Button size="sm" className="rounded-full flex-1 bg-primary text-primary-foreground">
              <Package className="h-4 w-4 mr-2" />
              Rastrear
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
