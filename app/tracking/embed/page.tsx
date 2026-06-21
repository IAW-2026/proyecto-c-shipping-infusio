"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Shipment, Tracking } from "@/app/lib/definitions"
import { fetchShipmentByIdServer } from "@/app/lib/shipment-actions"
import { fetchTrackingsByShipmentIdServer } from "@/app/lib/tracking-actions"
import { TimelineStatuses } from "@/app/lib/definitions"
import { ShipmentTimeline } from "@/app/ui/utils/shipment-timeline"
import { AlertCircle } from "lucide-react"

function EmbedTimelineContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [trackings, setTrackings] = useState<Tracking[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) {
      setError("Código de seguimiento requerido")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setError(null)
        const cleanCode = code.trim().toUpperCase()

        const foundShipment = await fetchShipmentByIdServer(cleanCode)
        if (!foundShipment) {
          setError("El código de seguimiento no existe")
          setShipment(null)
          setTrackings([])
          return
        }

        setShipment(foundShipment)

        const trackingData = await fetchTrackingsByShipmentIdServer(foundShipment.id)

        const normalized = (trackingData ?? []).map((t: any) => ({
          ...t,
          status: typeof t.status === "string" && t.status in TimelineStatuses
            ? (TimelineStatuses as any)[t.status]
            : t.status,
        }))

        const sorted = [...normalized].sort(
          (a: Tracking, b: Tracking) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        )

        setTrackings(sorted)
      } catch (err: any) {
        setError(err?.message || "Error al cargar el seguimiento")
        setShipment(null)
        setTrackings([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [code])

  if (loading) {
    return <div className="p-3 text-center text-sm text-muted-foreground">Cargando...</div>
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-3 text-xs text-destructive">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p>{error}</p>
      </div>
    )
  }

  if (!trackings.length) {
    return null
  }

  const latestTracking = trackings[trackings.length - 1]
  const statusLabel = (latestTracking?.status || "Procesando").toString().toUpperCase()

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-5">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium leading-tight text-foreground">
            Seguimiento del Envío
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Código: {shipment?.id ?? code ?? ""}</p>
        </div>

        <div className="rounded-lg bg-[#727757] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
          {statusLabel}
        </div>
      </div>

      <ShipmentTimeline events={trackings} />
    </div>
  )
}

export default function TrackingEmbedPage() {
  return (
    <Suspense fallback={<div className="p-3 text-sm text-muted-foreground">Cargando...</div>}>
      <div className="min-h-screen bg-background p-2 sm:p-3">
        <EmbedTimelineContent />
      </div>
    </Suspense>
  )
}
