"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

type Monthly = { month: string; envios: number }
type Latest = { code: string; destination: string; status: string; date: string }

const statusData = [
  { name: "Entregados", value: 64 },
  { name: "En tránsito", value: 22 },
  { name: "Pendientes", value: 10 },
  { name: "Incidencias", value: 4 },
]

const revenueData = [
  { month: "Ene", ingresos: 240000 },
  { month: "Feb", ingresos: 320000 },
  { month: "Mar", ingresos: 410000 },
  { month: "Abr", ingresos: 390000 },
  { month: "May", ingresos: 520000 },
  { month: "Jun", ingresos: 610000 },
  { month: "Jul", ingresos: 580000 },
]

export default function DashboardClient({
  monthlyShipments,
  latestShipments,
}: {
  monthlyShipments: Monthly[]
  latestShipments: Latest[]
}) {
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
        <StatCard title="Envíos totales" value="1.440" detail="+18% este mes" icon={<Package className="h-5 w-5" />} />
        <StatCard title="En tránsito" value="318" detail="22% del total" icon={<Truck className="h-5 w-5" />} />
        <StatCard title="Entregados" value="921" detail="64% de efectividad" icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard title="Incidencias" value="57" detail="4% del total" icon={<AlertTriangle className="h-5 w-5" />} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Envíos mensuales">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyShipments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="envios" radius={[8, 8, 0, 0]} color={COLORS[3]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ingresos por envíos">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => (value != null ? `$${Number(value).toLocaleString("es-AR")}` : "-")} />
              <Line type="monotone" dataKey="ingresos" strokeWidth={3} dot={{ r: 4 }} color={COLORS[3]} />
            </LineChart>
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
    </div>
  )
}
