"use client"

import { ArrowRightLeft, CheckCircle2, Package, Truck } from "lucide-react"
import { ShipmentSummary } from "../../lib/definitions"

export function WelcomeLogistics({pendingShipments, deliveredShipments, assignmentCount}: 
    {
        pendingShipments: ShipmentSummary[], 
        deliveredShipments: ShipmentSummary[], 
        assignmentCount: number}) 
{
    return (
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.03),transparent_30%)]" />
        <div className="relative flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">Operador logístico</p>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-foreground">Asignar paquetes y mover cada envío paso a paso</h1>
            <p className="mt-3 max-w-xl text-xs md:text-sm lg:text-base text-muted-foreground">
              Desde esta vista podés vincular cada paquete con un rider disponible, avanzar el estado del shipping y seguir la operación en tiempo real.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:min-w-105">
            <div className="rounded-3xl border border-border bg-background/80 p-3 md:p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-32 md:min-h-33 flex-col items-center justify-center gap-2 md:gap-3 text-center">
                <div className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.28em] text-muted-foreground">Pendientes</p>
                <p className="text-xl md:text-2xl font-semibold text-foreground">{pendingShipments.length}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-3 md:p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-32 md:min-h-33 flex-col items-center justify-center gap-2 md:gap-3 text-center">
                <div className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.28em] text-muted-foreground">Asignados</p>
                <p className="text-xl md:text-2xl font-semibold text-foreground">{assignmentCount}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-3 md:p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-32 md:min-h-33 flex-col items-center justify-center gap-2 md:gap-3 text-center">
                <div className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] md:tracking-[0.28em] text-muted-foreground">Repartiendo</p>
                <p className="text-xl md:text-2xl font-semibold text-foreground">
                  {pendingShipments.filter((shipment) => shipment.latestStatus.toLowerCase().includes("reparto")).length}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background/80 p-3 md:p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex min-h-32 md:min-h-33 flex-col items-center justify-center gap-2 md:gap-3 text-center">
                <div className="flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Entregados</p>
                <p className="text-2xl font-semibold text-foreground">{deliveredShipments.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}