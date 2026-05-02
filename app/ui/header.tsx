"use client"

import Link from "next/link"
import { Package, User, Menu, X, ChevronDown, LogOut, CircleUserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { SignInButton, useClerk, useUser } from "@clerk/nextjs"
import { Button } from "./button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Cuenta"

  function AccountTrigger({ className = "" }: { className?: string }) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`rounded-full border-foreground/20 hover:bg-secondary ${className}`}
        onClick={() => setAccountMenuOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={accountMenuOpen}
      >
        <User className="h-4 w-4 mr-2" />
        Cuenta
        <ChevronDown className={`h-4 w-4 transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
      </Button>
    )
  }

  function AccountMenuContent({ mobile = false }: { mobile?: boolean }) {
    if (!accountMenuOpen) return null

    return (
      <div
        className={`absolute z-50 mt-3 overflow-hidden rounded-2xl border border-border bg-background shadow-lg ${mobile ? "left-0 w-full" : "right-0 w-72"}`}
        role="menu"
      >
        {!isSignedIn ? (
          <div className="p-2">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-xl px-3 py-2 text-left"
                onClick={() => setAccountMenuOpen(false)}
              >
                <CircleUserRound className="h-4 w-4" />
                Iniciar sesión
              </Button>
            </SignInButton>
          </div>
        ) : (
          <div className="p-2">
            <Link
              href="/user-profile"
              onClick={() => setAccountMenuOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <CircleUserRound className="h-4 w-4" />
              Mi perfil
            </Link>
            <button
              type="button"
              onClick={async () => {
                setAccountMenuOpen(false)
                await signOut()
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
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

        <div className="hidden md:flex items-center gap-3" ref={accountMenuRef}>
          <div className="relative">
            <AccountTrigger />
            <AccountMenuContent />
          </div>
          <Button variant="secondary" size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Package className="h-4 w-4 mr-2" />
            Rastrear
          </Button>
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
          <div className="flex gap-3 pt-4" ref={accountMenuRef}>
            <div className="relative flex-1">
              <AccountTrigger className="w-full flex-1" />
              <AccountMenuContent mobile />
            </div>
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
