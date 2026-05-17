import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";
import { prisma } from "@/app/lib/prisma";

// GET - Obtener todos los shipments o filtrar
export async function GET(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");

    if (id) {
      const shipment = await prisma.shipment.findUnique({
        where: { id },
        include: {
          DeliveryAssignment: true,
          Tracking: true,
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

    const where: any = {};
    if (buyerId) where.buyerId = buyerId;
    if (sellerId) where.sellerId = sellerId;

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        DeliveryAssignment: true,
        Tracking: true,
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
    const authError = validateApiKeyMiddleware(request);
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
    const authError = validateApiKeyMiddleware(request);
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
        Tracking: true,
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

// DELETE - Eliminar shipment
export async function DELETE(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de shipment requerido" },
        { status: 400 }
      );
    }

    await prisma.shipment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Shipment eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando shipment:", error);
    return NextResponse.json(
      { error: "Error al eliminar shipment" },
      { status: 500 }
    );
  }
}
