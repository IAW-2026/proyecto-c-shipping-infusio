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

type LogisticsSnapshot = {
  trackings: LogisticsTracking[]
  assignments: DeliveryAssignment[]
}

type LogisticsPageClientProps = {
  riders: Rider[]
  shipments: Shipment[]
  operatorId: string
  storageKeys: {
    trackings: string
    assignments: string
  }
}

type ShippingStatus = typeof TimelineStatuses[keyof typeof TimelineStatuses]

const SHIPPING_FLOW = Object.values(TimelineStatuses) as ShippingStatus[]

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
    const current = latestMap[tracking.shipmentId]

    if (!current || new Date(tracking.datetime).getTime() > new Date(current.datetime).getTime()) {
      latestMap[tracking.shipmentId] = tracking
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

function createTrackingEvent(shipmentId: string, status: ShippingStatus, destination: string): LogisticsTracking {
  const stepIndex = SHIPPING_FLOW.findIndex((step) => step === status)
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

export function LogisticsPageClient({ riders, shipments, operatorId, storageKeys }: LogisticsPageClientProps) {
  const [trackings, setTrackings] = useState<LogisticsTracking[]>(SHIPMENT_TRACKINGS as LogisticsTracking[])
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id ?? "")
  const [selectedRiderId, setSelectedRiderId] = useState(riders.find((rider) => rider.status === "activo")?.id ?? riders[0]?.id ?? "")
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const savedSnapshot = safeParseSnapshot(window.localStorage.getItem(storageKeys.trackings))
    const savedAssignments = safeParseSnapshot(window.localStorage.getItem(storageKeys.assignments))

    if (savedSnapshot?.trackings?.length) {
      setTrackings(savedSnapshot.trackings)
    }

    if (savedAssignments?.assignments?.length) {
      setAssignments(savedAssignments.assignments)
    }
  }, [storageKeys.assignments, storageKeys.trackings])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.trackings, JSON.stringify({ trackings, assignments }))
  }, [assignments, storageKeys.trackings, trackings])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.assignments, JSON.stringify({ trackings, assignments }))
  }, [assignments, storageKeys.assignments, trackings])

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
        latestDatetime: (latestTracking?.datetime ?? shipment.originDatetime).toISOString(),
        assignedRiderId: assignment?.riderId ?? null,
      }
    })
  }, [assignments, latestTrackingByShipment, shipments])

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
    ? assignments.find((assignment) => assignment.shipmentId === selectedShipment.id) ?? null
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
      const existingIndex = currentAssignments.findIndex((assignment) => assignment.shipmentId === selectedShipment.id)
      const nextAssignment: DeliveryAssignment = {
        id: existingIndex >= 0 ? currentAssignments[existingIndex].id : `ASSIGN-${Date.now()}`,
        shipmentId: selectedShipment.id,
        riderId: selectedRider.id,
        logisticOperatorId: operatorId,
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
            shipments={shipments}
            riders={riders}
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