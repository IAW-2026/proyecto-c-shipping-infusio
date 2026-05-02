import { TrackingInput } from "./ui/tracking-input"
import { Truck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { ShipmentTimeline } from "./ui/shipment-timeline"

const timelineEvents = [
  {
    status: "Pedido confirmado",
    location: "Tienda Online Infusio",
    date: "24 Abril 2026",
    time: "10:30",
    completed: true
  },
  {
    status: "Preparando tu pedido",
    location: "Centro de Distribución - Palermo",
    date: "24 Abril 2026",
    time: "14:15",
    completed: true
  },
  {
    status: "Enviado",
    location: "Centro de Distribución - Palermo",
    date: "25 Abril 2026",
    time: "09:00",
    completed: true
  },
  {
    status: "En tránsito hacia tu ciudad",
    location: "Centro Logístico - Bahía Blanca",
    date: "26 Abril 2026",
    time: "08:45",
    completed: true,
    current: true
  },
  {
    status: "En reparto",
    location: "Tu zona",
    date: "Pendiente",
    time: "--:--",
    completed: false
  },
  {
    status: "Entregado",
    location: "Tu dirección",
    date: "Pendiente",
    time: "--:--",
    completed: false
  }
]

export default function ShippingApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">       
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
                Seguimiento de Envíos
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-foreground text-balance">
                Tu pedido, siempre a la vista.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg">
                Rastreá cada paso.
              </p>
              
              <div className="mt-8">
                <TrackingInput />
              </div>
            </div>

            {/* Featured Order Card */}
            <div className="relative">
              <Card className="border-border/50 shadow-lg bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-xl">Pedido Activo</CardTitle>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                      <span className="text-xs font-medium uppercase tracking-wide">En Camino</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ShipmentTimeline events={timelineEvents} />
                </CardContent>
              </Card>

              {/* Badge */}
              <div className="absolute -bottom-4 -left-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <div>
                    <p className="text-xs font-medium">Trazabilidad</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {/* <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Acciones Rápidas</p>
          <h2 className="font-serif text-3xl font-medium text-foreground">¿Qué necesitas?</h2>
        </div>
        <QuickActions />
      </section> */}
    </div>
  )
}
