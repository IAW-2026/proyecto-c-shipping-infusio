"use client"

import { Route } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/utils/card"
import type { ShipmentTracking } from "@/app/lib/definitions"

type LastUpdatesProps = {
  recentlyUpdatedTrackings: ShipmentTracking[]
}

export function LastUpdates({ recentlyUpdatedTrackings }: LastUpdatesProps) {
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
              <div className="max-h-96 md:max-h-112 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
                {recentlyUpdatedTrackings.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    Aún no hay avances registrados.
                  </p>
                ) : (
                  recentlyUpdatedTrackings.map((tracking) => (
                    <article key={tracking.id} className="rounded-xl border border-border bg-background p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 md:gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{tracking.shipment_id}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{tracking.status}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(tracking.datetime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                        <p className="truncate">Ciudad actual: {tracking.current_city}</p>
                        <p className="truncate">Próximo destino: {tracking.next_city}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
    )
}