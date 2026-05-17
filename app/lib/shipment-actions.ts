"use server"

export async function fetchShipmentByIdServer(code: string) {  
    const apiKey = process.env.INTERNAL_API_KEY
  
  if (!apiKey) {
    console.error("INTERNAL_API_KEY not configured")
    return null
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/shipments?id=${encodeURIComponent(code)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  try {
    if (!res.ok) {
      // If unauthorized or not found, return null so callers can handle gracefully
      const err = await res.json().catch(() => ({}))
      console.warn("fetchShipmentByIdServer: non-ok response", res.status, err)
      return null
    }

    const payload = await res.json().catch(() => null)
    return payload?.shipment ?? null
  } catch (err) {
    console.error("Error fetching shipment by id:", err)
    return null
  }
}
