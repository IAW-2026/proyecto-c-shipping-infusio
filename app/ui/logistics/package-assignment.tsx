"use client"

import { useMemo, useState } from "react"
import { Archive, ArrowRightLeft, Package, Route, UserRound } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/utils/card"
import type { DeliveryAssignment, Rider, Shipment } from "@/app/lib/definitions"

export function PackageAssignment({shipments, riders}: { shipments: Shipment[], riders: Rider[] }) {
    const assignments: DeliveryAssignment[] = []
    const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id ?? "")
    const [selectedRiderId, setSelectedRiderId] = useState("")

    const SHIPPING_FLOW = [
      "Pedido confirmado",
      "Preparando tu pedido",
      "Enviado",
      "En tránsito hacia tu ciudad",
      "Repartiendo",
      "Entregado",
    ] as const

    const getShipmentProgress = (status: string) => {
      const index = SHIPPING_FLOW.findIndex((step) => step === status)
      return index === -1 ? 0 : index
    }

    const shipmentSummaries = useMemo(
      () =>
        shipments.map((shipment) => ({
          id: shipment.id,
          origin: shipment.origin,
          destination: shipment.destination,
          latestStatus: "Pedido confirmado",
          latestDatetime: shipment.originDatetime,
          assignedRiderId: null as string | null,
        })),
      []
    )

    const riderById = useMemo<Record<string, Rider>>(() => {
      return riders.reduce<Record<string, Rider>>((acc, rider) => {
        acc[rider.id] = rider
        return acc
      }, {})
    }, [riders])

    const pendingShipments = shipmentSummaries.filter((shipment) => {
      const statusText = shipment.latestStatus.toLowerCase()
      return !statusText.includes("entregado") && !statusText.includes("cancelado")
    })

    const unassignedPendingShipments = pendingShipments.filter((shipment) => !shipment.assignedRiderId)
    
    const selectedShipment = shipmentSummaries.find((shipment) => shipment.id === selectedShipmentId) ?? null
    const selectedShipmentCurrentAssignment = selectedShipment
      ? assignments.find((assignment) => assignment.shipmentId === selectedShipment.id) ?? null
      : null

    const assignShipment = () => {
      if (!selectedShipment) return
      // This component receives data from parent, actual assignment happens in parent
    }
    const advanceShipment = (_shipmentId: string) => {
      // This component receives data from parent, actual advancement happens in parent
    }

    return (
        <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 font-serif text-xl">
                    <Archive className="h-5 w-5 text-primary" />
                    Asignación de paquete
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">Elegí un envío y un rider para crear o cambiar la asignación.</p>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                  {unassignedPendingShipments.length} sin asignar
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                <label className="space-y-2 text-sm text-foreground">
                  <span className="flex items-center gap-2 font-medium">
                    <Package className="h-4 w-4 text-primary" />
                    Paquete
                  </span>
                  <select
                    value={selectedShipmentId}
                    onChange={(event) => setSelectedShipmentId(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 md:px-4 text-sm outline-none transition-colors focus:border-primary appearance-none"
                  >
                    {shipmentSummaries.map((shipment) => (
                      <option key={shipment.id} value={shipment.id}>
                        {shipment.id} - {shipment.destination}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-foreground">
                  <span className="flex items-center gap-2 font-medium">
                    <UserRound className="h-4 w-4 text-primary" />
                    Rider
                  </span>
                  <select
                    value={selectedRiderId}
                    onChange={(event) => setSelectedRiderId(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background px-3 md:px-4 text-sm outline-none transition-colors focus:border-primary appearance-none"
                  >
                    {riders.map((rider) => (
                      <option key={rider.id} value={rider.id} disabled={rider.status !== "activo"}>
                        {rider.name} {rider.status !== "activo" ? "(inactivo)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 md:mt-5 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={assignShipment}
                  className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Vincular paquete
                </button>

                <button
                  type="button"
                  onClick={() => selectedShipment && advanceShipment(selectedShipment.id)}
                  disabled={!selectedShipment || selectedShipment.latestStatus.toLowerCase().includes("entregado")}
                  className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Route className="h-4 w-4" />
                  Avanzar paso
                </button>
              </div>

              {selectedShipment && (
                <div className="mt-6 rounded-2xl border border-border bg-background p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:flex-wrap items-start justify-between gap-4 md:gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Selección actual</p>
                      <h3 className="mt-1 font-serif text-xl md:text-2xl text-foreground break-words">{selectedShipment.id}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedShipment.origin}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Destino: {selectedShipment.destination}</p>
                    </div>

                    <div className="w-full md:w-auto rounded-2xl border border-border px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Estado actual</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{selectedShipment.latestStatus}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(selectedShipment.latestDatetime).toLocaleString("es-AR")}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Rider asignado</p>
                      <p className="mt-2 text-sm font-medium text-foreground wrap-break-word">
                        {selectedShipmentCurrentAssignment ? riderById[selectedShipmentCurrentAssignment.riderId]?.name ?? "Rider no encontrado" : "Sin asignar"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Próximo paso</p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedShipment.latestStatus.toLowerCase().includes("entregado")
                          ? "Flujo finalizado"
                          : SHIPPING_FLOW[Math.min(getShipmentProgress(selectedShipment.latestStatus) + 1, SHIPPING_FLOW.length - 1)]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
    )
}