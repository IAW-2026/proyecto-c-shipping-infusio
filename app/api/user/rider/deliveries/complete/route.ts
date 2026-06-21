import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { notifyBuyerShipmentStepByEmail } from "@/app/lib/notification-actions"
import { sendPushToUsers } from "@/app/lib/push"

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
      const orderId = (latestTracking as typeof latestTracking & {
        orderId?: string | null
      }).orderId

      if (!orderId) {
        throw new Error("No se encontró orderId asociado al tracking")
      }

      await tx.tracking.updateMany({
        where: { shipmentId, current: true },
        data: { current: false, completed: true },
      })

      // Avisar al Seller Service que la orden fue entregada
      const response = await fetch(
        `${process.env.SELLER_URL}/api/seller/orders/${orderId}/delivered`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.INTERNAL_API_KEY!,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Error notificando entrega al Seller Service: ${response.status}`
        )
      }

      return tx.tracking.create({
        data: {
          shipmentId,
          orderId,
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

    try {
      const ship = assignment.Shipment
      const userIds: string[] = []
      if (ship?.buyerId) userIds.push(ship.buyerId)
      if (ship?.sellerId) userIds.push(ship.sellerId)

      const title = `Actualización de envío ${tracking.shipmentId}`
      const message = `Estado: DELIVERED`
      const url = `/user-profile/tracking?shipmentId=${tracking.shipmentId}`

      await sendPushToUsers(userIds.length ? userIds : undefined, title, message, url)
    } catch (pushErr) {
      console.error('Error enviando push al finalizar entrega:', pushErr)
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
