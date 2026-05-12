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

function normalizeStatus(rawStatus: string): ApiShippingStatus {
  const status = rawStatus.trim().toLowerCase()

  if (status.includes("pedido confirmado") || status === "pendiente" || status === "pending") {
    return "pending"
  }

  if (status.includes("preparando") || status === "preparado" || status === "prepared") {
    return "prepared"
  }

  if (status.includes("enviado") || status === "despachado" || status === "dispatched") {
    return "dispatched"
  }

  if (
    status.includes("en tránsito") ||
    status.includes("en transito") ||
    status.includes("reparto") ||
    status === "in_transit"
  ) {
    return "in_transit"
  }

  if (status.includes("entregado") || status === "delivered") {
    return "delivered"
  }

  if (status.includes("cancelado") || status === "cancelled") {
    return "cancelled"
  }

  if (status.includes("incidencia") || status === "incident") {
    return "incident"
  }

  return "pending"
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shipping_id: string }> }
) {
  try {
    const { shipping_id } = await params
    const shippingId = shipping_id?.trim().toUpperCase()

    if (!shippingId) {
      return NextResponse.json(
        { error: "shipping_id is required" },
        { status: 400 }
      )
    }

    const shipment = SHIPMENTS.find((s) => s.id === shippingId)

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipping not found" },
        { status: 404 }
      )
    }

    const trackingEvents = SHIPMENT_TRACKINGS
      .filter((t) => t.shipment_id === shipment.id)
      .sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      )

    if (trackingEvents.length === 0) {
      return NextResponse.json(
        {
          shipping_id: shipment.id,
          status: "pending",
          last_update: shipment.origin_datetime,
          current_city: shipment.origin,
        },
        { status: 200 }
      )
    }

    const latest = trackingEvents[0]

    return NextResponse.json(
      {
        shipping_id: shipment.id,
        status: normalizeStatus(latest.status),
        last_update: latest.datetime,
        current_city: latest.current_city,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching shipping status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}