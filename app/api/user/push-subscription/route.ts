import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

type PushSubscriptionBody = {
  endpoint?: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

async function ensureUserExists(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (existing) return

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)

  const email = clerkUser.emailAddresses?.[0]?.emailAddress
  if (!email) {
    throw new Error("No se encontró email del usuario autenticado")
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      name: clerkUser.firstName ?? "",
      surname: clerkUser.lastName ?? "",
    },
    create: {
      id: userId,
      email,
      name: clerkUser.firstName ?? "",
      surname: clerkUser.lastName ?? "",
    },
  })
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const subscription = (await request.json()) as PushSubscriptionBody
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: "Subscription inválida" }, { status: 400 })
    }

    await ensureUserExists(userId)

    const pushDelegate = (prisma as unknown as { pushSubscription?: { upsert: Function } }).pushSubscription
    if (!pushDelegate) {
      return NextResponse.json(
        { error: "PushSubscription no disponible en Prisma Client. Reiniciá dev y ejecutá prisma generate." },
        { status: 503 }
      )
    }

    await pushDelegate.upsert({
      where: { userId },
      update: { subscription },
      create: { userId, subscription },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Error guardando suscripción push:", error)
    return NextResponse.json({ error: "Error guardando suscripción" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const pushDelegate = (prisma as unknown as { pushSubscription?: { deleteMany: Function } }).pushSubscription
    if (!pushDelegate) {
      return NextResponse.json(
        { error: "PushSubscription no disponible en Prisma Client. Reiniciá dev y ejecutá prisma generate." },
        { status: 503 }
      )
    }

    await pushDelegate.deleteMany({ where: { userId } })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Error eliminando suscripción push:", error)
    return NextResponse.json({ error: "Error eliminando suscripción" }, { status: 500 })
  }
}
