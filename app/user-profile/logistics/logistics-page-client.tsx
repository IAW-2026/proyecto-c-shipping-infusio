"use client"

import { useEffect, useMemo, useState } from "react"
import { SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"
import {
  TimelineStatuses,
} from "@/app/lib/definitions"
import type {
  DeliveryAssignment,
  Rider,
  Shipment,
  ShipmentSummary,
  Tracking as LogisticsTracking,
} from "@/app/lib/definitions"
import { RidersCard } from "@/app/ui/logistics/riders-card"
import { LastUpdates } from "@/app/ui/logistics/last-updates"
import { PackageAssignment } from "@/app/ui/logistics/package-assignment"
import { WelcomeLogistics } from "@/app/ui/logistics/welcome"
import { PendingAndDelivered } from "@/app/ui/logistics/pending-and-delivered"
import { advanceShipmentTrackingServer } from "@/app/lib/shipment-actions"

type LogisticsSnapshot = {
  trackings: LogisticsTracking[]
  assignments: DeliveryAssignment[]
}

type LogisticsPageClientProps = {
  riders: Rider[]
  shipments: Shipment[]
  initialTrackings?: any[]
  operatorId: string
  storageKeys: {
    trackings: string
    assignments: string
  }
}

type ShippingStatus = typeof TimelineStatuses[keyof typeof TimelineStatuses]
type ShippingStatusKey = keyof typeof TimelineStatuses

const SHIPPING_PROGRESS_FLOW: ShippingStatus[] = [
  TimelineStatuses.CONFIRMED,
  TimelineStatuses.PREPARING,
  TimelineStatuses.IN_TRANSIT,
  TimelineStatuses.ARRIVED_CITY,
  TimelineStatuses.OUT_FOR_DELIVERY,
  TimelineStatuses.DELIVERED,
]

const SHIPPING_PROGRESS_KEYS: ShippingStatusKey[] = [
  "CONFIRMED",
  "PREPARING",
  "IN_TRANSIT",
  "ARRIVED_CITY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

const SHIPPING_CITY_STEPS = [
  { current: "Centro de atención", next: "Centro de distribución" },
  { current: "Centro de distribución", next: "Ruta provincial" },
  { current: "Ruta provincial", next: "Zona de reparto" },
  { current: "Zona de reparto", next: "Domicilio del cliente" },
  { current: "Domicilio del cliente", next: "Entrega finalizada" },
  { current: "Entrega finalizada", next: "Entrega finalizada" },
] as const

function normalizeShipmentStatusKey(status: string) {
  const trimmedStatus = status.trim()
  const upperStatus = trimmedStatus.toUpperCase()

  if (upperStatus in TimelineStatuses) {
    return upperStatus as ShippingStatusKey
  }

  const matchedEntry = Object.entries(TimelineStatuses).find(
    ([, label]) => label.toLowerCase() === trimmedStatus.toLowerCase(),
  )

  return (matchedEntry?.[0] as ShippingStatusKey | undefined) ?? null
}

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
    const current = latestMap[tracking.shipmentId]

    if (!current || new Date(tracking.datetime).getTime() > new Date(current.datetime).getTime()) {
      latestMap[tracking.shipmentId] = tracking
    }
  }

  return latestMap
}

function getShipmentProgress(status: string) {
  const normalizedStatus = normalizeShipmentStatusKey(status)

  if (!normalizedStatus) {
    return 0
  }

  const index = SHIPPING_PROGRESS_KEYS.findIndex((step) => step === normalizedStatus)
  return index === -1 ? 0 : index
}

function getCityStage(stepIndex: number, destination: string) {
  const safeIndex = Math.min(stepIndex, SHIPPING_CITY_STEPS.length - 1)
  const cityStep = SHIPPING_CITY_STEPS[safeIndex]

  return {
    currentCity: cityStep.current,
    nextCity: stepIndex >= SHIPPING_PROGRESS_FLOW.length - 1 ? destination : cityStep.next,
  }
}

function createTrackingEvent(shipmentId: string, status: ShippingStatus, destination: string): LogisticsTracking {
  const stepIndex = SHIPPING_PROGRESS_FLOW.findIndex((step) => step === status)
  const { currentCity, nextCity } = getCityStage(stepIndex === -1 ? 0 : stepIndex, destination)

  return {
    shipmentId,
    status,
    datetime: new Date(),
    currentCity,
    nextCity,
    completed: false,
    current: true,
  }
}

