"use client"

import { Card, CardContent } from "@/app/ui/card"
import { Mail, Bell } from "lucide-react"

const channels = [
    {
        id: "push",
        title: "Notificación Push",
        description: "Alertas instantáneas en tu dispositivo.",
        icon: Bell,
    },
  {
    id: "email",
    title: "Email",
    description: "Recibí avisos detallados en tu casilla.",
    icon: Mail,
  },
] as const

export default function SubscriptionPage() {
  return (
    <div className="mr-auto max-w-7xl px-6 py-10 lg:px-8 w-full">
            <div className="mb-12">
                <p className="text-sm uppercase tracking-widest text-primary font-medium mb-2">Seguimiento</p>
                <h1 className="font-serif text-3xl font-medium text-foreground mb-2">Suscripción</h1>
                <p className="text-muted-foreground">Elegí por qué medio te gustaría recibir los avances de tu envío.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {channels.map((channel) => {
                    const Icon = channel.icon

                    return (
                        <Card key={channel.id}>
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground mb-1">{channel.title}</h3>
                                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
    </div>      
  )
}
