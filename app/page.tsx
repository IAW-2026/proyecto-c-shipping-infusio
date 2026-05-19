import { TrackingInput } from "./ui/utils/tracking-input"
import { Truck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/utils/card"
import { ShipmentTimeline } from "./ui/utils/shipment-timeline"
import { QuickActions } from "./ui/utils/quick-actions"
import { timelineEvents } from "@/app/lib/timeline-data"

export default async function ShippingApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">       
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-16 lg:px-8 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-medium mb-3 sm:mb-4">
                Seguimiento de Envíos
              </p>
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-foreground text-balance">
                Tu pedido, siempre a la vista.
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-lg">
                Ingresá a tu cuenta y rastreá cada paso.
              </p>
              
              <div className="mt-8">
                <TrackingInput redirectOnResult={true} />
              </div>
            </div>

            {/* Featured Order Card */}
            <div className="relative">
              <Card>
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-16 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-primary font-medium mb-2">Acciones Rápidas</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground">¿Qué necesitás?</h2>
        </div>
        <QuickActions />
      </section>
    </div>
  )
}

