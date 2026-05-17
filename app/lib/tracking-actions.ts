"use server"

import { prisma } from "@/app/lib/prisma"

export async function fetchTrackingsByShipmentIdServer(shipmentId: string) {
  if (!shipmentId) throw new Error("shipmentId requerido")

  const trackings = await prisma.tracking.findMany({
    where: { shipmentId },
    orderBy: { datetime: "desc" },
  })

  return trackings
}
