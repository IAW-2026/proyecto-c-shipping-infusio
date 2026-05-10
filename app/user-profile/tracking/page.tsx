"use client"

import { useSearchParams } from "next/navigation"
import { TrackingInput } from "@/app/ui/tracking-input"

export default function TrackingPage() {
	const searchParams = useSearchParams()
	const code = searchParams.get("code")

	return (
		<div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 w-full">
    
      <div className="mb-12">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Seguimiento</p>
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Buscar envío</h1>
        <p className="text-muted-foreground">Ingresá tu número de seguimiento para ver el estado actual del pedido.</p>
      </div>
      <div className="mt-8">
        <TrackingInput initialCode={code || undefined} />
      </div>
    </div>
	)
}
