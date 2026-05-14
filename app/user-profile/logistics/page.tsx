"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Archive,
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Route,
  Truck,
  UserRound,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"
import type { DeliveryAssignment, Rider } from "@/app/lib/definitions"
import { fetchAllRiders } from "@/app/lib/data"

type ShipmentSummary = {
  id: string
  origin: string
  destination: string
  latestStatus: string
  latestDatetime: string
  assignedRiderId: string | null
}

type LogisticsTracking = {
  id: string
  shipment_id: string
  status: string
  datetime: string
  current_city: string
  next_city: string
}

type LogisticsSnapshot = {
  trackings: LogisticsTracking[]
  assignments: DeliveryAssignment[]
}

const TRACKINGS_STORAGE_KEY = "logistics-trackings"
const ASSIGNMENTS_STORAGE_KEY = "logistics-assignments"
const OPERATOR_ID = "operator-001"

// const RIDERS: Rider[] = [
//   { id: "rider-001", name: "Ana Torres", email: "ana.torres@infusio.com", status: "activo", location: "Bahía Blanca" },
//   { id: "rider-002", name: "Lucas Ferreyra", email: "lucas.ferreyra@infusio.com", status: "activo", location: "CABA" },
//   { id: "rider-003", name: "Marina López", email: "marina.lopez@infusio.com", status: "inactivo", location: "Rosario" },
//   { id: "rider-004", name: "Tomás Pérez", email: "tomas.perez@infusio.com", status: "activo", location: "La Plata" },
// ]

const RIDERS: Rider[] = await fetchAllRiders();

const SHIPPING_FLOW = [
  "Pedido confirmado",
  "Preparando tu pedido",
  "Enviado",
  "En tránsito hacia tu ciudad",
  "Repartiendo",
  "Entregado",
] as const

const SHIPPING_CITY_STEPS = [
  { current: "Centro de atención", next: "Centro de distribución" },
  { current: "Centro de distribución", next: "Centro logístico" },
  { current: "Centro logístico", next: "Ruta provincial" },
  { current: "Ruta provincial", next: "Zona de reparto" },
  { current: "Zona de reparto", next: "Domicilio del cliente" },
  { current: "Domicilio del cliente", next: "Entrega finalizada" },
] as const

function safeParseSnapshot(rawValue: string | null): LogisticsSnapshot | null {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue) as Partial<LogisticsSnapshot>

    if (!Array.isArray(parsed.trackings) || !Array.isArray(parsed.assignments)) {
      return null
    }

    return {
      trackings: parsed.trackings,
      assignments: parsed.assignments,
    }
  } catch {
    return null
  }
}

function getLatestTrackingByShipment(trackings: LogisticsTracking[]) {
  const latestMap: Record<string, LogisticsTracking> = {}

  for (const tracking of trackings) {
    const current = latestMap[tracking.shipment_id]

    if (!current || new Date(tracking.datetime).getTime() > new Date(current.datetime).getTime()) {
      latestMap[tracking.shipment_id] = tracking
    }
  }

  return latestMap
}

function getShipmentProgress(status: string) {
  const index = SHIPPING_FLOW.findIndex((step) => step === status)
  return index === -1 ? 0 : index
}

function getCityStage(stepIndex: number, destination: string) {
  const safeIndex = Math.min(stepIndex, SHIPPING_CITY_STEPS.length - 1)
  const cityStep = SHIPPING_CITY_STEPS[safeIndex]

  return {
    currentCity: cityStep.current,
    nextCity: stepIndex >= SHIPPING_FLOW.length - 1 ? destination : cityStep.next,
  }
}

