import { HelpCircle, FileText, ShoppingCart, OctagonAlert } from "lucide-react"

export const quickActions = [
  {
    icon: HelpCircle,
    title: "Centro de Ayuda",
    description: "Preguntas frecuentes y soporte",
    link: "/help"
  },
  {
    icon: FileText,
    title: "Políticas de Envío",
    description: "Tiempos y costos de entrega",
    link: "/shipping-policies"
  },
  {
    icon: ShoppingCart,
    title: "Seguir comprando",
    description: "¿Te quedaste con ganas de más? Explorá nuestra tienda",
    link: "https://proyecto-c-buyer-infusio.vercel.app/"
  },
  {
    icon: OctagonAlert,
    title: "Reportar un problema",
    description: "¿Tu envío tiene un problema? Contáctanos",
    link: "/contact"
  }
]
