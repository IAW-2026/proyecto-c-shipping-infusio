"use client"

import { Search, AlertCircle } from "lucide-react"
import { useState, FormEvent } from "react"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"
import { ShipmentTimeline } from "./shipment-timeline"
import { Card, CardHeader, CardTitle, CardContent } from "./card"

export function TrackingInput() {
  const [trackingCode, setTrackingCode] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const code = trackingCode.trim().toUpperCase()

    if (!code) {
      setError("Por favor ingresá un código de seguimiento")
      return
    }

    const shipment = SHIPMENTS.find(s => s.id === code)
    
    if (!shipment) {
      setError("El código de seguimiento no existe")
      setResult(null)
      return
    }

    const trackings = SHIPMENT_TRACKINGS.filter(t => t.shipment_id === code)
    setResult({ shipment, trackings })
    setError(null)
  }

  const getTimelineEvents = () => {
    if (!result?.trackings) return []
    
    const trackings = result.trackings.sort((a: any, b: any) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    
    // Find the last tracking to determine if it's current
    const lastIndex = trackings.length - 1
    
    return trackings.map((tracking: any, index: number) => {
      const date = new Date(tracking.datetime)
      const dateStr = date.toLocaleDateString("es-AR", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
      const timeStr = date.toLocaleTimeString("es-AR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      })
      
      // Check if shipment is completed by looking at the status
      const isCompleted = !['pendiente', 'preparado', 'despachado'].includes(tracking.status.toLowerCase())
      
      return {
        status: tracking.status,
        location: tracking.current_city,
        date: dateStr,
        time: timeStr,
        completed: isCompleted,
        current: index === lastIndex && !['entregado', 'cancelado'].includes(tracking.status.toLowerCase())
      }
    })
  }

  return (
    <div className="w-full space-y-6">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex w-full items-center gap-3">
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 text-muted-foreground w-5" />
            <input
              type="text"
              placeholder="Ingresá tu código de seguimiento..."
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
                <p className="text-sm text-muted-foreground mt-2"><span className="font-medium">Código:</span> {result.shipment.id}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                <span className="text-xs font-medium uppercase tracking-wide">
                  {result.trackings[result.trackings.length - 1]?.status || 'Procesando'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ShipmentTimeline events={getTimelineEvents()} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
