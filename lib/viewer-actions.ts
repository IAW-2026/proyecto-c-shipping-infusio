import { Truck, History, Bell, Download, AlertTriangle, HeadphonesIcon } from "lucide-react"

export const viewerMenuItems = [
  {
    id: 1,
    title: "Hacer seguimiento",
    description: "Rastrear tu envío en tiempo real",
    icon: Truck,
    href: "/viewer-refactor/tracking",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    title: "Historial de envíos",
    description: "Consulta todos tus envíos anteriores",
    icon: History,
    href: "#",
    color: "text-foreground",
    bgColor: "bg-muted/50"
  },
  {
    id: 3,
    title: "Suscripción a eventos",
    description: "Recibe notificaciones de cambios en tu envío",
    icon: Bell,
    href: "/viewer-refactor/subscription",
    color: "text-accent",
    bgColor: "bg-accent/10"
  },
  {
    id: 4,
    title: "Contactar soporte",
    description: "Habla con nuestro equipo de atención",
    icon: HeadphonesIcon,
    href: "/help",
    color: "text-primary",
    bgColor: "bg-primary/5"
  }
]

