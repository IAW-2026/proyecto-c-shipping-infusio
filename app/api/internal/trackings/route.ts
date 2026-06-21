import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";
import { prisma } from "@/app/lib/prisma";
import { sendPushToUsers } from "@/app/lib/push";

// GET - Obtener trackings
export async function GET(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const status = searchParams.get("status");

    const where: any = {};
    if (shipmentId) where.shipmentId = shipmentId;
    if (status) where.status = status;

    const trackings = await prisma.tracking.findMany({
      where,
      include: {
        Shipment: true,
      },
      orderBy: { datetime: "asc" },
    });

    return NextResponse.json({ trackings }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo trackings:", error);
    return NextResponse.json(
      { error: "Error al obtener trackings" },
      { status: 500 }
    );
  }
}

// POST - Crear tracking
export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const body = await request.json();
    const { shipmentId, orderId, datetime, status, currentCity, nextCity, completed, current } =
      body;

    if (!shipmentId || !datetime || !status) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
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

    const tracking = await prisma.tracking.create({
      data: {
        shipmentId,
        ...(orderId && { orderId }),
        datetime: new Date(datetime),
        status,
        currentCity: currentCity || "",
        nextCity: nextCity || "",
        completed: completed || false,
        current: current || false,
      },
      include: {
        Shipment: true,
      },
    });

    // Enviar notificación push a buyer y seller del shipment
    try {
      const userIds: string[] = []
      if (tracking.Shipment?.buyerId) userIds.push(tracking.Shipment.buyerId)
      if (tracking.Shipment?.sellerId) userIds.push(tracking.Shipment.sellerId)

      const title = `Actualización de envío ${tracking.shipmentId}`
      const message = `Estado: ${tracking.status}`
      const url = `/user-profile/tracking?shipmentId=${tracking.shipmentId}`

      await sendPushToUsers(userIds, title, message, url)
    } catch (e) {
      console.error('Error enviando notificaciones push tras crear tracking:', e)
    }

    return NextResponse.json({ tracking }, { status: 201 });
  } catch (error) {
    console.error("Error creando tracking:", error);
    return NextResponse.json(
      { error: "Error al crear tracking" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar tracking
export async function PUT(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const body = await request.json();
    const { shipmentId, orderId, datetime, status, currentCity, nextCity, completed, current } =
      body;

    if (!shipmentId || !datetime) {
      return NextResponse.json(
        { error: "shipmentId y datetime son requeridos" },
        { status: 400 }
      );
    }

    const existingTracking = await prisma.tracking.findFirst({
      where: {
        shipmentId,
        datetime: new Date(datetime),
      },
    });

    if (!existingTracking) {
      return NextResponse.json(
        { error: "Tracking no encontrado" },
        { status: 404 }
      );
    }

    await prisma.tracking.updateMany({
      where: {
        shipmentId,
        datetime: new Date(datetime),
      },
      data: {
        ...(status && { status }),
        ...(orderId !== undefined && { orderId }),
        ...(currentCity !== undefined && { currentCity }),
        ...(nextCity !== undefined && { nextCity }),
        ...(completed !== undefined && { completed }),
        ...(current !== undefined && { current }),
      },
    });

    const tracking = await prisma.tracking.findFirst({
      where: {
        shipmentId,
        datetime: new Date(datetime),
      },
      include: {
        Shipment: true,
      },
    });

    // Enviar notificación push a buyer y seller del shipment tras actualizar
    try {
      const userIds: string[] = []
      if (tracking?.Shipment?.buyerId) userIds.push(tracking.Shipment.buyerId)
      if (tracking?.Shipment?.sellerId) userIds.push(tracking.Shipment.sellerId)

      const title = `Actualización de envío ${tracking?.shipmentId}`
      const message = `Estado: ${tracking?.status}`
      const url = `/user-profile/tracking?shipmentId=${tracking?.shipmentId}`

      await sendPushToUsers(userIds, title, message, url)
    } catch (e) {
      console.error('Error enviando notificaciones push tras actualizar tracking:', e)
    }

    return NextResponse.json({ tracking }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando tracking:", error);
    return NextResponse.json(
      { error: "Error al actualizar tracking" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tracking
export async function DELETE(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const datetime = searchParams.get("datetime");

    if (!shipmentId || !datetime) {
      return NextResponse.json(
        { error: "shipmentId y datetime son requeridos" },
        { status: 400 }
      );
    }

    const deleted = await prisma.tracking.deleteMany({
      where: {
        shipmentId,
        datetime: new Date(datetime),
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Tracking no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Tracking eliminado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando tracking:", error);
    return NextResponse.json(
      { error: "Error al eliminar tracking" },
      { status: 500 }
    );
  }
}
