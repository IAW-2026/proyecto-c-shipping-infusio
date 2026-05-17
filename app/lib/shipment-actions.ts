"use server"

import { prisma } from "@/app/lib/prisma"

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
