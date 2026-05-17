"use server"

import { prisma } from "@/app/lib/prisma"

export async function fetchTrackingsByShipmentIdServer(shipmentId: string) {
  if (!shipmentId) {
    console.warn("fetchTrackingsByShipmentIdServer called without shipmentId")
    return []
  }

  try {
    const trackings = await prisma.tracking.findMany({
      where: { shipmentId },
      orderBy: { datetime: "desc" },
    })

    return trackings
  } catch (err) {
    console.error("fetchTrackingsByShipmentIdServer: DB query failed", err)
    return []
  }
}
