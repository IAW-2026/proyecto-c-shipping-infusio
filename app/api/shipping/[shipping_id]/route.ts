import { NextRequest, NextResponse } from "next/server"
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation"
import { prisma } from "@/app/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shipping_id: string }> }
) {
  try {
    const authError = validateApiKeyMiddleware(request)
    if (authError) return authError

    const { shipping_id } = await params

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipping_id },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    const latestTracking = await prisma.tracking.findFirst({
      where: { shipmentId: shipping_id },
      orderBy: { datetime: "desc" },
    })

    return NextResponse.json(
      {
        shipping_id,
        status: latestTracking?.status,
        last_update: (latestTracking?.datetime ?? shipment.originDatetime).toISOString(),
        current_city: latestTracking?.currentCity ?? shipment.origin,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error obteniendo seguimiento:", error)
    return NextResponse.json({ error: "Error al obtener seguimiento" }, { status: 500 })
  }
}
