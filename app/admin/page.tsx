import DashboardClient from "./dashboard-client"
import { prisma } from "@/app/lib/prisma"

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

function formatMonthLabel(year: number, monthIndex: number) {
  return MONTH_LABELS[monthIndex]
}

export default async function AdminPage() {
  // Obtener envíos de los últimos 6 meses
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const shipments = await prisma.shipment.findMany({
    where: {
      originDatetime: { gte: start },
    },
    include: { Tracking: true },
    orderBy: { originDatetime: "desc" },
  })

  // Inicializar los últimos 6 meses
  const months: { key: string; year: number; monthIndex: number; envios: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    months.push({ key, year: d.getFullYear(), monthIndex: d.getMonth(), envios: 0 })
  }

  // Contar envíos por mes
  for (const s of shipments) {
    const d = new Date(s.originDatetime)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const m = months.find((x) => x.key === key)
    if (m) m.envios++
  }

  const monthlyShipments = months.map((m) => ({ month: formatMonthLabel(m.year, m.monthIndex), envios: m.envios }))

  // Últimos 4 envíos para la tabla
  const latest = shipments.slice(0, 25).map((s) => {
    const latestTracking = s.Tracking && s.Tracking.length > 0 ? s.Tracking.sort((a, b) => (b.datetime as unknown as number) - (a.datetime as unknown as number))[0] : null
    return {
      code: s.id,
      destination: s.destination,
      status: latestTracking ? latestTracking.status : "Pendiente",
      date: new Date(s.originDatetime).toLocaleDateString("es-AR"),
    }
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    }
  })

  // Estadísticas principales desde la DB
  const totalShipmentsCount = await prisma.shipment.count()
  const latestTrackingStatuses = await prisma.$queryRaw<{ status: string }[]>`
    SELECT DISTINCT ON ("shipmentId") "status"
    FROM "Tracking"
    ORDER BY "shipmentId", "datetime" DESC
  `
  const inTransitCount = latestTrackingStatuses.filter((t) => t.status === "IN_TRANSIT" || t.status === "OUT_FOR_DELIVERY").length
  const deliveredCount = latestTrackingStatuses.filter((t) => t.status === "DELIVERED").length
  const incidentsCount = latestTrackingStatuses.filter((t) => t.status === "WITH_ISSUE" || t.status === "CANCELLED").length

  const stats = {
    total: totalShipmentsCount,
    inTransit: inTransitCount,
    delivered: deliveredCount,
    incidents: incidentsCount,
  }

  return ( 
    <DashboardClient 
      monthlyShipments={monthlyShipments} 
      latestShipments={latest} 
      users={users}
      stats={stats}
    />
  )
}