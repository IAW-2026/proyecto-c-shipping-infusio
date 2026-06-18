import DashboardClient from "./dashboard-client"
import { getAdminDashboardData } from "@/app/lib/admin-dashboard"

export default async function AdminPage() {
  const dashboard = await getAdminDashboardData()

  return ( 
    <DashboardClient 
      monthlyShipments={dashboard.monthlyShipments} 
      latestShipments={dashboard.latestShipments} 
      users={dashboard.users}
      stats={dashboard.stats}
    />
  )
}