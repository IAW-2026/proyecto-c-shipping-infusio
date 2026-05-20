"use client"

import { useEffect, useMemo, useState } from "react"
import { Bike, CheckCircle2, CircleDot, Clock3, Map } from "lucide-react"
import { TimelineStatuses } from "@/app/lib/definitions"

type RiderStatus = "activo" | "inactivo"

type ShipmentWithTracking = {
  id: string
  destination: string
  origin: string
  latestStatus: string
  latestDatetime: string
}

type RiderAssignedShipment = {
  deliveryAssignmentId: string
  shipmentId: string
  origin: string
  destination: string
  latestStatus: string
  latestDatetime: string
}

async function fetchRiderDeliveries(): Promise<RiderAssignedShipment[]> {
  const response = await fetch("/api/user/rider/deliveries", {
    cache: "no-store",
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error ?? "No se pudieron obtener las entregas asignadas")
  }

  return Array.isArray(data?.shipments) ? data.shipments : []
}

function normalizeShipmentStatus(status: string) {
  return status.trim().toUpperCase()
}

function isDeliveredShipment(status: string) {
  const normalizedStatus = normalizeShipmentStatus(status)
  return normalizedStatus === "DELIVERED" || status.trim().toLowerCase() === TimelineStatuses.DELIVERED.toLowerCase()
}

function isOutForDeliveryShipment(status: string) {
  const normalizedStatus = normalizeShipmentStatus(status)
  return (
    normalizedStatus === "OUT_FOR_DELIVERY" ||
    status.trim().toLowerCase() === TimelineStatuses.OUT_FOR_DELIVERY.toLowerCase()
  )
}

const defaultMicroserviceViewerUrl = "https://realtimetracker-vlmx.onrender.com/"
const defaultShipmentParamName = "shipmentId"
const defaultModeParamName = "mode"
const viewerModeValue = "driver"

const defaultDestinationLatParamName = "destinationLat"
const defaultDestinationLngParamName = "destinationLng"

const microserviceViewerUrl =
  process.env.NEXT_PUBLIC_MICROSERVICE_VIEWER_URL ??
  process.env.NEXT_PUBLIC_MICROSERVICE_URL ??
  defaultMicroserviceViewerUrl

const shipmentParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_SHIPMENT_PARAM ??
  defaultShipmentParamName

const destinationLatParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_DESTINATION_LAT_PARAM ??
  defaultDestinationLatParamName

const destinationLngParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_DESTINATION_LNG_PARAM ??
  defaultDestinationLngParamName

const modeParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_MODE_PARAM ??
  defaultModeParamName

