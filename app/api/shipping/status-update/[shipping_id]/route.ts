import { NextRequest, NextResponse } from "next/server"
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation"
import { prisma } from "@/app/lib/prisma"

type ExternalShippingStatus =
  | "prepared"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "incident"

type StatusUpdateRequest = {
  status: ExternalShippingStatus
}

const allowedStatuses: ExternalShippingStatus[] = [
  "prepared",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
  "incident",
]

function toInternalStatus(status: ExternalShippingStatus) {
  if (status === "prepared") return "PREPARING"
  if (status === "dispatched") return "OUT_FOR_DELIVERY"
  if (status === "in_transit") return "IN_TRANSIT"
  if (status === "delivered") return "DELIVERED"
  if (status === "cancelled") return "CANCELLED"
  return "WITH_ISSUE"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shipping_id: string }> }
) {
  try {
    const authError = validateApiKeyMiddleware(request)
    if (authError) return authError

    const { shipping_id } = await params
    const body = (await request.json()) as Partial<StatusUpdateRequest>

    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "status inválido" },
        { status: 400 }
      )
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipping_id } })

    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    const latestTracking = await prisma.tracking.findFirst({
      where: { shipmentId: shipping_id },
      orderBy: { datetime: "desc" },
    })

    const now = new Date()
    const isTerminal = body.status === "delivered" || body.status === "cancelled" || body.status === "incident"

    await prisma.$transaction(async (tx) => {
      await tx.tracking.updateMany({
        where: { shipmentId: shipping_id, current: true },
        data: { current: false, completed: true },
      })

      await tx.tracking.create({
        data: {
          shipmentId: shipping_id,
          datetime: now,
          status: toInternalStatus(body.status!),
          currentCity: latestTracking?.nextCity ?? latestTracking?.currentCity ?? shipment.origin,
          nextCity: shipment.destination,
          completed: isTerminal,
          current: true,
        },
      })
    })

    return NextResponse.json(
      {
        shipping_id,
        status: body.status,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error actualizando estado del envío:", error)
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}
