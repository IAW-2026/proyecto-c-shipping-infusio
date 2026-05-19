import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { notifyBuyerShipmentStepByEmail } from "@/app/lib/notification-actions"

type CompleteDeliveryRequest = {
  shipmentId?: string
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = (await request.json()) as CompleteDeliveryRequest
    const shipmentId = body.shipmentId?.trim()

    if (!shipmentId) {
      return NextResponse.json({ error: "shipmentId es requerido" }, { status: 400 })
    }

    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        shipmentId,
        riderId: userId,
      },
      include: {
        Shipment: {
          include: {
            Tracking: {
              orderBy: {
                datetime: "desc",
              },
            },
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "No tenés asignado ese pedido" }, { status: 404 })
    }

    const latestTracking = assignment.Shipment.Tracking[0]

    if (!latestTracking) {
      return NextResponse.json({ error: "No se encontró tracking para el pedido" }, { status: 400 })
    }

    if (latestTracking.status === "DELIVERED") {
      return NextResponse.json({ error: "Ese pedido ya fue entregado" }, { status: 409 })
    }

    if (latestTracking.status !== "OUT_FOR_DELIVERY") {
      return NextResponse.json(
        { error: "Solo podés finalizar pedidos que estén en reparto" },
        { status: 400 }
      )
    }

    const now = new Date()

    const tracking = await prisma.$transaction(async (tx) => {
      await tx.tracking.updateMany({
        where: { shipmentId, current: true },
        data: { current: false, completed: true },
      })

      return tx.tracking.create({
        data: {
          shipmentId,
          datetime: now,
          status: "DELIVERED",
          currentCity: latestTracking.nextCity ?? latestTracking.currentCity ?? assignment.Shipment.destination,
          nextCity: assignment.Shipment.destination,
          completed: true,
          current: true,
        },
      })
    })

    try {
      await notifyBuyerShipmentStepByEmail({
        shipmentId: tracking.shipmentId,
        status: "DELIVERED",
      })
    } catch (notificationError) {
      console.error("No se pudo enviar la notificación por email:", notificationError)
    }

    return NextResponse.json(
      {
        shipmentId: tracking.shipmentId,
        status: tracking.status,
        datetime: tracking.datetime.toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error finalizando entrega del rider:", error)
    return NextResponse.json({ error: "Error al finalizar la entrega" }, { status: 500 })
  }
}
