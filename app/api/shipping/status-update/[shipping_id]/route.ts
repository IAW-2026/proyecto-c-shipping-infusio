import { NextResponse } from "next/server"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"

type ApiShippingStatus =
  | "pending"
  | "prepared"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "incident"

const ALLOWED: ApiShippingStatus[] = [
  "prepared",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
  "incident",
]

function mapToTrackingText(status: ApiShippingStatus) {
  switch (status) {
    case "prepared":
      return "Preparando tu pedido"
    case "dispatched":
      return "Enviado"
    case "in_transit":
      return "En tránsito"
    case "delivered":
      return "Entregado"
    case "cancelled":
      return "Cancelado"
    case "incident":
      return "Incidencia en el envío"
    default:
      return "Actualización"
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ shipping_id: string }> }
) {
  try {
    const { shipping_id } = await params
    const shippingId = shipping_id?.trim().toUpperCase()

    if (!shippingId) {
      return NextResponse.json({ error: "shipping_id is required" }, { status: 400 })
    }

    const shipment = SHIPMENTS.find((s) => s.id === shippingId)

    if (!shipment) {
      return NextResponse.json({ error: "Shipping not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))

    if (!body || typeof body.status !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'status' in body" }, { status: 400 })
    }

    const status = body.status.trim().toLowerCase() as ApiShippingStatus

    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Allowed: ${ALLOWED.join(", ")}` }, { status: 400 })
    }

    const now = new Date().toISOString()
    const trackId = `TRACK${Date.now().toString(36).toUpperCase()}`

    const statusText = mapToTrackingText(status)

    // Heurística simple para current_city: use origin for early states, destination for delivered
    const current_city = status === "delivered" ? shipment.destination : shipment.origin

    const tracking = {
      id: trackId,
      shipment_id: shipment.id,
      status: statusText,
      datetime: now,
      current_city,
      next_city: status === "delivered" ? "Entrega finalizada" : "En ruta",
      // buyer/seller stored on shipment
    }

    SHIPMENT_TRACKINGS.push(tracking)

    // Si se marca como entregado, actualizar fecha de entrega en el shipment
    if (status === "delivered") {
      ;(shipment as any).destination_datetime = now
    }

    return NextResponse.json({ shipping_id: shipment.id, status }, { status: 200 })
  } catch (error) {
    console.error("Error updating shipping status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
