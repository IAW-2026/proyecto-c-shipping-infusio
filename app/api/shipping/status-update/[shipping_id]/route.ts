import { NextRequest, NextResponse } from "next/server"
import { validateApiKeysMiddleware } from "@/app/lib/api-key-validation"
import { prisma } from "@/app/lib/prisma"
import { TimelineStatuses } from "@/app/lib/definitions"
import { notifyBuyerShipmentStepByEmail } from "@/app/lib/notification-actions"

type StatusUpdateRequest = {
  status: keyof typeof TimelineStatuses
}

const allowedStatuses = Object.keys(TimelineStatuses) as Array<keyof typeof TimelineStatuses>

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shipping_id: string }> }
) {
  try {
    const authError = validateApiKeysMiddleware(request, [
      process.env.INTERNAL_API_KEY,
      process.env.SELLER,
    ])
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
    const isTerminal =
      body.status === "DELIVERED" || body.status === "CANCELLED" || body.status === "WITH_ISSUE"

    await prisma.$transaction(async (tx) => {
      await tx.tracking.updateMany({
        where: { shipmentId: shipping_id, current: true },
        data: { current: false, completed: true },
      })

      await tx.tracking.create({
        data: {
          shipmentId: shipping_id,
          datetime: now,
          status: body.status!,
          currentCity: latestTracking?.nextCity ?? latestTracking?.currentCity ?? shipment.origin,
          nextCity: shipment.destination,
          completed: isTerminal,
          current: true,
        },
      })
    })

    try {
      await notifyBuyerShipmentStepByEmail({
        shipmentId: shipping_id,
        status: body.status,
      })
    } catch (notificationError) {
      console.error("No se pudo enviar la notificación por email:", notificationError)
    }

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
