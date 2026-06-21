import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "total";

    let where: any = {};

    if (filter === "inTransit") {
      where = { Tracking: { some: { status: "IN_TRANSIT" } } };
    } else if (filter === "delivered") {
      where = { Tracking: { some: { status: "DELIVERED" } } };
    } else if (filter === "incidents") {
      where = { Tracking: { some: { status: { in: ["WITH_ISSUE", "CANCELLED"] } } } };
    } else {
      where = {};
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: { Tracking: true, DeliveryAssignment: true },
      orderBy: { originDatetime: "desc" },
      take: 1000,
    });

    return NextResponse.json({ shipments }, { status: 200 });
  } catch (error) {
    console.error("Error en filter shipments:", error);
    return NextResponse.json({ error: "Error al obtener shipments" }, { status: 500 });
  }
}
