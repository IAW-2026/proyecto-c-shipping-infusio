import { prisma } from "@/app/lib/prisma"

const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

export type AdminMonthlyShipment = {
  month: string
  envios: number
}

export type AdminLatestShipment = {
  code: string
  destination: string
  status: string
  date: string
}

export type AdminUser = {
  id: string
  name: string
  email: string
}

export type AdminStats = {
  total: number
  inTransit: number
  delivered: number
  incidents: number
}

export type AdminDashboardData = {
  monthlyShipments: AdminMonthlyShipment[]
  latestShipments: AdminLatestShipment[]
  users: AdminUser[]
  stats: AdminStats
}

function formatMonthLabel(monthIndex: number) {
  return MONTH_LABELS[monthIndex]
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const shipments = await prisma.shipment.findMany({
    where: {
      originDatetime: { gte: start },
    },
    include: { Tracking: true },
    orderBy: { originDatetime: "desc" },
  })

  const months: { key: string; year: number; monthIndex: number; envios: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    months.push({ key, year: d.getFullYear(), monthIndex: d.getMonth(), envios: 0 })
  }

  for (const shipment of shipments) {
    const shipmentDate = new Date(shipment.originDatetime)
    const key = `${shipmentDate.getFullYear()}-${shipmentDate.getMonth()}`
    const month = months.find((item) => item.key === key)

    if (month) {
      month.envios++
    }
  }

  const monthlyShipments = months.map((month) => ({
    month: formatMonthLabel(month.monthIndex),
    envios: month.envios,
  }))

  const latestShipments = shipments.slice(0, 25).map((shipment) => {
    const latestTracking =
      shipment.Tracking && shipment.Tracking.length > 0
        ? shipment.Tracking.sort((a, b) => b.datetime.getTime() - a.datetime.getTime())[0]
        : null

    return {
      code: shipment.id,
      destination: shipment.destination,
      status: latestTracking ? latestTracking.status : "Pendiente",
      date: new Date(shipment.originDatetime).toLocaleDateString("es-AR"),
    }
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  const totalShipmentsCount = await prisma.shipment.count()
  const latestTrackingStatuses = await prisma.$queryRaw<{ status: string }[]>`
    SELECT DISTINCT ON ("shipmentId") "status"
    FROM "Tracking"
    ORDER BY "shipmentId", "datetime" DESC
  `

  const inTransitCount = latestTrackingStatuses.filter(
    (tracking) => tracking.status === "IN_TRANSIT" || tracking.status === "OUT_FOR_DELIVERY"
  ).length
  const deliveredCount = latestTrackingStatuses.filter((tracking) => tracking.status === "DELIVERED").length
  const incidentsCount = latestTrackingStatuses.filter(
    (tracking) => tracking.status === "WITH_ISSUE" || tracking.status === "CANCELLED"
  ).length

  return {
    monthlyShipments,
    latestShipments,
    users,
    stats: {
      total: totalShipmentsCount,
      inTransit: inTransitCount,
      delivered: deliveredCount,
      incidents: incidentsCount,
    },
  }
}