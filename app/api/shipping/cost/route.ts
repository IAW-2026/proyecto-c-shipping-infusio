import { calculateShippingCost } from "@/app/lib/utils"

type ShippingCostBody = {
  origin_postal_code?: unknown
  destination_postal_code?: unknown
  volume?: unknown
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isValidVolume(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

export async function POST(request: Request) {
  let body: ShippingCostBody

  try {
    body = (await request.json()) as ShippingCostBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const originPostalCode = body.origin_postal_code
  const destinationPostalCode = body.destination_postal_code
  const volume = body.volume

  if (!isNonEmptyString(originPostalCode) || !isNonEmptyString(destinationPostalCode)) {
    return Response.json(
      { error: "origin_postal_code and destination_postal_code are required" },
      { status: 400 },
    )
  }

  if (!isValidVolume(volume)) {
    return Response.json({ error: "volume must be a non-negative number" }, { status: 400 })
  }

//   const shippingCost = calculateShippingCost({
//     originPostalCode,
//     destinationPostalCode,
//     volume,
//   })

  const shippingCost = 123456789 // Placeholder value for testing purposes

  return Response.json({
    shipping_cost: shippingCost,
    currency: "ARS",
  })
}