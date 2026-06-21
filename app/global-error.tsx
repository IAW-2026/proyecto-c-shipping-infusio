"use client"

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center">
            <section className="relative w-full overflow-hidden rounded-4xl border border-border bg-card px-6 py-10 shadow-[0_20px_80px_rgba(45,41,38,0.12)] sm:px-10 sm:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,111,76,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(107,112,86,0.14),transparent_30%)]" />

              <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    Error crítico de la aplicación
                  </div>

                  <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    No pudimos cargar la aplicación completa.
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Suele pasar cuando falla el layout raíz o alguna dependencia global.
                    Probá reintentar ahora o volver al inicio para seguir navegando.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reintentar
                    </button>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      <Home className="h-4 w-4" />
                      Volver al inicio
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-[1.75rem] border border-border bg-background/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Estado</p>
                        <p className="font-medium text-foreground">Boundary global</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                        <span>Acción sugerida</span>
                        <span className="font-medium text-foreground">Reintentar</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                        <span>Alcance</span>
                        <span className="font-medium text-foreground">Aplicación completa</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
                        <span>Próximo paso</span>
                        <span className="font-medium text-foreground">Restaurar sesión</span>
                      </div>
                    </div>
                  </div>

                  {/* <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:block">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Consejo</p>
                    <p className="mt-1 text-sm text-foreground">
                      Si apareció al iniciar, el problema suele estar en un provider global.
                    </p>
                  </div> */}
                </div>
              </div>
            </section>
          </div>
        </main>
      </body>
    </html>
  )
}