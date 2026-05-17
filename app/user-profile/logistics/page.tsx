import { fetchAllRiders, fetchAllShipments } from "@/app/lib/data"
import { LogisticsPageClient } from "./logistics-page-client"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"

const TRACKINGS_STORAGE_KEY = "logistics-trackings"
const ASSIGNMENTS_STORAGE_KEY = "logistics-assignments"

export default async function LogisticsPage() {
  const user = await currentUser()
  const userId = user?.id
  const OPERATOR_ID = userId ?? "logistic-operator-unknown"

  const riders = await fetchAllRiders()
  const shipments = await fetchAllShipments()

  return (
    <LogisticsPageClient
      riders={riders}
      shipments={shipments}
      operatorId={OPERATOR_ID}
      storageKeys={{
        trackings: TRACKINGS_STORAGE_KEY,
        assignments: ASSIGNMENTS_STORAGE_KEY,
      }}
    />
  )
}