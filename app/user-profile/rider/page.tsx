"use client"

import { useEffect, useMemo, useState } from "react"
import { Bike, CheckCircle2, CircleDot, Clock3, Map } from "lucide-react"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"

type RiderStatus = "activo" | "inactivo"

type ShipmentWithTracking = {
  id: string
  destination: string
  origin: string
  latestStatus: string
  latestDatetime: string
}

const ACTIVE_STORAGE_KEY = "rider-status"

const defaultMicroserviceViewerUrl = "https://realtimetracker-vlmx.onrender.com/"
const defaultShipmentParamName = "shipmentId"
const defaultModeParamName = "mode"
const viewerModeValue = "driver"

const microserviceViewerUrl =
  process.env.NEXT_PUBLIC_MICROSERVICE_VIEWER_URL ??
  process.env.NEXT_PUBLIC_MICROSERVICE_URL ??
  defaultMicroserviceViewerUrl

const shipmentParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_SHIPMENT_PARAM ??
  defaultShipmentParamName

const modeParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_MODE_PARAM ??
  defaultModeParamName

function getLatestTrackingByShipment() {
  const latestMap: Record<string, { status: string; datetime: Date }> = {}

  for (const tracking of SHIPMENT_TRACKINGS) {
    const current = latestMap[tracking.shipmentId]

    if (!current || new Date(tracking.datetime).getTime() > new Date(current.datetime).getTime()) {
      latestMap[tracking.shipmentId] = {
        status: tracking.status,
        datetime: tracking.datetime,
      }
    }
  }

  return latestMap
}

export default function RiderPage() {
  const [status, setStatus] = useState<RiderStatus>("activo")
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
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

  const shipmentsWithLatest = useMemo<ShipmentWithTracking[]>(() => {
    const latestMap = getLatestTrackingByShipment()

    return SHIPMENTS.map((shipment) => {
      const latest = latestMap[shipment.id]

      return {
        id: shipment.id,
        destination: shipment.destination,
        origin: shipment.origin,
        latestStatus: latest?.status ?? "Sin novedades",
        latestDatetime: (latest?.datetime ?? shipment.originDatetime).toISOString(),
      }
    })
  }, [])

  const pendingDeliveries = useMemo(() => {
    return shipmentsWithLatest.filter((shipment) => {
      const statusText = shipment.latestStatus.toLowerCase()
      return !statusText.includes("entregado") && !statusText.includes("cancelado")
    })
  }, [shipmentsWithLatest])

  const deliveredLastWeek = useMemo(() => {
    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000

    return shipmentsWithLatest.filter((shipment) => {
      const statusText = shipment.latestStatus.toLowerCase()
      if (!statusText.includes("entregado")) return false

      const deliveredAt = new Date(shipment.latestDatetime).getTime()
      return now - deliveredAt <= oneWeekMs
    })
  }, [shipmentsWithLatest])

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

  const getMapUrl = useMemo(() => {
    if (pendingDeliveries.length === 0) return null

    const embeddedUrl = new URL(microserviceViewerUrl)

    if (pendingDeliveries[0]) {
      embeddedUrl.searchParams.set(shipmentParamName, pendingDeliveries[0].id)
    }

    embeddedUrl.searchParams.set(modeParamName, viewerModeValue)

    return embeddedUrl.toString().replace(/%2C/gi, ",")
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

          {pendingDeliveries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenés pedidos pendientes por entregar.</p>
          ) : (
            <ul className="space-y-3">
              {pendingDeliveries.map((shipment) => (
                <li key={shipment.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">{shipment.id}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Destino: {shipment.destination}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Estado: {shipment.latestStatus}</p>
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

      {pendingDeliveries.length > 0 && getMapUrl && (
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
                src={getMapUrl}
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