import { resolveSingleDestination } from "@/lib/geocoding"
import { SHIPMENTS } from "@/app/lib/placeholder-data"

const defaultMicroserviceViewerUrl = "https://realtimetracker-vlmx.onrender.com/"
const defaultShipmentParamName = "shipmentId"
const defaultDestinationLatParamName = "destinationLat"
const defaultDestinationLngParamName = "destinationLng"
const defaultModeParamName = "mode"
const viewerModeValue = "viewer"

const microserviceViewerUrl =
  process.env.NEXT_PUBLIC_MICROSERVICE_VIEWER_URL ??
  process.env.MICROSERVICE_VIEWER_URL ??
  process.env.NEXT_PUBLIC_MICROSERVICE_URL ??
  process.env.MICROSERVICE_URL ??
  defaultMicroserviceViewerUrl

const shipmentParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_SHIPMENT_PARAM ??
  process.env.MICROSERVICE_SHIPMENT_PARAM ??
  defaultShipmentParamName

const destinationLatParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_DESTINATION_LAT_PARAM ??
  process.env.MICROSERVICE_DESTINATION_LAT_PARAM ??
  defaultDestinationLatParamName

const destinationLngParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_DESTINATION_LNG_PARAM ??
  process.env.MICROSERVICE_DESTINATION_LNG_PARAM ??
  defaultDestinationLngParamName

const modeParamName =
  process.env.NEXT_PUBLIC_MICROSERVICE_MODE_PARAM ??
  process.env.MICROSERVICE_MODE_PARAM ??
  defaultModeParamName

type SearchParams = {
  shipmentId?: string | string[]
  destinationLat?: string | string[]
  destinationLng?: string | string[]
  destinationAddress?: string | string[]
  package?: string | string[]
  paquete?: string | string[]
}

type MicroservicePageProps = {
  searchParams?: Promise<SearchParams>
}

function firstParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? ""
  }

  return value?.trim() ?? ""
}

function formatEmbeddedUrl(url: URL) {
  return url.toString().replace(/%2C/gi, ",")
}

export default async function LiveTrackingPage({ searchParams }: MicroservicePageProps) {
  const resolvedSearchParams = await searchParams
  const selectedShipmentId =
    firstParamValue(resolvedSearchParams?.shipmentId) ||
    firstParamValue(resolvedSearchParams?.package) ||
    firstParamValue(resolvedSearchParams?.paquete)

  const destinationAddressFromQuery = firstParamValue(resolvedSearchParams?.destinationAddress)
  const destinationAddressFromPlaceholder =
    SHIPMENTS.find((shipment) => shipment.id === selectedShipmentId)?.destination ?? ""
  const destinationAddress = destinationAddressFromQuery || destinationAddressFromPlaceholder
  const manualLat = firstParamValue(resolvedSearchParams?.destinationLat)
  const manualLng = firstParamValue(resolvedSearchParams?.destinationLng)

  const resolvedDestination =
    manualLat && manualLng
      ? { latitude: manualLat, longitude: manualLng }
      : await resolveSingleDestination(destinationAddress)

  const embeddedUrl = new URL(microserviceViewerUrl)

  if (selectedShipmentId) {
    embeddedUrl.searchParams.set(shipmentParamName, selectedShipmentId)
  }

  if (resolvedDestination) {
    embeddedUrl.searchParams.set(destinationLatParamName, resolvedDestination.latitude)
    embeddedUrl.searchParams.set(destinationLngParamName, resolvedDestination.longitude)
  }

  embeddedUrl.searchParams.set(modeParamName, viewerModeValue)

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-7xl flex-col gap-4 px-6 py-10 lg:px-8">
      <div>
        <h1 className="font-serif text-3xl font-medium text-foreground">Seguimiento en tiempo real</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vista embebida desde: {formatEmbeddedUrl(embeddedUrl)}</p>
        {destinationAddress && !resolvedDestination ? (
          <p className="mt-1 text-sm text-amber-700">
            No pude resolver el domicilio. Probá con calle, número, ciudad y país completos.
          </p>
        ) : null}
      </div>

      <form className="flex flex-col gap-2 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-end">
        <div className="w-full">
          <label htmlFor="shipmentId" className="mb-1 block text-sm font-medium text-foreground">
            Shipment ID
          </label>
          <input
            id="shipmentId"
            name="shipmentId"
            type="text"
            defaultValue={selectedShipmentId}
            placeholder="Ej: SHIPAA001"
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>
        <div className="w-full">
          <label htmlFor="destinationAddress" className="mb-1 block text-sm font-medium text-foreground">
            Domicilio
          </label>
          <input
            id="destinationAddress"
            name="destinationAddress"
            type="text"
            defaultValue={destinationAddress}
            placeholder="Ej: Calle Falsa 123, Bahia Blanca"
            className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Buscar
        </button>
      </form>

      <div className="h-[75vh] overflow-hidden rounded-md border border-border bg-background">
        <iframe
          key={formatEmbeddedUrl(embeddedUrl)}
          title="Microservicio Viewer"
          src={formatEmbeddedUrl(embeddedUrl)}
          className="h-full w-full"
          loading="lazy"
          allow="geolocation *"
          referrerPolicy="no-referrer"
        />
      </div>
    </main>
  )
}
