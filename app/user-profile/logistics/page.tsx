import { fetchAllRiders, fetchAllShipments } from "@/app/lib/data"
import { LogisticsPageClient } from "./logistics-page-client"

export const dynamic = "force-dynamic"

const TRACKINGS_STORAGE_KEY = "logistics-trackings"
const ASSIGNMENTS_STORAGE_KEY = "logistics-assignments"
const OPERATOR_ID = "operator-001"

export default async function LogisticsPage() {
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