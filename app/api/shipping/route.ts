import { NextRequest, NextResponse } from "next/server"
import { validateAnyApiKeyMiddleware } from "@/app/lib/api-key-validation"
import { prisma } from "@/app/lib/prisma"

type CreateShippingRequest = {
  order_id: string
  buyer_id: string
  seller_id?: string
  origin_address: {
    address: string
    postal_code: string
  }
  destination_address: {
    address: string
    postal_code: string
  }
}

function buildShippingId() {
  return `SHIP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  try {
    const authError = validateAnyApiKeyMiddleware(request, [
      process.env.INTERNAL_API_KEY,
      process.env.BUYER,
      process.env.SELLER,
    ])
    if (authError) return authError

    const body = (await request.json()) as Partial<CreateShippingRequest>

    if (
      !body.order_id ||
      !body.buyer_id ||
      !body.origin_address?.address ||
      !body.origin_address?.postal_code ||
      !body.destination_address?.address ||
      !body.destination_address?.postal_code
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos para crear el envío" },
        { status: 400 }
      )
    }

    const shippingId = buildShippingId()
    const now = new Date()

    await prisma.$transaction(async (tx) => {
      await tx.shipment.create({
        data: {
          id: shippingId,
          origin: `${body.origin_address!.address} (${body.origin_address!.postal_code})`,
          destination: `${body.destination_address!.address} (${body.destination_address!.postal_code})`,
          originDatetime: now,
          destinationDatetime: now,
          buyerId: body.buyer_id!,
          sellerId: body.seller_id ?? body.buyer_id!,
        },
      })

      await tx.tracking.create({
        data: {
          shipmentId: shippingId,
          datetime: now,
          status: "CONFIRMED",
          currentCity: body.origin_address!.address,
          nextCity: body.destination_address!.address,
          completed: false,
          current: true,
        },
      })
    })

    return NextResponse.json({ shipping_id: shippingId, status: "pending" }, { status: 201 })
  } catch (error) {
    console.error("Error creando envío:", error)
    return NextResponse.json({ error: "Error al crear envío" }, { status: 500 })
  }
}