function createTrackingEvent(shipmentId: string, status: (typeof SHIPPING_FLOW)[number], destination: string): LogisticsTracking {
  const stepIndex = SHIPPING_FLOW.findIndex((step) => step === status)
  const { currentCity, nextCity } = getCityStage(stepIndex === -1 ? 0 : stepIndex, destination)

  return {
    id: `TRACK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    shipment_id: shipmentId,
    status,
    datetime: new Date().toISOString(),
    current_city: currentCity,
    next_city: nextCity,
  }
}

export default function LogisticsPage() {
  const [trackings, setTrackings] = useState<LogisticsTracking[]>(SHIPMENT_TRACKINGS as LogisticsTracking[])
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [selectedShipmentId, setSelectedShipmentId] = useState(SHIPMENTS[0]?.id ?? "")
  const [selectedRiderId, setSelectedRiderId] = useState(RIDERS.find((rider) => rider.status === "activo")?.id ?? RIDERS[0]?.id ?? "")
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const savedSnapshot = safeParseSnapshot(window.localStorage.getItem(TRACKINGS_STORAGE_KEY))
    const savedAssignments = safeParseSnapshot(window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY))

    if (savedSnapshot?.trackings?.length) {
      setTrackings(savedSnapshot.trackings)
    }

    if (savedAssignments?.assignments?.length) {
      setAssignments(savedAssignments.assignments)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(TRACKINGS_STORAGE_KEY, JSON.stringify({ trackings, assignments }))
  }, [trackings, assignments])

  useEffect(() => {
    window.localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify({ trackings, assignments }))
  }, [trackings, assignments])

  const riderById = useMemo(() => {
    return RIDERS.reduce<Record<string, Rider>>((accumulator, rider) => {
      accumulator[rider.id] = rider
      return accumulator
    }, {})
  }, [])

  const latestTrackingByShipment = useMemo(() => getLatestTrackingByShipment(trackings), [trackings])

  const shipmentSummaries = useMemo<ShipmentSummary[]>(() => {
    const assignmentByShipment = assignments.reduce<Record<string, DeliveryAssignment>>((accumulator, assignment) => {
      accumulator[assignment.shipment_id] = assignment
      return accumulator
    }, {})

    return SHIPMENTS.map((shipment) => {
      const latestTracking = latestTrackingByShipment[shipment.id] ?? null
      const assignment = assignmentByShipment[shipment.id] ?? null

      return {
        id: shipment.id,
        origin: shipment.origin,
        destination: shipment.destination,
        latestStatus: latestTracking?.status ?? "Pedido confirmado",
        latestDatetime: latestTracking?.datetime ?? shipment.origin_datetime,
        assignedRiderId: assignment?.rider_id ?? null,
      }
    })
  }, [assignments, latestTrackingByShipment])

  const pendingShipments = shipmentSummaries.filter((shipment) => {
    const statusText = shipment.latestStatus.toLowerCase()
    return !statusText.includes("entregado") && !statusText.includes("cancelado")
  })

  const assignedPendingShipments = pendingShipments.filter((shipment) => shipment.assignedRiderId)
  const unassignedPendingShipments = pendingShipments.filter((shipment) => !shipment.assignedRiderId)

  const deliveredShipments = shipmentSummaries.filter((shipment) => shipment.latestStatus.toLowerCase().includes("entregado"))

  const selectedShipment = shipmentSummaries.find((shipment) => shipment.id === selectedShipmentId) ?? null
  const selectedRider = riderById[selectedRiderId] ?? null

  const selectedShipmentCurrentAssignment = selectedShipment
    ? assignments.find((assignment) => assignment.shipment_id === selectedShipment.id) ?? null
    : null

  const recentlyUpdatedTrackings = [...trackings]
    .sort((left, right) => new Date(right.datetime).getTime() - new Date(left.datetime).getTime())
    .slice(0, 10)

  const assignShipment = () => {
    if (!selectedShipment || !selectedRider) {
      setNotice("Elegí un paquete y un rider activo antes de asignar.")
      return
    }

    if (selectedRider.status !== "activo") {
      setNotice("Ese rider está inactivo. Elegí uno activo para continuar.")
      return
    }

    setAssignments((currentAssignments) => {
      const existingIndex = currentAssignments.findIndex((assignment) => assignment.shipment_id === selectedShipment.id)
      const nextAssignment: DeliveryAssignment = {
        id: existingIndex >= 0 ? currentAssignments[existingIndex].id : `ASSIGN-${Date.now()}`,
        shipment_id: selectedShipment.id,
        rider_id: selectedRider.id,
        operator_id: OPERATOR_ID,
      }

      if (existingIndex >= 0) {
        const updatedAssignments = [...currentAssignments]
        updatedAssignments[existingIndex] = nextAssignment
        return updatedAssignments
      }

      return [...currentAssignments, nextAssignment]
    })

    setNotice(`Paquete ${selectedShipment.id} vinculado con ${selectedRider.name}.`)
  }

  const advanceShipment = (shipmentId: string) => {
    const shipment = shipmentSummaries.find((item) => item.id === shipmentId)

    if (!shipment) {
      setNotice("No encontré el paquete seleccionado.")
      return
    }

    if (shipment.latestStatus.toLowerCase().includes("entregado")) {
      setNotice("Ese paquete ya figura como entregado.")
      return
    }

    const currentIndex = getShipmentProgress(shipment.latestStatus)
    const nextIndex = Math.min(currentIndex + 1, SHIPPING_FLOW.length - 1)
    const nextStatus = SHIPPING_FLOW[nextIndex]

    setTrackings((currentTrackings) => {
      const nextEvent = createTrackingEvent(shipment.id, nextStatus, shipment.destination)
      return [...currentTrackings, nextEvent]
    })

    setNotice(`Actualizado ${shipment.id} a "${nextStatus}".`)
  }

  const assignmentCount = assignments.length

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.03),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">Operador logístico</p>
            <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">Asignar paquetes y mover cada envío paso a paso</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Desde esta vista podés vincular cada paquete con un rider disponible, avanzar el estado del shipping y seguir la operación en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-105">
            <div className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-33 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-semibold text-foreground">{pendingShipments.length}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-33 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Asignados</p>
                <p className="text-2xl font-semibold text-foreground">{assignmentCount}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-33 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Repartiendo</p>
                <p className="text-2xl font-semibold text-foreground">
                  {pendingShipments.filter((shipment) => shipment.latestStatus.toLowerCase().includes("reparto")).length}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-33 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Entregados</p>
                <p className="text-2xl font-semibold text-foreground">{deliveredShipments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
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
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-foreground">
                  <span className="flex items-center gap-2 font-medium">
                    <Package className="h-4 w-4 text-primary" />
                    Paquete
                  </span>
                  <select
                    value={selectedShipmentId}
                    onChange={(event) => setSelectedShipmentId(event.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
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
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
                  >
                    {RIDERS.map((rider) => (
                      <option key={rider.id} value={rider.id} disabled={rider.status !== "activo"}>
                        {rider.name} {rider.status !== "activo" ? "(inactivo)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={assignShipment}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Vincular paquete
                </button>

                <button
                  type="button"
                  onClick={() => selectedShipment && advanceShipment(selectedShipment.id)}
                  disabled={!selectedShipment || selectedShipment.latestStatus.toLowerCase().includes("entregado")}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Route className="h-4 w-4" />
                  Avanzar paso
                </button>
              </div>

              {selectedShipment && (
                <div className="mt-6 rounded-2xl border border-border bg-background p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Selección actual</p>
                      <h3 className="mt-1 font-serif text-2xl text-foreground">{selectedShipment.id}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedShipment.origin}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Destino: {selectedShipment.destination}</p>
                    </div>

                    <div className="rounded-2xl border border-border px-4 py-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Estado actual</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{selectedShipment.latestStatus}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(selectedShipment.latestDatetime).toLocaleString("es-AR")}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Rider asignado</p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedShipmentCurrentAssignment ? riderById[selectedShipmentCurrentAssignment.rider_id]?.name ?? "Rider no encontrado" : "Sin asignar"}
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

          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Clock3 className="h-5 w-5 text-primary" />
                Pedidos pendientes y entregados
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Revisá qué falta asignar y qué ya quedó cerrado.</p>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid gap-6 xl:grid-cols-2">
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
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{shipment.id}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{shipment.destination}</p>
                            </div>
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">Sin rider</span>
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
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{shipment.id}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{shipment.destination}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Truck className="h-5 w-5 text-primary" />
                Riders disponibles
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Solo los riders activos quedan habilitados para nuevas asignaciones.</p>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="max-h-96 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin]">
                {RIDERS.map((rider) => (
                  <article key={rider.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{rider.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{rider.email}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Zona: {rider.location}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
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
        </div>
      </div>
    </div>
  )
}
