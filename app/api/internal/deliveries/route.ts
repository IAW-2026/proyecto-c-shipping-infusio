import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";
import { prisma } from "@/app/lib/prisma";

// GET - Obtener delivery assignments
export async function GET(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!) ||;
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const shipmentId = searchParams.get("shipmentId");
    const riderId = searchParams.get("riderId");
    const logisticOperatorId = searchParams.get("logisticOperatorId");

    if (id) {
      const delivery = await prisma.deliveryAssignment.findUnique({
        where: { id },
        include: {
          Shipment: true,
          Rider: true,
          LogisticOperator: true,
        },
      });

      if (!delivery) {
        return NextResponse.json(
          { error: "DeliveryAssignment no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ delivery }, { status: 200 });
    }

    const where: any = {};
    if (shipmentId) where.shipmentId = shipmentId;
    if (riderId) where.riderId = riderId;
    if (logisticOperatorId) where.logisticOperatorId = logisticOperatorId;

    const deliveries = await prisma.deliveryAssignment.findMany({
      where,
      include: {
        Shipment: true,
        Rider: true,
        LogisticOperator: true,
      },
    });

    return NextResponse.json({ deliveries }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo delivery assignments:", error);
    return NextResponse.json(
      { error: "Error al obtener delivery assignments" },
      { status: 500 }
    );
  }
}

// POST - Crear delivery assignment
export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const body = await request.json();
    const { id, shipmentId, riderId, logisticOperatorId } = body;

    if (!id || !shipmentId) {
      return NextResponse.json(
        { error: "id y shipmentId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el shipment existe
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment no encontrado" },
        { status: 404 }
      );
    }

    // Si se proporciona riderId, verificar que existe
    if (riderId) {
      const rider = await prisma.rider.findUnique({
        where: { id: riderId },
      });
      if (!rider) {
        return NextResponse.json(
          { error: "Rider no encontrado" },
          { status: 404 }
        );
      }
    }

    // Si se proporciona logisticOperatorId, verificar que existe
    if (logisticOperatorId) {
      const operator = await prisma.logisticOperator.findUnique({
        where: { id: logisticOperatorId },
      });
      if (!operator) {
        return NextResponse.json(
          { error: "LogisticOperator no encontrado" },
          { status: 404 }
        );
      }
    }

    const delivery = await prisma.deliveryAssignment.create({
      data: {
        id,
        shipmentId,
        riderId: riderId || null,
        logisticOperatorId: logisticOperatorId || null,
      },
      include: {
        Shipment: true,
        Rider: true,
        LogisticOperator: true,
      },
    });

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    console.error("Error creando delivery assignment:", error);
    return NextResponse.json(
      { error: "Error al crear delivery assignment" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar delivery assignment
export async function PUT(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const body = await request.json();
    const { id, riderId, logisticOperatorId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de delivery assignment requerido" },
        { status: 400 }
      );
    }

    // Si se proporciona riderId, verificar que existe
    if (riderId) {
      const rider = await prisma.rider.findUnique({
        where: { id: riderId },
      });
      if (!rider) {
        return NextResponse.json(
          { error: "Rider no encontrado" },
          { status: 404 }
        );
      }
    }

    // Si se proporciona logisticOperatorId, verificar que existe
    if (logisticOperatorId) {
      const operator = await prisma.logisticOperator.findUnique({
        where: { id: logisticOperatorId },
      });
      if (!operator) {
        return NextResponse.json(
          { error: "LogisticOperator no encontrado" },
          { status: 404 }
        );
      }
    }

    const delivery = await prisma.deliveryAssignment.update({
      where: { id },
      data: {
        ...(riderId !== undefined && { riderId }),
        ...(logisticOperatorId !== undefined && { logisticOperatorId }),
      },
      include: {
        Shipment: true,
        Rider: true,
        LogisticOperator: true,
      },
    });

    return NextResponse.json({ delivery }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando delivery assignment:", error);
    return NextResponse.json(
      { error: "Error al actualizar delivery assignment" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar delivery assignment
export async function DELETE(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de delivery assignment requerido" },
        { status: 400 }
      );
    }

    await prisma.deliveryAssignment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "DeliveryAssignment eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando delivery assignment:", error);
    return NextResponse.json(
      { error: "Error al eliminar delivery assignment" },
      { status: 500 }
    );
  }
}
