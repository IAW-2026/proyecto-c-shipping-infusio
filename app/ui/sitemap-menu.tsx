"use client"

import Link from "next/link"
import { Map, Package, User, ChevronDown } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { SITEMAP } from "@/app/lib/sitemap-config"
import { Button } from "./button"

type SitemapMenuProps = {
  sitemapMenuOpen: boolean
  setSitemapMenuOpen: Dispatch<SetStateAction<boolean>>
}

export function SitemapMenuContent({ sitemapMenuOpen, setSitemapMenuOpen }: SitemapMenuProps) {
  if (!sitemapMenuOpen) return null

  const getIcon = (iconType: 'user' | 'package') => {
    return iconType === 'user'
      ? <User className="h-4 w-4 text-primary shrink-0" />
      : <Package className="h-4 w-4 text-primary shrink-0" />
  }

  return (
    <div
      className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-border bg-background shadow-lg overflow-hidden"
      role="menu"
    >
      <div className="max-h-96 overflow-y-auto px-4 pt-6 pb-4 space-y-4">
        {SITEMAP.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSitemapMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  {getIcon(link.icon)}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
            {idx < SITEMAP.length - 1 && <div className="mt-4 h-px bg-border" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MobileSitemapMenu({ sitemapMenuOpen, setSitemapMenuOpen }: SitemapMenuProps) {
  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center rounded-full border-foreground/20 hover:bg-secondary"
        onClick={() => setSitemapMenuOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={sitemapMenuOpen}
      >
        <Map className="h-4 w-4 mr-2" />
        Mapa del Sitio
        <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${sitemapMenuOpen ? "rotate-180" : ""}`} />
      </Button>

      {sitemapMenuOpen && (
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="max-h-64 overflow-y-auto space-y-4">
            {SITEMAP.map((section, idx) => (
              <div key={idx}>
                <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.links.map((link) => {
                    const getIcon = (iconType: 'user' | 'package') => {
                      return iconType === 'user'
                        ? <User className="h-4 w-4 shrink-0" />
                        : <Package className="h-4 w-4 shrink-0" />
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSitemapMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                      >
                        {getIcon(link.icon)}
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}