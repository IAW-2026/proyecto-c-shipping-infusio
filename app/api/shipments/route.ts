import { NextResponse } from "next/server"
import { fetchAllShipments, fetchAllTrackings } from "@/app/lib/queries"

function normalizeTrackings(trackings: any[]) {
  return trackings.map((tracking) => ({
    shipment_id: tracking.shipmentId,
    status: tracking.status,
    datetime: tracking.datetime instanceof Date ? tracking.datetime.toISOString() : tracking.datetime,
    current_city: tracking.currentCity,
    next_city: tracking.nextCity,
  }))
}

export async function GET() {
  try {
    const [shipments, trackings] = await Promise.all([
      fetchAllShipments(),
      fetchAllTrackings(),
    ])

    return NextResponse.json(
      {
        shipments,
        trackings: normalizeTrackings(trackings),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching shipments for API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
