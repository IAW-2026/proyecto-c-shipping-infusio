import { NextResponse } from "next/server"
import { SHIPMENTS, SHIPMENT_TRACKINGS } from "@/app/lib/placeholder-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validación básica
    if (
      !body?.order_id ||
      !body?.buyer_id ||
      !body?.seller_id ||
      !body?.origin_address ||
      !body?.destination_address
    ) {
      return NextResponse.json(
        { error: "Missing required fields: order_id, buyer_id, seller_id, origin_address, destination_address" },
        { status: 400 }
      )
    }

    if (
      typeof body.order_id !== "string" ||
      typeof body.buyer_id !== "string" ||
      typeof body.seller_id !== "string" ||
      typeof body.origin_address.address !== "string" ||
      typeof body.origin_address.postal_code !== "string" ||
      typeof body.destination_address.address !== "string" ||
      typeof body.destination_address.postal_code !== "string"
    ) {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 })
    }

    // Generar IDs simples y normalizar direcciones
    const shippingId = `SHIP${Date.now().toString(36).toUpperCase()}`
    const trackId = `TRACK${Date.now().toString(36).toUpperCase()}`
    const now = new Date().toISOString()
    const origin = `${body.origin_address.address}, ${body.origin_address.postal_code}`
    const destination = `${body.destination_address.address}, ${body.destination_address.postal_code}`

    // Crear shipment y registro inicial
    const shipment = {
      id: shippingId,
      origin,
      destination,
      origin_datetime: now,
      destination_datetime: null,
      order_id: body.order_id,
      buyer_id: body.buyer_id,
      seller_id: body.seller_id,
    }

    const tracking = {
      id: trackId,
      shipment_id: shippingId,
      status: "Pedido confirmado",
      datetime: now,
      current_city: body.origin_address.address,
      next_city: "Centro de Distribución",
      seller_id: body.seller_id,
      buyer_id: body.buyer_id,
    }

    // Mutar los arrays de ejemplo en memoria
    SHIPMENTS.push(shipment)
    SHIPMENT_TRACKINGS.push(tracking)

    return NextResponse.json(
      {
        shipping_id: shippingId,
        status: "pending",
        last_update: now,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating shipment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}