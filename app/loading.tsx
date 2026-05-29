import Image from "next/image"
import { Truck } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-background overflow-hidden">
      <div className="relative h-screen w-screen">
        <div className="relative h-screen w-screen">
          {/* Mapa */}
          <Image
            src="/argentina.svg"
            alt="Mapa Argentina"
            fill
            className="object-contain opacity-25"
            fetchPriority="high"
          />

          {/* Camión */}
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2 animate-truck-route">
            <Truck className="h-10 w-10 text-primary drop-shadow-lg" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none">
          <div className="relative h-14 w-44">
            <Image
              src="/logo_infusio.png"
              alt="Logo Infusio"
              fill
              className="object-contain opacity-90"
              fetchPriority="high"
            />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground mt-3">
            Cargando
          </h1>
        </div>
      </div>
    </div>
  )
}