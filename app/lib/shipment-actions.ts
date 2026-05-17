"use server"

export async function fetchShipmentByIdServer(code: string) {  
    const apiKey = process.env.INTERNAL_API_KEY
  
  if (!apiKey) {
    throw new Error("INTERNAL_API_KEY not configured")
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/shipments?id=${encodeURIComponent(code)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || "Shipment not found")
  }

  const payload = await res.json()
  return payload.shipment
}
