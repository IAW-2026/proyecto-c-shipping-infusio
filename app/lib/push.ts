import webpush from "web-push"
import { prisma } from "./prisma"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@example.com",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
)

export async function sendPushToUsers(userIds: string[] | undefined, title: string, message: string, url?: string) {
  try {
    const pushDelegate = (prisma as unknown as {
      pushSubscription?: {
        findMany: Function
        delete: Function
      }
    }).pushSubscription

    if (!pushDelegate) {
      console.error("PushSubscription no disponible en Prisma Client. Ejecutar prisma generate y reiniciar dev.")
      return
    }

    const subs: Array<{ userId: string; subscription: unknown }> = userIds && userIds.length > 0
      ? await pushDelegate.findMany({ where: { userId: { in: userIds } } })
      : await pushDelegate.findMany()

    if (!subs || subs.length === 0) return

    const payload = JSON.stringify({ title, body: message, url })

    await Promise.all(
      subs.map(async (s: { userId: string; subscription: unknown }) => {
        try {
          await webpush.sendNotification(s.subscription as any, payload)
        } catch (err: any) {
          console.error("web-push error for user", s.userId, err)
          // Si la suscripción ya no es válida, eliminarla
          const status = err?.statusCode
          if (status === 410 || status === 404) {
            try {
              await pushDelegate.delete({ where: { userId: s.userId } })
            } catch (delErr) {
              console.error("Error eliminando suscripción inválida:", delErr)
            }
          }
        }
      })
    )
  } catch (error) {
    console.error("Error en sendPushToUsers:", error)
  }
}
