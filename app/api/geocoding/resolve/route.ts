import { NextRequest, NextResponse } from "next/server"
import { resolveSingleDestination } from "@/app/lib/geocoding"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address") ?? ""

    if (!address.trim()) {
      return NextResponse.json({ error: "address is required" }, { status: 400 })
    }

    const resolved = await resolveSingleDestination(address)

    if (!resolved) {
      return NextResponse.json({ error: "No se pudo resolver la dirección" }, { status: 404 })
    }

    return NextResponse.json(resolved, { status: 200 })
  } catch (error) {
    console.error("Error en /api/geocoding/resolve:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
