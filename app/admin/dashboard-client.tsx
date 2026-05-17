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
} from "lucide-react"
import ChartCard from "@/app/ui/admin/chart-card"
import StatCard from "@/app/ui/admin/stat-card"
import { CHART_COLORS as COLORS } from "@/app/lib/definitions"
import { useState } from "react"

type Monthly = { month: string; envios: number }
type Latest = { code: string; destination: string; status: string; date: string }
type RoleCount = { role: string; count: number }

const statusData = [
  { name: "Entregados", value: 64 },
  { name: "En tránsito", value: 22 },
  { name: "Pendientes", value: 10 },
  { name: "Incidencias", value: 4 },
]

export default function DashboardClient({
  monthlyShipments,
  latestShipments,
  rolesCount,
  stats,
}: {
  monthlyShipments: Monthly[]
  latestShipments: Latest[]
  rolesCount: RoleCount[]
  stats: { total: number; inTransit: number; delivered: number; incidents: number }
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filteredShipments, setFilteredShipments] = useState<any[]>([])
  const [filterLabel, setFilterLabel] = useState("")

  async function fetchFiltered(filter: string, label: string) {
    setLoading(true)
    setFilterLabel(label)
    try {
      const res = await fetch(`/api/shipments/filter?filter=${encodeURIComponent(filter)}`)
      const json = await res.json()
      setFilteredShipments(json.shipments ?? [])
      setOpen(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
          Administración
        </p>
        <h1 className="font-serif text-3xl font-medium text-foreground">Panel de control</h1>
        <p className="mt-2 text-muted-foreground">
          Resumen general de envíos, ingresos, incidencias y actividad logística.
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Envíos totales" value={String(stats.total.toLocaleString())} detail="" icon={<Package className="h-8 w-8" />} onClick={() => fetchFiltered('total','Envíos totales')} />
        <StatCard title="En tránsito" value={String(stats.inTransit.toLocaleString())} detail="" icon={<Truck className="h-8 w-8" />} onClick={() => fetchFiltered('inTransit','En tránsito')} />
        <StatCard title="Entregados" value={String(stats.delivered.toLocaleString())} detail="" icon={<CheckCircle className="h-8 w-8" />} onClick={() => fetchFiltered('delivered','Entregados')} />
        <StatCard title="Incidencias" value={String(stats.incidents.toLocaleString())} detail="" icon={<AlertTriangle className="h-8 w-8" />} onClick={() => fetchFiltered('incidents','Incidencias')} />
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
        {/* Usuarios por rol */}
        <ChartCard title="Usuarios por rol">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rolesCount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <ChartCard title="Estado de envíos">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl font-medium text-foreground">Últimos envíos</h2>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Destino</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {latestShipments.map(({ code, destination, status, date }) => (
                  <tr key={code} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{code}</td>
                    <td className="px-4 py-3">{destination}</td>
                    <td className="px-4 py-3">{status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-lg bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{filterLabel}</h3>
              <button className="ml-4 rounded bg-muted px-3 py-1" onClick={() => setOpen(false)}>Cerrar</button>
            </div>
            <div className="mt-4">
              {loading ? (
                <p>Cargando...</p>
              ) : (
                <div className="overflow-auto max-h-96 rounded border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Código</th>
                        <th className="px-4 py-3 font-medium">Origen</th>
                        <th className="px-4 py-3 font-medium">Destino</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map((s) => {
                        const latest = s.Tracking && s.Tracking.length ? s.Tracking.sort((a: any, b: any) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())[0] : null
                        return (
                          <tr key={s.id} className="border-t border-border">
                            <td className="px-4 py-3 font-medium">{s.id}</td>
                            <td className="px-4 py-3">{s.origin}</td>
                            <td className="px-4 py-3">{s.destination}</td>
                            <td className="px-4 py-3">{latest ? latest.status : 'Pendiente'}</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(s.originDatetime).toLocaleString('es-AR')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
