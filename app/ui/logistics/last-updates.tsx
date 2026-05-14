"use client"

import { Route } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card"

export function LastUpdates({recentlyUpdatedTrackings}: { recentlyUpdatedTrackings: any }) {
    return (
        <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Route className="h-5 w-5 text-primary" />
                Últimos avances
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Registro de las últimas actualizaciones de shipping.</p>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="max-h-112 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
                {recentlyUpdatedTrackings.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    Aún no hay avances registrados.
                  </p>
                ) : (
                  recentlyUpdatedTrackings.map((tracking) => (
                    <article key={tracking.id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{tracking.shipment_id}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{tracking.status}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(tracking.datetime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <p>Ciudad actual: {tracking.current_city}</p>
                        <p>Próximo destino: {tracking.next_city}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
    )
}