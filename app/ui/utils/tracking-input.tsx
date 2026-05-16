"use client"

import { Search, AlertCircle, Radio } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ShipmentTimeline } from "./shipment-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

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

const modeParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_MODE_PARAM ??
  defaultModeParamName

interface TrackingInputProps {
  redirectOnResult?: boolean
  initialCode?: string
}

type Shipment = {
  id: string
  destination?: string | null
  origin?: string | null
}

type Tracking = {
  shipment_id: string
  status: string
  datetime: string
  current_city: string
  next_city?: string | null
}

type ApiResponse = {
  shipments?: Shipment[]
  trackings?: Tracking[]
}

export function TrackingInput({ redirectOnResult = false, initialCode }: TrackingInputProps) {
  const router = useRouter()
  const [trackingCode, setTrackingCode] = useState(initialCode || "")
  const [result, setResult] = useState<{ shipment: Shipment; trackings: Tracking[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const [liveEmbedUrl, setLiveEmbedUrl] = useState<string | null>(null)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [allTrackings, setAllTrackings] = useState<Tracking[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoadingData(true)
        const res = await fetch("/api/shipments")

        if (!res.ok) {
          throw new Error("Failed to load shipments")
        }

        const json = (await res.json()) as ApiResponse

        if (!mounted) return

        setShipments(json.shipments ?? [])
        setAllTrackings(json.trackings ?? [])
      } catch (loadError) {
        console.error("Error loading shipments:", loadError)
        if (!mounted) return
        setError("No se pudieron cargar los envíos para búsqueda")
      } finally {
        if (mounted) {
          setLoadingData(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (initialCode && !loadingData && shipments.length > 0 && allTrackings.length > 0) {
      searchTracking(initialCode)
    }
    // The search function intentionally depends on current shipment data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, loadingData, shipments.length, allTrackings.length])

  const searchTracking = (code: string) => {
    const cleanCode = code.trim().toUpperCase()

    if (!cleanCode) {
      setError("Por favor ingresá un código de seguimiento")
      return
    }

    const shipment = shipments.find((item) => item.id === cleanCode)

    if (!shipment) {
      setError("El código de seguimiento no existe")
      setResult(null)
      return
    }

    const relevantTrackings = allTrackings.filter((tracking) => tracking.shipment_id === cleanCode)
    setResult({ shipment, trackings: relevantTrackings })
    setError(null)
    setLiveTrackingEnabled(false)
    setLiveLoading(false)
    setLiveError(null)
    setLiveEmbedUrl(null)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = trackingCode.trim().toUpperCase()

    if (!code) {
      setError("Por favor ingresá un código de seguimiento")
      return
    }

    const shipment = shipments.find((item) => item.id === code)

    if (!shipment) {
      setError("El código de seguimiento no existe")
      setResult(null)
      return
    }

    if (redirectOnResult) {
      router.push(`/user-profile/tracking?code=${code}`)
      return
    }

    searchTracking(code)
  }

  const getTimelineEvents = () => {
    if (!result?.trackings?.length) return []

    const sortedTrackings = [...result.trackings].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )

    const lastIndex = sortedTrackings.length - 1

    return sortedTrackings.map((tracking, index) => {
      const date = new Date(tracking.datetime)
      const dateStr = date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      const timeStr = date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      const isCompleted = !["pendiente", "preparado", "despachado"].includes(tracking.status.toLowerCase())

      return {
        status: tracking.status,
        location: tracking.current_city,
        date: dateStr,
        time: timeStr,
        completed: isCompleted,
        current: index === lastIndex && !["entregado", "cancelado"].includes(tracking.status.toLowerCase()),
      }
    })
  }

  const isDeliveryToHomeInProgress = () => {
    if (!result?.trackings?.length) return false

    const sorted = [...result.trackings].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

    const latestStatus = sorted[sorted.length - 1]?.status?.toLowerCase() || ""
    const inRoute = latestStatus.includes("reparto") || latestStatus.includes("sal")
    const deliveredOrCanceled = latestStatus.includes("entregado") || latestStatus.includes("cancelado")

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
      embeddedUrl.searchParams.set(modeParamName, viewerModeValue)

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
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ingresá tu código de seguimiento..."
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value)}
              className="h-14 w-full rounded-full border border-border/50 bg-card pl-12 text-base focus-visible:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-14 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Buscar
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-xl">Seguimiento del Envío</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium">Código:</span> {result.shipment.id}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-primary-foreground">
                <span className="text-xs font-medium uppercase tracking-wide">
                  {result.trackings[result.trackings.length - 1]?.status || "Procesando"}
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
                    <p className="text-xs text-muted-foreground">
                      Si querés, podés abrir el mapa en vivo para ver la entrega al domicilio.
                    </p>
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