export default function RiderPage() {
  const [status, setStatus] = useState<RiderStatus>("activo")
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [assignedShipments, setAssignedShipments] = useState<RiderAssignedShipment[]>([])
  const [loadingDeliveries, setLoadingDeliveries] = useState(true)
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null)
  const [selectedShipmentId, setSelectedShipmentId] = useState("")
  const [completingDelivery, setCompletingDelivery] = useState(false)
  const [deliveryActionError, setDeliveryActionError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const loadStatus = async () => {
      setLoadingStatus(true)
      setStatusError(null)

      try {
        const response = await fetch("/api/user/rider/status", {
          cache: "no-store",
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudo obtener el estado del rider")
        }

        if (data?.status === "activo" || data?.status === "inactivo") {
          setStatus(data.status)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido"
        setStatusError(message)
      } finally {
        setLoadingStatus(false)
      }
    }

    loadStatus()
  }, [])

  useEffect(() => {
    const loadDeliveries = async () => {
      setLoadingDeliveries(true)
      setDeliveriesError(null)

      try {
        const shipments = await fetchRiderDeliveries()
        setAssignedShipments(shipments)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido"
        setDeliveriesError(message)
        setAssignedShipments([])
      } finally {
        setLoadingDeliveries(false)
      }
    }

    loadDeliveries()
  }, [])

  const shipmentsWithLatest = useMemo<ShipmentWithTracking[]>(() => {
    return assignedShipments.map((shipment) => ({
      id: shipment.shipmentId,
      destination: shipment.destination,
      origin: shipment.origin,
      latestStatus: shipment.latestStatus,
      latestDatetime: shipment.latestDatetime,
    }))
  }, [assignedShipments])

  const pendingDeliveries = useMemo(() => {
    return shipmentsWithLatest.filter((shipment) => {
      const normalizedStatus = normalizeShipmentStatus(shipment.latestStatus)
      return normalizedStatus !== "DELIVERED" && normalizedStatus !== "CANCELLED"
    })
  }, [shipmentsWithLatest])

  const selectedShipment = useMemo(() => {
    return pendingDeliveries.find((shipment) => shipment.id === selectedShipmentId) ?? null
  }, [pendingDeliveries, selectedShipmentId])

  const canCompleteSelectedShipment = selectedShipment ? isOutForDeliveryShipment(selectedShipment.latestStatus) : false

  const deliveredLastWeek = useMemo(() => {
    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000

    return shipmentsWithLatest.filter((shipment) => {
      if (!isDeliveredShipment(shipment.latestStatus)) return false

      const deliveredAt = new Date(shipment.latestDatetime).getTime()
      return now - deliveredAt <= oneWeekMs
    })
  }, [shipmentsWithLatest])

  useEffect(() => {
    if (pendingDeliveries.length === 0) {
      setSelectedShipmentId("")
      return
    }

    setSelectedShipmentId((currentShipmentId) => {
      if (pendingDeliveries.some((shipment) => shipment.id === currentShipmentId)) {
        return currentShipmentId
      }

      return pendingDeliveries[0]?.id ?? ""
    })
  }, [pendingDeliveries])

  const persistStatusToggle = async () => {
    if (savingStatus || loadingStatus) {
      return
    }

    setSavingStatus(true)
    setStatusError(null)

    try {
      const response = await fetch("/api/user/rider/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo actualizar el estado del rider")
      }

      if (data?.status === "activo" || data?.status === "inactivo") {
        setStatus(data.status)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      setStatusError(message)
    } finally {
      setSavingStatus(false)
    }
  }

  const completeSelectedDelivery = async () => {
    if (!selectedShipmentId || completingDelivery) {
      return
    }

    setCompletingDelivery(true)
    setDeliveryActionError(null)

    try {
      const response = await fetch("/api/user/rider/deliveries/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shipmentId: selectedShipmentId }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo marcar la entrega como finalizada")
      }

      const shipments = await fetchRiderDeliveries()
      setAssignedShipments(shipments)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido"
      setDeliveryActionError(message)
    } finally {
      setCompletingDelivery(false)
    }
  }

  const [mapUrl, setMapUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const buildMapUrl = async () => {
      if (pendingDeliveries.length === 0) {
        if (mounted) setMapUrl(null)
        return
      }

      const shipment = pendingDeliveries[0]
      const embeddedUrl = new URL(microserviceViewerUrl)

      if (shipment) embeddedUrl.searchParams.set(shipmentParamName, shipment.id)

      try {
        const resp = await fetch(`/api/geocoding/resolve?address=${encodeURIComponent(shipment.destination)}`)
        const data = await resp.json()

        if (resp.ok && data?.latitude && data?.longitude) {
          embeddedUrl.searchParams.set(destinationLatParamName, data.latitude)
          embeddedUrl.searchParams.set(destinationLngParamName, data.longitude)
        } else {
          // Fallback: pass destination address so microservice may attempt to resolve it
          embeddedUrl.searchParams.set("destinationAddress", shipment.destination)
        }
      } catch (e) {
        embeddedUrl.searchParams.set("destinationAddress", shipment.destination)
      }

      embeddedUrl.searchParams.set(modeParamName, viewerModeValue)

      const url = embeddedUrl.toString().replace(/%2C/gi, ",")
      if (mounted) setMapUrl(url)
    }

    buildMapUrl()

    return () => {
      mounted = false
    }
  }, [pendingDeliveries])

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Panel Rider</p>
          <h1 className="font-serif text-3xl font-medium text-foreground">Tus entregas</h1>
          <p className="mt-2 text-muted-foreground">Gestioná tus pedidos pendientes y revisá tus entregas recientes.</p>
        </div>

        <button
          type="button"
          onClick={persistStatusToggle}
          disabled={loadingStatus || savingStatus}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            status === "activo"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          <Bike className="h-4 w-4" />
          Estado: {loadingStatus ? "Cargando..." : savingStatus ? "Actualizando..." : status === "activo" ? "Activo" : "No activo"}
        </button>
        {statusError ? <p className="mt-2 text-sm text-red-500">{statusError}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl text-foreground">Pedidos por entregar</h2>
          </div>

          {pendingDeliveries.length > 0 ? (
            <div className="mb-5 rounded-xl border border-border bg-background p-4">
              <label htmlFor="delivery-complete-select" className="text-sm font-medium text-foreground">
                Elegí un pedido asignado para finalizarlo
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  id="delivery-complete-select"
                  value={selectedShipmentId}
                  onChange={(event) => setSelectedShipmentId(event.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  {pendingDeliveries.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.id} - {shipment.destination}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={completeSelectedDelivery}
                  disabled={!selectedShipmentId || !canCompleteSelectedShipment || completingDelivery}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {completingDelivery ? "Marcando..." : "Marcar como entregado"}
                </button>
              </div>

              {deliveryActionError ? <p className="mt-3 text-sm text-red-500">{deliveryActionError}</p> : null}
              {selectedShipmentId ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {canCompleteSelectedShipment
                    ? `Se finalizará el pedido ${selectedShipmentId} como entregado.`
                    : `El pedido ${selectedShipmentId} debe estar en reparto para poder finalizarlo.`}
                </p>
              ) : null}
            </div>
          ) : null}

          {loadingDeliveries ? (
            <p className="text-sm text-muted-foreground">Cargando pedidos asignados...</p>
          ) : deliveriesError ? (
            <p className="text-sm text-red-500">{deliveriesError}</p>
          ) : pendingDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenés pedidos pendientes por entregar.</p>
          ) : (
            <ul className="space-y-3">
              {pendingDeliveries.map((shipment) => (
                <li key={shipment.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{shipment.id}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Destino: {shipment.destination}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-xl text-foreground">Entregados en la última semana</h2>
          </div>

          {deliveredLastWeek.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrás entregas en la última semana.</p>
          ) : (
            <ul className="space-y-3">
              {deliveredLastWeek.map((shipment) => (
                <li key={shipment.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{shipment.id}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      <CircleDot className="h-3 w-3" />
                      Entregado
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Origen: {shipment.origin}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Destino: {shipment.destination}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fecha: {new Date(shipment.latestDatetime).toLocaleDateString("es-AR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {pendingDeliveries.length > 0 && mapUrl && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" />
              <h2 className="font-serif text-xl text-foreground">Mapa de entregas activas</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowMap((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                showMap
                  ? "bg-secondary text-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {showMap ? "Ocultar mapa" : "Ver mapa"}
            </button>
          </div>

          {showMap && (
            <div className="h-105 overflow-hidden rounded-lg border border-border bg-background">
              <iframe
                title="Mapa de entregas activas"
                src={mapUrl ?? undefined}
                className="h-full w-full"
                loading="lazy"
                allow="geolocation *"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}