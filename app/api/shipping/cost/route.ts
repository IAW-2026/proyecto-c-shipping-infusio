import { NextRequest, NextResponse } from "next/server"
import { validateApiKeysMiddleware } from "@/app/lib/api-key-validation"

type ShippingCostRequest = {
  origin_postal_code: string
  destination_postal_code: string
  volume?: number
}

function postalCodeScore(postalCode: string) {
  const normalized = postalCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  const digits = normalized.replace(/\D/g, "")
  const letters = normalized.replace(/[^A-Z]/g, "")

  let score = 0

  if (digits) {
    score += Number(digits)
  }

  for (const letter of letters) {
    score = score * 26 + (letter.charCodeAt(0) - 64)
  }

  return score
}

function estimateShippingCost(input: ShippingCostRequest) {
  const originScore = postalCodeScore(input.origin_postal_code)
  const destinationScore = postalCodeScore(input.destination_postal_code)
  const distanceScore = Math.abs(originScore - destinationScore)

  const baseCost = 2500
  const distanceCost = Math.round(Math.min(25000, distanceScore * 0.02))
  const normalizedVolume = Number.isFinite(input.volume) && Number(input.volume) > 0 ? Number(input.volume) : 1
  const volumeCost = Math.round((normalizedVolume - 1) * 500)

  return Math.max(0, baseCost + distanceCost + volumeCost)
}

export async function POST(request: NextRequest) {
  try {
    const authError = validateApiKeysMiddleware(request, [
      process.env.INTERNAL_API_KEY,
      process.env.BUYER,
      process.env.SELLER,
    ])
    if (authError) return authError

    const body = (await request.json()) as Partial<ShippingCostRequest>

    if (!body.origin_postal_code || !body.destination_postal_code) {
      return NextResponse.json(
        { error: "origin_postal_code y destination_postal_code son requeridos" },
        { status: 400 }
      )
    }

    const shippingCost = estimateShippingCost({
      origin_postal_code: body.origin_postal_code,
      destination_postal_code: body.destination_postal_code,
      volume: body.volume,
    })

    return NextResponse.json({ shipping_cost: shippingCost, currency: "ARS" }, { status: 200 })
  } catch (error) {
    console.error("Error calculando costo de envío:", error)
    return NextResponse.json({ error: "Error al calcular costo de envío" }, { status: 500 })
  }
}
