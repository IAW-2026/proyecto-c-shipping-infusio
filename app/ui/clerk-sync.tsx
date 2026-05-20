"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function ClerkSync() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const lastSyncKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      lastSyncKeyRef.current = null;
      return;
    }

    const syncKey = `${pathname ?? ""}:${isSignedIn}`;

    if (lastSyncKeyRef.current === syncKey) {
      return;
    }

    lastSyncKeyRef.current = syncKey;

    const syncUser = async () => {
      try {
        await fetch("/api/user/sync", {
          method: "POST",
          cache: "no-store",
        });
      } catch (error) {
        console.error("Error al sincronizar Clerk desde la app:", error);
      }
    };

    void syncUser();
  }, [isLoaded, isSignedIn, pathname]);

  return null;
}