export function LogisticsPageClient({ riders, shipments, initialTrackings, operatorId, storageKeys }: LogisticsPageClientProps) {
  // Convert database trackings to LogisticsTracking format
  const convertedTrackings: LogisticsTracking[] = (initialTrackings || []).map((tracking: any) => ({
    shipmentId: tracking.shipmentId,
    status: TimelineStatuses[tracking.status as keyof typeof TimelineStatuses] || tracking.status,
    datetime: new Date(tracking.datetime),
    currentCity: tracking.currentCity,
    nextCity: tracking.nextCity,
    completed: tracking.completed,
    current: tracking.current,
  }))

  const [trackings, setTrackings] = useState<LogisticsTracking[]>(convertedTrackings.length > 0 ? convertedTrackings : (SHIPMENT_TRACKINGS as LogisticsTracking[]))
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id ?? "")
  const [selectedRiderId, setSelectedRiderId] = useState(riders.find((rider) => rider.status === "activo")?.id ?? riders[0]?.id ?? "")
  const [notice, setNotice] = useState<string | null>(null)

  // Only load localStorage for assignments, not trackings (trackings come from DB)
  useEffect(() => {
    const savedAssignments = safeParseSnapshot(window.localStorage.getItem(storageKeys.assignments))

    if (savedAssignments?.assignments?.length) {
      setAssignments(savedAssignments.assignments)
    }
  }, [storageKeys.assignments])

  // Save assignments to localStorage (but not trackings, since they come from DB)
  useEffect(() => {
    window.localStorage.setItem(storageKeys.assignments, JSON.stringify({ assignments }))
  }, [assignments, storageKeys.assignments])

  const riderById = useMemo(() => {
    return riders.reduce<Record<string, Rider>>((accumulator, rider) => {
      accumulator[rider.id] = rider
      return accumulator
    }, {})
  }, [riders])

  const latestTrackingByShipment = useMemo(() => getLatestTrackingByShipment(trackings), [trackings])

  const shipmentSummaries = useMemo<ShipmentSummary[]>(() => {
    const assignmentByShipment = assignments.reduce<Record<string, DeliveryAssignment>>((accumulator, assignment) => {
      accumulator[assignment.shipmentId] = assignment
      return accumulator
    }, {})

    return shipments.map((shipment) => {
      const latestTracking = latestTrackingByShipment[shipment.id] ?? null
      const assignment = assignmentByShipment[shipment.id] ?? null

      return {
        id: shipment.id,
        origin: shipment.origin,
        destination: shipment.destination,
        latestStatus: latestTracking?.status ?? "Pedido confirmado",
        latestDatetime: new Date(latestTracking?.datetime ?? shipment.originDatetime).toISOString(),
        assignedRiderId: assignment?.riderId ?? null,
      }
    })
  }, [assignments, latestTrackingByShipment, shipments])

  const nonDeliveredShipments = shipmentSummaries.filter((shipment) => {
    return shipment.latestStatus !== TimelineStatuses.DELIVERED
  })

  const deliveredShipments = shipmentSummaries.filter((shipment) => {
    return shipment.latestStatus === TimelineStatuses.DELIVERED
  })

  const pendingShipments = nonDeliveredShipments.filter((shipment) => {
    const statusText = shipment.latestStatus.toLowerCase()
    return !statusText.includes("entregado") && !statusText.includes("cancelado")
  })

  const assignedPendingShipments = pendingShipments.filter((shipment) => shipment.assignedRiderId)
  const unassignedPendingShipments = pendingShipments.filter((shipment) => !shipment.assignedRiderId)

  const recentlyUpdatedTrackings = [...trackings]
    .sort((left, right) => new Date(right.datetime).getTime() - new Date(left.datetime).getTime())
    .slice(0, 10)

  const assignShipment = async (shipmentId: string, riderId: string) => {
    const shipment = shipmentSummaries.find((item) => item.id === shipmentId) ?? null
    const rider = riderById[riderId] ?? null

    if (!shipment || !rider) {
      setNotice("Elegí un paquete y un rider activo antes de asignar.")
      return
    }

    if (shipment.latestStatus !== TimelineStatuses.ARRIVED_CITY) {
      setNotice("Solo podés asignar cuando el paquete llegó a tu ciudad.")
      return
    }

    if (rider.status !== "activo") {
      setNotice("Ese rider está inactivo. Elegí uno activo para continuar.")
      return
    }

    const existingAssignment = assignments.find((assignment) => assignment.shipmentId === shipment.id) ?? null
    const nextAssignment: DeliveryAssignment = {
      id: existingAssignment?.id ?? `ASSIGN-${Date.now()}`,
      shipmentId,
      riderId,
      logisticOperatorId: operatorId,
    }

    // Persist assignment via user API route (server-side)
    let persistResult: any = null
    try {
      const response = await fetch("/api/user/assign-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextAssignment),
      })

      persistResult = await response.json()
      if (!response.ok) persistResult = { __error: true, status: response.status, body: persistResult }
    } catch (err) {
      console.error("persist assignment failed", err)
      persistResult = { __error: true }
    }

    if (persistResult?.__error) {
      setNotice("No se pudo guardar la asignación en la base de datos.")
      return
    }

    setAssignments((currentAssignments) => {
      const existingIndex = currentAssignments.findIndex((assignment) => assignment.shipmentId === shipment.id)

      if (existingIndex >= 0) {
        const updatedAssignments = [...currentAssignments]
        updatedAssignments[existingIndex] = nextAssignment
        return updatedAssignments
      }

      return [...currentAssignments, nextAssignment]
    })

    setNotice(`Paquete ${shipment.id} vinculado con ${rider.name}.`)
  }

  // Nueva versión para el uso desde el componente PackageAssignment
  const assignShipmentAndAdvance = async (shipmentId: string, riderId: string) => {
    const shipment = shipmentSummaries.find((item) => item.id === shipmentId) ?? null

    if (!shipment) {
      setNotice("Elegí un paquete y un rider activo antes de asignar.")
      return
    }

    if (shipment.latestStatus !== TimelineStatuses.ARRIVED_CITY) {
      setNotice("Solo podés asignar cuando el paquete llegó a tu ciudad.")
      return
    }

    await assignShipment(shipmentId, riderId)

    try {
      const result = await advanceShipmentTrackingServer({
        shipmentId: shipment.id,
        status: "OUT_FOR_DELIVERY",
      })

      setTrackings((currentTrackings) => {
        const persistedTracking = result.tracking

        return [
          ...currentTrackings,
          {
            shipmentId: persistedTracking.shipmentId,
            status: TimelineStatuses[persistedTracking.status],
            datetime: new Date(persistedTracking.datetime),
            currentCity: persistedTracking.currentCity,
            nextCity: persistedTracking.nextCity,
            completed: persistedTracking.completed,
            current: persistedTracking.current,
          },
        ]
      })

      setNotice(`Paquete ${shipment.id} vinculado y avanzado a "${TimelineStatuses.OUT_FOR_DELIVERY}".`)
    } catch (error) {
      console.error("assignShipmentAndAdvance: failed to persist tracking", error)
      setNotice("Paquete asignado, pero no se pudo avanzar el estado en la base de datos.")
    }
  }

  const advanceShipment = async (shipmentId: string) => {
    const shipment = shipmentSummaries.find((item) => item.id === shipmentId)
    const currentStatusKey = shipment ? normalizeShipmentStatusKey(shipment.latestStatus) : null

    if (!shipment) {
      setNotice("No encontré el paquete seleccionado.")
      return
    }

    if (
      currentStatusKey === "ARRIVED_CITY" ||
      currentStatusKey === "DELIVERED" ||
      currentStatusKey === "OUT_FOR_DELIVERY" ||
      currentStatusKey === "CANCELLED" ||
      currentStatusKey === "WITH_ISSUE"
    ) {
      setNotice("Ese paquete ya llegó al punto de entrega; desde aquí lo completa el rider.")
      return
    }

    const currentIndex = currentStatusKey ? SHIPPING_PROGRESS_KEYS.findIndex((step) => step === currentStatusKey) : getShipmentProgress(shipment.latestStatus)
    const nextIndex = Math.min(currentIndex + 1, SHIPPING_PROGRESS_FLOW.length - 1)
    const nextStatus = SHIPPING_PROGRESS_FLOW[nextIndex]
    const nextStatusKey = SHIPPING_PROGRESS_KEYS[nextIndex]

    try {
      const result = await advanceShipmentTrackingServer({
        shipmentId: shipment.id,
        status: nextStatusKey,
      })

      setTrackings((currentTrackings) => {
        const persistedTracking = result.tracking

        return [
          ...currentTrackings,
          {
            shipmentId: persistedTracking.shipmentId,
            status: TimelineStatuses[persistedTracking.status],
            datetime: new Date(persistedTracking.datetime),
            currentCity: persistedTracking.currentCity,
            nextCity: persistedTracking.nextCity,
            completed: persistedTracking.completed,
            current: persistedTracking.current,
          },
        ]
      })

      setNotice(`Actualizado ${shipment.id} a "${nextStatus}".`)
    } catch (error) {
      console.error("advanceShipment: failed to persist tracking", error)
      setNotice("No se pudo guardar el avance en la base de datos.")
    }
  }

  const assignmentCount = assignments.length

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <WelcomeLogistics
        pendingShipments={pendingShipments}
        deliveredShipments={deliveredShipments}
        assignmentCount={assignmentCount}
      />

      {notice && (
        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {notice}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-[1fr_0.75fr]">
        <div className="space-y-4 md:space-y-6">
          <PackageAssignment
            shipmentSummaries={nonDeliveredShipments}
            riders={riders}
            selectedShipmentId={selectedShipmentId}
            setSelectedShipmentId={setSelectedShipmentId}
            onAdvanceShipment={advanceShipment}
            onAssignShipment={assignShipmentAndAdvance}
          />
          <PendingAndDelivered
            unassignedPendingShipments={unassignedPendingShipments}
            deliveredShipments={deliveredShipments}
            setSelectedShipmentId={setSelectedShipmentId}
            setNotice={setNotice}
          />
        </div>

        <div className="space-y-4 md:space-y-6">
          <RidersCard riders={riders} assignedPendingShipments={assignedPendingShipments} />
          <LastUpdates recentlyUpdatedTrackings={recentlyUpdatedTrackings} />
        </div>
      </div>
    </div>
  )
}