import { calculateShippingCost } from "@/lib/shipping-cost"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que los campos requeridos estén presentes
    if (
      !body.origin_postal_code ||
      !body.destination_postal_code ||
      body.volume === undefined ||
      body.volume === null
    ) {
      return Response.json(
        {
          error: "Missing required fields: origin_postal_code, destination_postal_code, volume",
        },
        { status: 400 }
      )
    }

    // Validar tipos
    if (typeof body.origin_postal_code !== "string") {
      return Response.json(
        { error: "origin_postal_code must be a string" },
        { status: 400 }
      )
    }

    if (typeof body.destination_postal_code !== "string") {
      return Response.json(
        { error: "destination_postal_code must be a string" },
        { status: 400 }
      )
    }

    if (typeof body.volume !== "number" || body.volume < 0) {
      return Response.json(
        { error: "volume must be a positive number" },
        { status: 400 }
      )
    }

    // Calcular el costo
    const cost = calculateShippingCost({
      originPostalCode: body.origin_postal_code,
      destinationPostalCode: body.destination_postal_code,
      volume: body.volume,
    })

    return Response.json(
      {
        "shipping_cost": cost,
        "currency": "ARS"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error calculating shipping cost:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
