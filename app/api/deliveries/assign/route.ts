import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { sendPushToUsers } from "@/app/lib/push";

// Prisma enum values for Tracking.status (match schema TimelineStatuses)
const LINKABLE_STATUS = "ARRIVED_CITY";
const NEXT_STATUS = "OUT_FOR_DELIVERY";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await request.json();
    const { id, shipmentId, riderId } = body;

    if (!id || !shipmentId || !riderId) {
      return NextResponse.json({ error: "id, shipmentId y riderId son requeridos" }, { status: 400 });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return NextResponse.json({ error: "Shipment no encontrado" }, { status: 404 });

    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) return NextResponse.json({ error: "Rider no encontrado" }, { status: 404 });
    if (rider.status !== "activo") return NextResponse.json({ error: "Rider inactivo" }, { status: 400 });

    const latestTracking = await prisma.tracking.findFirst({ where: { shipmentId }, orderBy: { datetime: "desc" } });
    if (!latestTracking) return NextResponse.json({ error: "Tracking no encontrado" }, { status: 400 });
    if (latestTracking.status !== LINKABLE_STATUS) return NextResponse.json({ error: "Solo se pueden vincular paquetes con status ARRIVED_CITY" }, { status: 400 });

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      await tx.tracking.updateMany({ where: { shipmentId, current: true }, data: { current: false, completed: true } });

      const tracking = await tx.tracking.create({
        data: {
          shipmentId,
          orderId: latestTracking.orderId,
          datetime: now,
          status: NEXT_STATUS,
          currentCity: latestTracking.nextCity || latestTracking.currentCity || shipment.origin,
          nextCity: shipment.destination,
          completed: false,
          current: true,
        },
      });

      const delivery = await tx.deliveryAssignment.create({
        data: {
          id,
          shipmentId,
          riderId,
          logisticOperatorId: userId,
        },
        include: { Rider: true, Shipment: true },
      });

      return { delivery, tracking };
    });

    // Enviar push a buyer y seller del shipment si existen
    try {
      const userIds: string[] = []
      if (result.tracking && result.delivery && result.delivery.Shipment) {
        const ship = result.delivery.Shipment
        if (ship.buyerId) userIds.push(ship.buyerId)
        if (ship.sellerId) userIds.push(ship.sellerId)
      }

      const title = `Actualización de envío ${result.tracking?.shipmentId}`
      const message = `Estado: ${result.tracking?.status}`
      const url = `/user-profile/tracking?shipmentId=${result.tracking?.shipmentId}`

      await sendPushToUsers(userIds.length ? userIds : undefined, title, message, url)
    } catch (e) {
      console.error('Error enviando notificaciones push en assign:', e)
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creando delivery assignment (assign route):", error);
    const message = error instanceof Error ? error.message : String(error);
    // In non-production, return the error message to help debugging the client-side flow
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ error: `Error al crear assignment: ${message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Error al crear assignment" }, { status: 500 });
  }
}
