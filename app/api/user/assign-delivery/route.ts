import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, shipmentId, riderId, logisticOperatorId } = body;

    if (!id || !shipmentId) {
      return NextResponse.json({ error: "id y shipmentId son requeridos" }, { status: 400 });
    }

    // Verificar shipment
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) return NextResponse.json({ error: "Shipment no encontrado" }, { status: 404 });

    // Si se proporciona riderId, verificar
    if (riderId) {
      const rider = await prisma.rider.findUnique({ where: { id: riderId } });
      if (!rider) return NextResponse.json({ error: "Rider no encontrado" }, { status: 404 });
    }

    // Si se proporciona logisticOperatorId, verificar que exista
    if (logisticOperatorId) {
      const operator = await prisma.logisticOperator.findUnique({ where: { id: logisticOperatorId } });
      if (!operator) return NextResponse.json({ error: "LogisticOperator no encontrado" }, { status: 404 });
    }

    // Buscar assignment existente por shipmentId
    const existing = await prisma.deliveryAssignment.findFirst({ where: { shipmentId } });

    if (existing) {
      const updated = await prisma.deliveryAssignment.update({
        where: { id: existing.id },
        data: {
          riderId: riderId ?? existing.riderId,
          logisticOperatorId: logisticOperatorId ?? existing.logisticOperatorId,
        },
      });

      return NextResponse.json({ delivery: updated }, { status: 200 });
    }

    const delivery = await prisma.deliveryAssignment.create({
      data: {
        id,
        shipmentId,
        riderId: riderId ?? null,
        logisticOperatorId: logisticOperatorId ?? null,
      },
    });

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    console.error("Error en /api/user/assign-delivery:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
