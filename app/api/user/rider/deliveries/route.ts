import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type TrackingRow = {
  shipmentId: string;
  datetime: Date;
  status: string;
};

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const deliveries = await prisma.deliveryAssignment.findMany({
      where: {
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
      orderBy: {
        id: "asc",
      },
    });

    const shipments = deliveries.map((delivery) => {
      const trackingRows = delivery.Shipment.Tracking as TrackingRow[];
      const latestTracking = trackingRows[0];

      return {
        deliveryAssignmentId: delivery.id,
        shipmentId: delivery.Shipment.id,
        origin: delivery.Shipment.origin,
        destination: delivery.Shipment.destination,
        latestStatus: latestTracking?.status ?? "Sin novedades",
        latestDatetime:
          latestTracking?.datetime?.toISOString() ?? delivery.Shipment.originDatetime.toISOString(),
      };
    });

    return NextResponse.json({ shipments }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo entregas del rider:", error);
    return NextResponse.json({ error: "Error al obtener entregas" }, { status: 500 });
  }
}