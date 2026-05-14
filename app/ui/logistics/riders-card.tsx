"use client"

import { Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/utils/card"
import type { Rider } from "@/app/lib/definitions"

type RidersCardProps = {
  riders: Rider[]
  assignedPendingShipments: Array<{ assignedRiderId: string | null }>
}

export function RidersCard({ riders, assignedPendingShipments }: RidersCardProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 font-serif text-xl">
          <Truck className="h-5 w-5 text-primary" />
          Riders disponibles
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">Solo los riders activos quedan habilitados para nuevas asignaciones.</p>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="max-h-96 md:max-h-112 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
          {riders.map((rider) => (
            <article key={rider.id} className="rounded-xl border border-border bg-background p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{rider.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground truncate">{rider.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground truncate">Zona: {rider.location}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
                    rider.status === "activo" ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {rider.status === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Asignados hoy: {" "}
                {assignedPendingShipments.filter((shipment) => shipment.assignedRiderId === rider.id).length}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
