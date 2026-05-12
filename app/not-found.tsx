"use client"

import Link from 'next/link'
import { Home, RefreshCw } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center">
        <div className="relative w-full overflow-hidden rounded-4xl border border-border bg-card px-6 py-10 shadow-[0_20px_80px_rgba(45,41,38,0.12)] sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,111,76,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(107,112,86,0.06),transparent_30%)]" />

          <div className="relative grid gap-8 items-center text-center">
            <div>
              <p className="mb-4 text-sm uppercase tracking-widest text-primary font-medium">Error 404</p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground">Página no encontrada</h1>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground">Lo sentimos — la página que buscás no existe o fue movida.</p>

              <div className="mt-8 flex justify-center gap-3">
                <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">
                  <Home className="h-4 w-4" />
                  Volver al inicio
                </Link>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
