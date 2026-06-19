import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";
import { prisma } from "@/app/lib/prisma";

// GET - Obtener shipments activos o filtrar
export async function GET(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(
      request,
      process.env.INTERNAL_API_KEY!
    );
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    if (id) {
      const shipment = await prisma.shipment.findFirst({
        where: {
          id,
          ...(includeDeleted ? {} : { active: true }),
        },
        include: {
          DeliveryAssignment: true,
          Tracking: {
            where: includeDeleted ? {} : { active: true },
            orderBy: { datetime: "asc" },
          },
        },
      });

      if (!shipment) {
        return NextResponse.json(
          { error: "Shipment no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ shipment }, { status: 200 });
    }

    const where: any = {
      ...(includeDeleted ? {} : { active: true }),
    };

    if (buyerId) where.buyerId = buyerId;
    if (sellerId) where.sellerId = sellerId;

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        DeliveryAssignment: true,
        Tracking: {
          where: includeDeleted ? {} : { active: true },
          orderBy: { datetime: "asc" },
        },
      },
      orderBy: { originDatetime: "desc" },
    });

    return NextResponse.json({ shipments }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo shipments:", error);
    return NextResponse.json(
      { error: "Error al obtener shipments" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo shipment
export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(
      request,
      process.env.INTERNAL_API_KEY!
    );
    if (authError) return authError;

    const body = await request.json();
    const {
      id,
      origin,
      destination,
      originDatetime,
      destinationDatetime,
      buyerId,
      sellerId,
    } = body;

    if (
      !id ||
      !origin ||
      !destination ||
      !originDatetime ||
      !destinationDatetime ||
      !buyerId ||
      !sellerId
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.create({
      data: {
        id,
        origin,
        destination,
        originDatetime: new Date(originDatetime),
        destinationDatetime: new Date(destinationDatetime),
        buyerId,
        sellerId,
        active: true,
        deletedAt: null,
      },
    });

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (error) {
    console.error("Error creando shipment:", error);
    return NextResponse.json(
      { error: "Error al crear shipment" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar shipment
export async function PUT(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(
      request,
      process.env.INTERNAL_API_KEY!
    );
    if (authError) return authError;

    const body = await request.json();
    const {
      id,
      origin,
      destination,
      originDatetime,
      destinationDatetime,
      buyerId,
      sellerId,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de shipment requerido" },
        { status: 400 }
      );
    }

    const shipmentExists = await prisma.shipment.findFirst({
      where: {
        id,
        active: true,
      },
    });

    if (!shipmentExists) {
      return NextResponse.json(
        { error: "Shipment no encontrado o dado de baja" },
        { status: 404 }
      );
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        ...(origin && { origin }),
        ...(destination && { destination }),
        ...(originDatetime && { originDatetime: new Date(originDatetime) }),
        ...(destinationDatetime && {
          destinationDatetime: new Date(destinationDatetime),
        }),
        ...(buyerId && { buyerId }),
        ...(sellerId && { sellerId }),
      },
      include: {
        DeliveryAssignment: true,
        Tracking: {
          where: { active: true },
          orderBy: { datetime: "asc" },
        },
      },
    });

    return NextResponse.json({ shipment }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando shipment:", error);
    return NextResponse.json(
      { error: "Error al actualizar shipment" },
      { status: 500 }
    );
  }
}

// DELETE - Baja lógica de shipment y sus trackings
export async function DELETE(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(
      request,
      process.env.INTERNAL_API_KEY!
    );
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de shipment requerido" },
        { status: 400 }
      );
    }

    const shipment = await prisma.shipment.findFirst({
      where: {
        id,
        active: true,
      },
      include: {
        Tracking: true,
        DeliveryAssignment: true,
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment no encontrado o ya dado de baja" },
        { status: 404 }
      );
    }

    const deletedAt = new Date();

    const deletedShipment = await prisma.$transaction(async (tx) => {
      await tx.tracking.updateMany({
        where: { shipmentId: id },
        data: {
          active: false,
          deletedAt,
          current: false,
          completed: false,
        },
      });

      await tx.deliveryAssignment.updateMany({
        where: { shipmentId: id },
        data: {
          riderId: null,
          logisticOperatorId: null,
        },
      });

      return tx.shipment.update({
        where: { id },
        data: {
          active: false,
          deletedAt,
        },
        include: {
          DeliveryAssignment: true,
          Tracking: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: "Shipment dado de baja correctamente",
        shipment: deletedShipment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error dando de baja shipment:", error);
    return NextResponse.json(
      { error: "Error al dar de baja el shipment" },
      { status: 500 }
    );
  }
}