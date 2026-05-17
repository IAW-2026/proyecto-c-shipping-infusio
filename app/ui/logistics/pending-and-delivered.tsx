
"use client"

import { CheckCircle2, Clock3, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/utils/card"
import {  ShipmentSummary } from "@/app/lib/definitions"

export function PendingAndDelivered({unassignedPendingShipments, deliveredShipments, setSelectedShipmentId, setNotice}: {
    unassignedPendingShipments: ShipmentSummary[],
    deliveredShipments: ShipmentSummary[],
    setSelectedShipmentId: (id: string) => void,
    setNotice: (message: string) => void,
}) {
    return (
        <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Clock3 className="h-5 w-5 text-primary" />
                Pedidos pendientes y entregados
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Revisá qué falta asignar y qué ya quedó cerrado.</p>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Sin asignar</h3>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{unassignedPendingShipments.length}</span>
                  </div>
                  <div className="space-y-3">
                    {unassignedPendingShipments.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                        No quedan paquetes pendientes sin rider.
                      </p>
                    ) : (
                      unassignedPendingShipments.map((shipment) => (
                        <article key={shipment.id} className="rounded-xl border border-border bg-background p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{shipment.id}</p>
                            </div>
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 whitespace-nowrap">Sin rider</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShipmentId(shipment.id)
                              setNotice(`Seleccionaste ${shipment.id} para asignación.`)
                            }}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            Ver y asignar
                            <MapPin className="h-4 w-4" />
                          </button>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Entregados</h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{deliveredShipments.length}</span>
                  </div>
                  <div className="space-y-3">
                    {deliveredShipments.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                        No hay envíos entregados todavía.
                      </p>
                    ) : (
                      deliveredShipments.map((shipment) => (
                        <article key={shipment.id} className="rounded-xl border border-border bg-background p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{shipment.id}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary whitespace-nowrap">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Entregado
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">Última actualización: {new Date(shipment.latestDatetime).toLocaleString("es-AR")}</p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
    )
}