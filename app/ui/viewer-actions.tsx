"use client"

import { viewerMenuItems } from "@/lib/viewer-actions"
import Link from "next/link"
import { Card, CardContent } from "./card";

export function ViewerActions() {
  const menuItems = viewerMenuItems

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.id} href={item.href} className="group block h-full">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </>
  )
}