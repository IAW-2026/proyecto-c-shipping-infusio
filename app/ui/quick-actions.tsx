import { Card, CardContent } from "./card"
import Link from "next/link"
import { quickActions } from "@/lib/quick-actions-data"

export function QuickActions() {
  const actions = quickActions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action, index) => (
        <Link key={index} href={action.link} className="group block h-full">
        <Card 
          key={index} 
          className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-md transition-all bg-card"
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <action.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      ))}
    </div>
  )
}
