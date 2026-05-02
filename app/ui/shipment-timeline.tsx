import { CheckCircle2, Circle, Package, Truck, Home, Box } from "lucide-react"

interface TimelineEvent {
  status: string
  location: string
  date: string
  time: string
  completed: boolean
  current?: boolean
}

interface ShipmentTimelineProps {
  events: TimelineEvent[]
}

const getIcon = (status: string) => {
  if (status.includes("Entregado")) return Home
  if (status.includes("reparto") || status.includes("Tránsito")) return Truck
  if (status.includes("Enviado") || status.includes("centro")) return Package
  return Box
}

export function ShipmentTimeline({ events }: ShipmentTimelineProps) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const Icon = getIcon(event.status)
        const isLast = index === events.length - 1

        return (
          <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Line */}
            {!isLast && (
              <div 
                className={`absolute left-[19px] top-10 w-0.5 h-[calc(100%-2rem)] ${
                  event.completed ? "bg-primary" : "bg-border"
                }`}
              />
            )}

            {/* Icon */}
            <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              event.current 
                ? "bg-primary text-primary-foreground" 
                : event.completed 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary text-muted-foreground"
            }`}>
              {event.completed ? (
                event.current ? <Icon className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className={`font-medium ${event.current ? "text-foreground" : event.completed ? "text-foreground" : "text-muted-foreground"}`}>
                {event.status}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{event.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{event.date} • {event.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
