import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

type UpdateSubscriptionBody = {
  emailSub?: boolean
  pushSub?: boolean
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailSub: true, pushSub: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json(
      { emailSub: user.emailSub, pushSub: user.pushSub },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error obteniendo suscripciones:", error)
    return NextResponse.json({ error: "Error al obtener suscripciones" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = (await request.json()) as UpdateSubscriptionBody

    if (typeof body.emailSub !== "boolean" && typeof body.pushSub !== "boolean") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
    }

    const dataToUpdate: Record<string, unknown> = {}

    if (typeof body.emailSub === "boolean") dataToUpdate.emailSub = body.emailSub
    if (typeof body.pushSub === "boolean") dataToUpdate.pushSub = body.pushSub

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { emailSub: true, pushSub: true },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error actualizando suscripciones:", error)
    return NextResponse.json({ error: "Error al actualizar suscripciones" }, { status: 500 })
  }
}

