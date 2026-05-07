"use client"

import { ViewerActions } from "@/app/ui/viewer-actions"

export default function ViewerPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Tu cuenta</p>
        <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Centro de Seguimiento</h1>
        <p className="text-muted-foreground">Gestioná tus envíos y consultas en un solo lugar</p>
      </div>

      {/* Grid de menú */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ViewerActions />
      </div>
    </div>
  )
}
