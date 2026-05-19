"use client"

import { useEffect, useState } from "react"
import { Mail, Bell } from "lucide-react"
import { Card, CardContent } from "@/app/ui/utils/card"

const channels = [
  {
    id: "email",
    title: "Email",
    description: "Recibí avisos detallados en tu casilla.",
    icon: Mail,
  },
  {
    id: "push",
    title: "Notificación Push",
    description: "Alertas instantáneas en tu dispositivo.",
    icon: Bell,
  },
] as const

export default function SubscriptionPage() {
  const [emailSub, setEmailSub] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubscription = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/user/subscription", { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudo obtener la suscripción")
        }

        setEmailSub(Boolean(data?.emailSub))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const toggleEmailSub = async () => {
    if (loading || saving) return

    setSaving(true)
    setError(null)
    const nextValue = !emailSub

    try {
      const response = await fetch("/api/user/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailSub: nextValue }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo actualizar la suscripción")
      }

      setEmailSub(Boolean(data?.emailSub))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mr-auto w-full max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-12">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Seguimiento</p>
        <h1 className="mb-2 font-serif text-3xl font-medium text-foreground">Suscripción</h1>
        <p className="text-muted-foreground">Elegí por qué medio te gustaría recibir los avances de tu envío.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {channels.map((channel) => {
          const Icon = channel.icon
          const isEmail = channel.id === "email"

          return (
            <Card key={channel.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-medium text-foreground">{channel.title}</h3>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>

                  {isEmail ? (
                    <button
                      type="button"
                      onClick={toggleEmailSub}
                      disabled={loading || saving}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        emailSub
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {loading ? "Cargando..." : saving ? "Guardando..." : emailSub ? "Activado" : "Desactivado"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Próximamente
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
    </div>
  )
}

