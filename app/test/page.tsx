type TestPageProps = {
    searchParams?: Promise<{ shipmentId?: string }>
}

export default async function TestPage({ searchParams }: TestPageProps) {
    const resolvedSearchParams = await searchParams
    const shipmentId = resolvedSearchParams?.shipmentId ?? "SHIPAA001"

    return (
        <div className="w-full h-screen">
            <iframe
                src={`${process.env.NEXT_PUBLIC_API_URL}/tracking/embed?code=${encodeURIComponent(shipmentId)}`}
                title="Seguimiento"
                className="w-full h-full border-0"
                loading="lazy"
                allow="geolocation *"
            />
        </div>
    )
}