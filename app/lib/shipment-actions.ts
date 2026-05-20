"use server"

import { prisma } from "@/app/lib/prisma"
import { TimelineStatuses } from "@/app/lib/definitions"
import { notifyBuyerShipmentStepByEmail } from "@/app/lib/notification-actions"
import { sendPushToUsers } from "@/app/lib/push"

type AdvanceShipmentTrackingInput = {
  shipmentId: string
  status: keyof typeof TimelineStatuses
}

type PersistedTracking = {
  shipmentId: string
  datetime: string
  status: keyof typeof TimelineStatuses
  currentCity: string
  nextCity: string
  completed: boolean
  current: boolean
}

export async function fetchShipmentByIdServer(code: string) {
  if (!code) return null

  // 1) Prefer direct DB lookup (works reliably in prod and avoids localhost fetch)
  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: code } })
    if (shipment) return shipment
  } catch (err) {
    console.error("fetchShipmentByIdServer: DB lookup failed", err)
    // proceed to optional HTTP fallback
  }

  // 2) Optional HTTP fallback: only try if an explicit base URL and API key are configured
  const apiKey = process.env.INTERNAL_API_KEY
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL

  if (!apiKey || !base) {
    console.warn("fetchShipmentByIdServer: skipping HTTP fetch (missing INTERNAL_API_KEY or base URL)")
    return null
  }

  try {
    const res = await fetch(`${base}/api/internal/shipments?id=${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.warn("fetchShipmentByIdServer: HTTP non-ok response", res.status, err)
      return null
    }

    const payload = await res.json().catch(() => null)
    return payload?.shipment ?? null
  } catch (err) {
    console.warn("fetchShipmentByIdServer: HTTP fetch failed", err)
    return null
  }
}

export async function advanceShipmentTrackingServer({ shipmentId, status }: AdvanceShipmentTrackingInput) {
  if (!shipmentId || !status) {
    throw new Error("shipmentId y status son requeridos")
  }

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } })

  if (!shipment) {
    throw new Error("Shipment no encontrado")
  }

  const latestTracking = await prisma.tracking.findFirst({
    where: { shipmentId },
    orderBy: { datetime: "desc" },
  })

  const now = new Date()
  const isTerminal =
    status === "DELIVERED" || status === "CANCELLED" || status === "WITH_ISSUE"

  const tracking = await prisma.$transaction(async (tx) => {
    await tx.tracking.updateMany({
      where: { shipmentId, current: true },
      data: { current: false, completed: true },
    })

    return tx.tracking.create({
      data: {
        shipmentId,
        datetime: now,
        status,
        currentCity: latestTracking?.nextCity ?? latestTracking?.currentCity ?? shipment.origin,
        nextCity: shipment.destination,
        completed: isTerminal,
        current: true,
      },
    })
  })

  const persistedTracking: PersistedTracking = {
    shipmentId: tracking.shipmentId,
    datetime: tracking.datetime.toISOString(),
    status: tracking.status,
    currentCity: tracking.currentCity,
    nextCity: tracking.nextCity,
    completed: tracking.completed,
    current: tracking.current,
  }

  try {
    await notifyBuyerShipmentStepByEmail({
      shipmentId,
      status,
    })
  } catch (notificationError) {
    console.error("No se pudo enviar la notificación por email:", notificationError)
  }

  try {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } })
    const userIds: string[] = []
    if (shipment?.buyerId) userIds.push(shipment.buyerId)
    if (shipment?.sellerId) userIds.push(shipment.sellerId)

    const title = `Actualización de envío ${shipmentId}`
    const message = `Estado: ${status}`
    const url = `/user-profile/tracking?shipmentId=${shipmentId}`

    await sendPushToUsers(userIds.length ? userIds : undefined, title, message, url)
  } catch (pushErr) {
    console.error('Error enviando push desde shipment-actions:', pushErr)
  }

  return { tracking: persistedTracking }
}
