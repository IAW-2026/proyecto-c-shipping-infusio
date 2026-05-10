type ResolvedDestination = {
  latitude: string
  longitude: string
}

export async function resolveSingleDestination(address?: string): Promise<ResolvedDestination | null> {
  const query = address?.trim()

  if (!query) {
    return null
  }

  const endpoint = new URL("https://nominatim.openstreetmap.org/search")
  endpoint.searchParams.set("q", query)
  endpoint.searchParams.set("format", "json")
  endpoint.searchParams.set("limit", "1")

  try {
    const response = await fetch(endpoint.toString(), {
      headers: {
        "User-Agent": "ShippingIAW/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as Array<{ lat: string; lon: string }>
    const first = payload?.[0]

    if (!first?.lat || !first?.lon) {
      return null
    }

    return {
      latitude: first.lat,
      longitude: first.lon,
    }
  } catch {
    return null
  }
}
