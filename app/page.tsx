import { TrackingInput } from "./ui/tracking-input"

export default function Home() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">      
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-[55vh] lg:min-h-[60vh]">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-start px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-12">
          <div className="w-full">
            <div className="w-full">
              <h1 className="font-serif text-3xl font-medium leading-tight text-foreground text-balance sm:text-4xl md:text-5xl lg:text-6xl">
                Tu pedido, siempre a la vista.
              </h1>
              <p className="mt-4 max-w-lg text-base text-muted-foreground sm:mt-6 sm:text-lg">
                Rastrea cada paso de tu compra.
              </p>
              
              <div className="mt-6 w-full sm:mt-8">
                <TrackingInput />
              </div>
            </div>

            {/* Featured Order Card */}
            {/*<div className="relative">
              <Card className="border-border/50 shadow-lg bg-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-xl">Pedido Activo</CardTitle>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
                      <Sun className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">En Camino</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ShipmentTimeline events={timelineEvents} />
                </CardContent>
              </Card> */}

              {/* Badge
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground px-6 py-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-80">Est. 2024</p>
                    <p className="text-sm font-medium">Envío Sustentable</p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Active Shipments */}
      {/* <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Tus Pedidos</p>
            <h2 className="font-serif text-3xl font-medium text-foreground">Envíos Recientes</h2>
          </div>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors uppercase tracking-wide">
            Ver Todo →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.orderNumber} {...shipment} />
          ))}
        </div>
      </section> */}

      {/* Quick Actions */}
    </div>
  )
}
