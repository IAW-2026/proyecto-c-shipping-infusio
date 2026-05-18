import Image from "next/image"
import { Truck } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-full w-full max-w-md">
          {/* Mapa */}
          <Image
            src="/argentina.svg"
            alt="Mapa Argentina"
            fill
            className="object-contain opacity-25"
            priority
          />

          {/* Camión */}
          <div className="absolute left-1/2 top-[6%] -translate-x-1/2 animate-truck-route">
            <Truck className="h-10 w-10 text-primary drop-shadow-lg" />
          </div>
        </div>

        <div className="text-center">
          <div className="relative mx-auto mt-3 w-15 h-15">
            <Image
              src="/logo_infusio.png"
              alt="Logo Infusio"
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Cargando
          </h1>
        </div>
      </div>
    </div>
  )
}