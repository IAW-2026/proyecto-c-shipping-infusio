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
  const latest = shipments.slice(0, 4).map((s) => {
    const latestTracking = s.Tracking && s.Tracking.length > 0 ? s.Tracking.sort((a, b) => (b.datetime as unknown as number) - (a.datetime as unknown as number))[0] : null
    return {
      code: s.id,
      destination: s.destination,
      status: latestTracking ? latestTracking.status : "Pendiente",
      date: new Date(s.originDatetime).toLocaleDateString("es-AR"),
    }
  })

  // Contar usuarios por rol (OL = logistic_operator)
  const logisticOperatorsCount = await prisma.userRole.count({ where: { role: "logistic_operator" } })
  const buyersCount = await prisma.userRole.count({ where: { role: "buyer" } })
  const ridersCount = await prisma.userRole.count({ where: { role: "rider" } })
  const sellersCount = await prisma.userRole.count({ where: { role: "seller" } })

  const rolesCount = [
    { role: "OL", count: logisticOperatorsCount },
    { role: "Buyer", count: buyersCount },
    { role: "Rider", count: ridersCount },
    { role: "Seller", count: sellersCount },
  ]

  // Estadísticas principales desde la DB
  const totalShipmentsCount = await prisma.shipment.count()
  const inTransitCount = await prisma.shipment.count({ where: { Tracking: { some: { status: "IN_TRANSIT" } } } })
  const deliveredCount = await prisma.shipment.count({ where: { Tracking: { some: { status: "DELIVERED" } } } })
  const incidentsCount = await prisma.shipment.count({ where: { Tracking: { some: { status: { in: ["WITH_ISSUE", "CANCELLED"] } } } } })

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
      rolesCount={rolesCount}
      stats={stats}
    />
  )
}