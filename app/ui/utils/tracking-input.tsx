"use client"

import { Search, AlertCircle, Radio } from "lucide-react"
import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Tracking } from "@/app/lib/definitions"
import { TimelineStatuses } from "@/app/lib/definitions"
import { fetchShipmentByIdServer } from "@/app/lib/shipment-actions"
import { fetchTrackingsByShipmentIdServer } from "@/app/lib/tracking-actions"
import { ShipmentTimeline } from "./shipment-timeline"
import { Card, CardHeader, CardTitle, CardContent } from "./card"

const defaultMicroserviceViewerUrl = "https://realtimetracker-vlmx.onrender.com/"
const defaultShipmentParamName = "shipmentId"
const defaultDestinationLatParamName = "destinationLat"
const defaultDestinationLngParamName = "destinationLng"
const defaultModeParamName = "mode"
const viewerModeValue = "viewer"

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

interface TrackingInputProps {
  redirectOnResult?: boolean
  initialCode?: string
}

export function TrackingInput({ redirectOnResult = false, initialCode }: TrackingInputProps) {
  const router = useRouter()
  const [trackingCode, setTrackingCode] = useState(initialCode || "")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveEmbedUrl, setLiveEmbedUrl] = useState<string | null>(null)

  // Auto-search if initialCode is provided
  useEffect(() => {
    if (initialCode) {
      searchTracking(initialCode)
    }
  }, [initialCode])

  const searchTracking = async (code: string) => {
    const cleanCode = code.trim().toUpperCase()

    if (!cleanCode) {
      setError("Por favor ingresá un código de seguimiento")
      return
    }

    try {
      setError(null)
      setResult(null)

      const shipment = await fetchShipmentByIdServer(cleanCode)

      if (!shipment) {
        setError("El código de seguimiento no existe")
        setResult(null)
        return
      }

      const trackings = await fetchTrackingsByShipmentIdServer(shipment.id)

      // Normalize status values to human-readable strings using TimelineStatuses
      const humanizeStatus = (s: any) => {
        if (!s) return s
        if (typeof s !== "string") return s
        // If s is a key like 'OUT_FOR_DELIVERY', map to TimelineStatuses[...] value
        if (s in TimelineStatuses) {
          return (TimelineStatuses as any)[s]
        }
        // Otherwise assume it's already a human string
        return s
      }

      const normalized = (trackings ?? []).map((t: any) => ({
        ...t,
        originalStatus: t.status,
        status: humanizeStatus(t.status),
      }))

      setResult({ shipment, trackings: normalized })
      setLiveTrackingEnabled(false)
      setLiveLoading(false)
      setLiveError(null)
      setLiveEmbedUrl(null)
    } catch (err: any) {
      setError(err?.message || "Error al buscar el envío")
      setResult(null)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = trackingCode.trim().toUpperCase()

    if (!code) {
      setError("Por favor ingresá un código de seguimiento")
      return
    }

    if (redirectOnResult) {
      router.push(`/tracking?code=${code}`)
      return
    }

    await searchTracking(code)
  }

  const getTimelineEvents = () => {
    if (!result?.trackings || !Array.isArray(result.trackings)) return []

    const trackings = [...result.trackings].sort((a: Tracking, b: Tracking) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )

    return trackings
  }

  const isDeliveryToHomeInProgress = () => {
    if (!result?.trackings?.length) return false

    const sorted = [...result.trackings].sort((a: any, b: any) =>
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )

    const latest = sorted[sorted.length - 1]
    const latestStatus = latest?.status?.toLowerCase() || ""
    const latestOriginal = (latest?.originalStatus || "").toString().toUpperCase()

    // Prefer checking enum codes when available for robustness
    const inRoute =
      latestOriginal === "OUT_FOR_DELIVERY" ||
      latestOriginal === "IN_TRANSIT" ||
      latestStatus.includes("reparto") ||
      latestStatus.includes("sal")

    const deliveredOrCanceled =
      latestOriginal === "DELIVERED" ||
      latestOriginal === "CANCELLED" ||
      latestStatus.includes("entregado") ||
      latestStatus.includes("cancelado")

    return inRoute && !deliveredOrCanceled
  }

  const openRealtimeTracking = async () => {
    const nextEnabled = !liveTrackingEnabled
    setLiveTrackingEnabled(nextEnabled)

    if (!nextEnabled) {
      return
    }

    if (!result?.shipment?.id) {
      return
    }

    if (liveEmbedUrl) {
      return
    }

    try {
      setLiveLoading(true)
      setLiveError(null)

      const embeddedUrl = new URL(microserviceViewerUrl)
      embeddedUrl.searchParams.set(shipmentParamName, result.shipment.id)
      //embeddedUrl.searchParams.set(modeParamName, viewerModeValue)

      const destinationAddress = result.shipment.destination?.trim()

      if (destinationAddress) {
        const geocodingUrl = new URL("https://nominatim.openstreetmap.org/search")
        geocodingUrl.searchParams.set("q", destinationAddress)
        geocodingUrl.searchParams.set("format", "json")
        geocodingUrl.searchParams.set("limit", "1")

        const response = await fetch(geocodingUrl.toString(), {
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const payload = (await response.json()) as Array<{ lat: string; lon: string }>
          const first = payload?.[0]

          if (first?.lat && first?.lon) {
            embeddedUrl.searchParams.set(destinationLatParamName, first.lat)
            embeddedUrl.searchParams.set(destinationLngParamName, first.lon)
          } else {
            setLiveError("No pude resolver el domicilio exacto, pero se mostrará el mapa igualmente.")
          }
        } else {
          setLiveError("No pude resolver el domicilio exacto, pero se mostrará el mapa igualmente.")
        }
      }

      setLiveEmbedUrl(embeddedUrl.toString().replace(/%2C/gi, ","))
    } catch {
      setLiveError("No se pudo cargar el seguimiento en tiempo real.")
      setLiveTrackingEnabled(false)
    } finally {
      setLiveLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex w-full items-center gap-3">
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 text-muted-foreground w-5" />
            <input
              type="text"
              placeholder="Ingresá tu código"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="h-14 w-full rounded-full border border-border/50 bg-card pl-12 text-base focus-visible:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-14 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">Seguimiento del Envío</CardTitle>
                <p className="text-sm text-muted-foreground mt-2"><span className="font-medium">Código:</span> {result?.shipment?.id ?? result?.id ?? ''}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                <span className="text-xs font-medium uppercase tracking-wide">
                  {result.trackings?.[0]?.status || 'Procesando'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ShipmentTimeline events={getTimelineEvents()} />

            {isDeliveryToHomeInProgress() && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Seguimiento en tiempo real</p>
                    <p className="text-xs text-muted-foreground">Si querés, podés abrir el mapa en vivo para ver la entrega al domicilio.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openRealtimeTracking}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      liveTrackingEnabled
                        ? "bg-secondary text-foreground hover:bg-secondary/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    {liveTrackingEnabled ? "Ocultar mapa" : "Ver en tiempo real"}
                  </button>
                </div>

                {liveTrackingEnabled && (
                  <div className="mt-4 space-y-2">
                    {liveLoading && <p className="text-xs text-muted-foreground">Cargando mapa en tiempo real...</p>}
                    {liveError && <p className="text-xs text-amber-700">{liveError}</p>}
                    {liveEmbedUrl && (
                      <div className="h-105 overflow-hidden rounded-lg border border-border bg-background">
                        <iframe
                          title="Seguimiento en tiempo real"
                          src={liveEmbedUrl}
                          className="h-full w-full"
                          loading="lazy"
                          allow="geolocation *"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
