"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, BadgeCheck, Filter, PackageSearch, ShoppingCart, Store } from "lucide-react"
import NotAuth from "@/app/ui/not-auth"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"

type FilterRole = "all" | "buyer" | "seller"

type OrderHistoryRow = {
  id: string
  origin: string
  destination: string
  originDatetime: string
  destinationDatetime: string | null
  status: string
  datetime: string
  currentCity: string
  nextCity: string
  buyerId: string | null
  sellerId: string | null
}

function normalizeFilterRole(value: string | null): FilterRole {
  if (value === "buyer" || value === "seller") {
    return value
  }

  return "all"
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin fecha"
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function buildFilterHref(role: FilterRole) {
  return role === "all" ? "/user-profile/history" : `/user-profile/history?role=${role}`
}

function getLatestTrackingByShipment() {
  const latestTrackings = new Map<string, (typeof SHIPMENT_TRACKINGS)[number]>()

  for (const tracking of SHIPMENT_TRACKINGS) {
    const current = latestTrackings.get(tracking.shipment_id)

    if (!current || new Date(tracking.datetime).getTime() > new Date(current.datetime).getTime()) {
      latestTrackings.set(tracking.shipment_id, tracking)
    }
  }

  return latestTrackings
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const activeRole = normalizeFilterRole(searchParams.get("role"))

  const orders = useMemo<OrderHistoryRow[]>(() => {
    if (!user) {
      return []
    }

    const latestTrackings = getLatestTrackingByShipment()

    return SHIPMENTS.map((shipment) => {
      const tracking = latestTrackings.get(shipment.id)

      return {
        id: shipment.id,
        origin: shipment.origin,
        destination: shipment.destination,
        originDatetime: shipment.origin_datetime,
        destinationDatetime: shipment.destination_datetime,
        status: tracking?.status ?? "Pedido confirmado",
        datetime: tracking?.datetime ?? shipment.origin_datetime,
        currentCity: tracking?.current_city ?? shipment.origin,
        nextCity: tracking?.next_city ?? shipment.destination,
        buyerId: shipment.buyer_id ?? null,
        sellerId: shipment.seller_id ?? null,
      }
    }).filter((order) => {
      const isBuyer = order.buyerId === user.id
      const isSeller = order.sellerId === user.id

      if (!isBuyer && !isSeller) {
        return false
      }

      if (activeRole === "buyer") {
        return isBuyer
      }

      if (activeRole === "seller") {
        return isSeller
      }

      return true
    })
  }, [activeRole, user])

  const buyerOrders = orders.filter((order) => order.buyerId === user?.id)
  const sellerOrders = orders.filter((order) => order.sellerId === user?.id)

  if (!isLoaded) {
    return (
      <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-10 lg:px-8">
        <p className="text-sm text-muted-foreground">Cargando historial...</p>
      </div>
    )
  }

  if (!user) {
    return <NotAuth />
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,111,76,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(107,112,86,0.06),transparent_30%)]" />

        <div className="relative flex flex-col gap-8">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Tu cuenta</p>
            <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">Historial de pedidos</h1>
            <p className="mt-3 text-muted-foreground">
              La vista solo toma pedidos asociados al usuario autenticado y te deja alternar entre tu participación como comprador o vendedor.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Total visible</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{orders.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Como comprador</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{buyerOrders.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Como vendedor</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{sellerOrders.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/80 p-2 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtrar por rol
            </div>
            <Link
              href={buildFilterHref("all")}
              aria-current={activeRole === "all" ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeRole === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Todos
            </Link>
            <Link
              href={buildFilterHref("buyer")}
              aria-current={activeRole === "buyer" ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeRole === "buyer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Comprador
            </Link>
            <Link
              href={buildFilterHref("seller")}
              aria-current={activeRole === "seller" ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeRole === "seller"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <Store className="h-4 w-4" />
              Vendedor
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-sm">
            <PackageSearch className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-serif text-2xl font-medium text-foreground">No hay pedidos para mostrar</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Ahora la pantalla queda lista a nivel visual. Cuando conectemos los datos reales, vas a ver acá los pedidos del usuario autenticado.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const isBuyer = order.buyerId === user.id
              const isSeller = order.sellerId === user.id

              return (
                <article key={order.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-xl font-medium text-foreground">Pedido {order.id}</h2>
                        {isBuyer ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Buyer
                          </span>
                        ) : null}
                        {isSeller ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                            <Store className="h-3.5 w-3.5" />
                            Seller
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Última actualización: {formatDateTime(order.datetime)}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground">
                      <p className="font-medium text-muted-foreground">Estado actual</p>
                      <p className="mt-1 font-semibold">{order.status}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Origen</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>Destino</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-foreground">{order.origin}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{order.destination}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Punto actual</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{order.currentCity}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Siguiente parada: {order.nextCity}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Fechas</p>
                        <p className="mt-2 text-sm font-medium text-foreground">Salida: {formatDateTime(order.originDatetime)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Entrega prevista: {formatDateTime(order.destinationDatetime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Pedido visible solo para el usuario autenticado que coincide con buyer o seller.
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}