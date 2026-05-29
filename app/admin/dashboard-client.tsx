"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Download,
} from "lucide-react"
import ChartCard from "@/app/ui/admin/chart-card"
import StatCard from "@/app/ui/admin/stat-card"
import { Button } from "@/app/ui/utils/button"
import { CHART_COLORS as COLORS } from "@/app/lib/definitions"
import { useState } from "react"

type Monthly = { month: string; envios: number }
type Latest = { code: string; destination: string; status: string; date: string }
type DashboardUser = { id: string; name: string; email: string }

export default function DashboardClient({
  monthlyShipments,
  latestShipments,
  users,
  stats,
}: {
  monthlyShipments: Monthly[]
  latestShipments: Latest[]
  users: DashboardUser[]
  stats: { total: number; inTransit: number; delivered: number; incidents: number }
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filteredShipments, setFilteredShipments] = useState<any[]>([])
  const [filterLabel, setFilterLabel] = useState("")

  const statusData = [
  { name: "Entregados", value: stats.delivered },
  { name: "En tránsito", value: stats.inTransit },
  { name: "Pendientes", value: stats.total - stats.delivered - stats.inTransit - stats.incidents },
  { name: "Incidencias", value: stats.incidents },
]

  function handleDownloadReport() {
    const generatedAt = new Date()
    const lines: string[] = []

    lines.push("REPORTE ADMINISTRATIVO")
    lines.push(`Generado: ${generatedAt.toLocaleString("es-AR")}`)
    lines.push("")

    lines.push("ESTADISTICAS GENERALES")
    lines.push(`- Envíos totales: ${stats.total}`)
    lines.push(`- En tránsito: ${stats.inTransit}`)
    lines.push(`- Entregados: ${stats.delivered}`)
    lines.push(`- Incidencias: ${stats.incidents}`)
    lines.push("")

    lines.push("ENVIOS MENSUALES")
    for (const item of monthlyShipments) {
      lines.push(`- ${item.month}: ${item.envios}`)
    }
    lines.push("")

    lines.push("ESTADO DE ENVIOS")
    for (const item of statusData) {
      lines.push(`- ${item.name}: ${item.value}`)
    }
    lines.push("")

    lines.push("ULTIMOS ESTADOS")
    for (const item of latestShipments) {
      lines.push(`- ${item.code} | ${item.status} | ${item.date}`)
    }
    lines.push("")

    lines.push("USUARIOS REGISTRADOS")
    for (const user of users) {
      lines.push(`- ${user.name} | ${user.email}`)
    }

    const reportText = lines.join("\n")
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `reporte-admin-${generatedAt.toISOString().slice(0, 10)}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              Administración
            </p>
            <h1 className="font-serif text-3xl font-medium text-foreground">Panel de control</h1>
            <p className="mt-2 text-muted-foreground">
              Resumen general de envíos, ingresos, incidencias y actividad logística.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="inline-flex items-center gap-2"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4" />
            Descargar reporte
          </Button>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Envíos totales" value={String(stats.total.toLocaleString())} detail="" icon={<Package className="h-8 w-8" />} />
        <StatCard title="En tránsito" value={String(stats.inTransit.toLocaleString())} detail="" icon={<Truck className="h-8 w-8" />}/>
        <StatCard title="Entregados" value={String(stats.delivered.toLocaleString())} detail="" icon={<CheckCircle className="h-8 w-8" />}/>
        <StatCard title="Incidencias" value={String(stats.incidents.toLocaleString())} detail="" icon={<AlertTriangle className="h-8 w-8" />}/>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Envíos mensuales">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyShipments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="envios" radius={[8, 8, 0, 0]} fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        {/* Listado de usuarios */}
        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Usuarios registrados
          </h2>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {users.map(({ id, name, email }) => (
              <div key={id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{email}</p>
              </div>
            ))}
          </div>
        </div>  
      </section>

      <section className="mt-8 grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0">
          <ChartCard title="Estado de envíos">
            <div className="h-60 w-full min-w-0 sm:h-65">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="45%"
                    outerRadius="70%"
                    paddingAngle={4}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">
            Últimos estados
          </h2>

          <div className="h-60 sm:h-65">
            {/* Mobile */}
            <div className="h-full space-y-3 overflow-y-auto pr-1 md:hidden">
              {latestShipments.map(({ code, status, date }) => (
                <div key={code} className="rounded-xl border border-border p-4">
                  <p className="font-medium text-foreground">{code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{status}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{date}</p>
                </div>
              ))}
            </div>

            {/* Desktop / tablet */}
            <div className="hidden h-full overflow-auto rounded-xl border border-border md:block">
              <table className="w-full min-w-105 text-left text-sm">
                <thead className="sticky top-0 bg-secondary/90 text-muted-foreground backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {latestShipments.map(({ code, status, date }) => (
                    <tr key={code} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{code}</td>
                      <td className="px-4 py-3">{status}</td>
                      <td className="px-4 py-3 text-muted-foreground">{date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
