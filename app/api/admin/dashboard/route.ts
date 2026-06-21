import { NextRequest, NextResponse } from "next/server"
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation"
import { getAdminDashboardData } from "@/app/lib/admin-dashboard"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(request, process.env.INTERNAL_API_KEY!)

    if (authError) {
      return authError
    }

    const dashboard = await getAdminDashboardData()

    return NextResponse.json(dashboard, { status: 200 })
  } catch (error) {
    console.error("Error obteniendo dashboard de admin:", error)
    return NextResponse.json({ error: "Error al obtener dashboard de admin" }, { status: 500 })
  }
}