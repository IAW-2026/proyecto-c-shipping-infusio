"use client"

import { Search } from "lucide-react"
import { Button } from "@/app/ui/button"

export function TrackingInput() {
    return (
    <form className="w-full">
      <div className="flex w-full items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 text-muted-foreground w-5" />
          <input
            type="text"
            placeholder="Ingresá tu código de seguimiento..."
            className="h-14 w-full rounded-full border-border/50 bg-card pl-12 text-base focus-visible:ring-primary"
            />
        </div>
      </div>
    </form>
  )
}
