"use client"

import { useEffect, useMemo, useState } from "react"
import { Archive, ArrowRightLeft, Package, Route, UserRound } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/utils/card"
import { TimelineStatuses } from "@/app/lib/definitions"
import type { Rider, ShipmentSummary } from "@/app/lib/definitions"

type PackageAssignmentProps = {
  shipmentSummaries: ShipmentSummary[]
  riders: Rider[]
  selectedShipmentId: string
  setSelectedShipmentId: (id: string) => void
  onAdvanceShipment?: (shipmentId: string) => void
  onAssignShipment: (shipmentId: string, riderId: string) => Promise<void>
}

const SHIPPING_FLOW = [
  TimelineStatuses.CONFIRMED,
  TimelineStatuses.PREPARING,
  TimelineStatuses.IN_TRANSIT,
  TimelineStatuses.ARRIVED_CITY,
  TimelineStatuses.OUT_FOR_DELIVERY,
  TimelineStatuses.DELIVERED,
] as const

const SHIPPING_FLOW_KEYS = SHIPPING_FLOW.map((status) => {
  return Object.entries(TimelineStatuses).find(([, label]) => label === status)?.[0] ?? null
}) as Array<keyof typeof TimelineStatuses | null>

function normalizeShipmentStatusKey(status: string) {
  const trimmedStatus = status.trim()
  const upperStatus = trimmedStatus.toUpperCase()

  if (upperStatus in TimelineStatuses) {
    return upperStatus as keyof typeof TimelineStatuses
  }

  const matchedEntry = Object.entries(TimelineStatuses).find(
    ([, label]) => label.toLowerCase() === trimmedStatus.toLowerCase(),
  )

  return (matchedEntry?.[0] as keyof typeof TimelineStatuses | undefined) ?? null
}

function getShipmentProgress(status: string) {
  const normalizedStatus = normalizeShipmentStatusKey(status)

  if (!normalizedStatus) {
    return 0
  }

  const index = SHIPPING_FLOW_KEYS.findIndex((step) => step === normalizedStatus)
  return index === -1 ? 0 : index
}

function isTerminalStatus(status: string) {
  const normalizedStatus = normalizeShipmentStatusKey(status)

  return (
    normalizedStatus === "ARRIVED_CITY" ||
    normalizedStatus === "DELIVERED" ||
    normalizedStatus === "OUT_FOR_DELIVERY" ||
    normalizedStatus === "CANCELLED" ||
    normalizedStatus === "WITH_ISSUE"
  )
}

export function PackageAssignment({
  shipmentSummaries,
  riders,
  selectedShipmentId,
  setSelectedShipmentId,
  onAdvanceShipment,
  onAssignShipment,
}: PackageAssignmentProps) {
  const [selectedRiderId, setSelectedRiderId] = useState("")

  const riderById = useMemo<Record<string, Rider>>(() => {
    return riders.reduce<Record<string, Rider>>((accumulator, rider) => {
      accumulator[rider.id] = rider
      return accumulator
    }, {})
  }, [riders])

  useEffect(() => {
    if (shipmentSummaries.length === 0) return

    const selectedExists = shipmentSummaries.some((shipment) => shipment.id === selectedShipmentId)

    if (!selectedExists) {
      setSelectedShipmentId(shipmentSummaries[0].id)
    }
  }, [selectedShipmentId, setSelectedShipmentId, shipmentSummaries])

  const pendingShipments = shipmentSummaries.filter((shipment) => {
    const statusText = shipment.latestStatus.toLowerCase()
    return !statusText.includes("entregado") && !statusText.includes("cancelado")
  })

  const unassignedPendingShipments = pendingShipments.filter((shipment) => !shipment.assignedRiderId)
  const selectedShipment = shipmentSummaries.find((shipment) => shipment.id === selectedShipmentId) ?? null
  const selectedShipmentAssignedRider = selectedShipment?.assignedRiderId
    ? riderById[selectedShipment.assignedRiderId] ?? null
    : null

  const assignShipment = async () => {
    if (!selectedShipment || selectedShipment.latestStatus !== TimelineStatuses.ARRIVED_CITY) {
      return
    }

    await onAssignShipment(selectedShipment.id, selectedRiderId)
  }

  const advanceShipment = () => {
    if (!selectedShipment || !onAdvanceShipment || isTerminalStatus(selectedShipment.latestStatus)) {
      return
    }

    onAdvanceShipment(selectedShipment.id)
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <label className="space-y-2 text-sm text-foreground">
            <span className="flex items-center gap-2 font-medium">
              <Package className="h-4 w-4 text-primary" />
              Paquete
            </span>
            <select
              value={selectedShipmentId}
              onChange={(event) => setSelectedShipmentId(event.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary md:px-4"
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
              className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary md:px-4"
            >
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id} disabled={rider.status !== "activo"}>
                  {rider.name} {rider.status !== "activo" ? "(inactivo)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col flex-wrap items-start gap-2 md:mt-5 sm:flex-row sm:items-center md:gap-3">
          <button
            type="button"
            onClick={assignShipment}
            disabled={!selectedShipment || selectedShipment.latestStatus !== TimelineStatuses.ARRIVED_CITY}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Vincular paquete
          </button>

          <button
            type="button"
            onClick={advanceShipment}
            disabled={!selectedShipment || isTerminalStatus(selectedShipment.latestStatus)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start"
          >
            <Route className="h-4 w-4" />
            Avanzar paso
          </button>
        </div>

        {selectedShipment && (
          <div className="mt-6 rounded-2xl border border-border bg-background p-4 md:p-5">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:flex-wrap md:gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Selección actual</p>
                <h3 className="mt-1 wrap-break-word font-serif text-xl text-foreground md:text-2xl">{selectedShipment.id}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Origen: {selectedShipment.origin}</p>
                <p className="mt-1 text-sm text-muted-foreground">Destino: {selectedShipment.destination}</p>
              </div>

              <div className="w-full rounded-2xl border border-border px-4 py-3 md:w-auto">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Estado actual</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedShipment.latestStatus}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(selectedShipment.latestDatetime).toLocaleString("es-AR")}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Rider asignado</p>
                <p className="mt-2 text-sm font-medium text-foreground wrap-break-word">
                  {selectedShipmentAssignedRider?.name ?? "Sin asignar"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Próximo paso</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {isTerminalStatus(selectedShipment.latestStatus)
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
