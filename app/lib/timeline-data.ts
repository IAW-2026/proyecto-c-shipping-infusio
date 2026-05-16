import { TimelineStatuses } from "./definitions";

export const timelineEvents = [
  {
    status: TimelineStatuses.CONFIRMED,
    location: "Tienda Online Infusio",
    date: "24 Abril 2026",
    time: "10:30",
    completed: true
  },
  {
    status: TimelineStatuses.PREPARING,
    location: "Centro de Distribución - Palermo",
    date: "24 Abril 2026",
    time: "14:15",
    completed: true
  },
  {
    status: TimelineStatuses.IN_TRANSIT,
    date: "26 Abril 2026",
    time: "08:45",
    completed: true,
  },
  {
    status: TimelineStatuses.ARRIVED_CITY,
    location: "Centro Logístico - Bahía Blanca",
    date: "26 Abril 2026",
    time: "08:45",
    completed: true,
    current: true
  },
  {
    status: TimelineStatuses.OUT_FOR_DELIVERY,
    location: "Tu zona",
    date: "Pendiente",
    time: "--:--",
    completed: false
  },
  {
    status: TimelineStatuses.DELIVERED,
    location: "Tu dirección",
    date: "Pendiente",
    time: "--:--",
    completed: false
  }
]
