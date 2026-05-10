"use client"

import Link from "next/link"
import { ChevronDown, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"

type ProfileRole = "buyer" | "seller" | "rider" | "logistic_operator" | "admin"

const ROLE_METADATA: Record<ProfileRole, { label: string; href: string }> = {
  buyer: { label: "Comprador", href: "/user-profile" },
  seller: { label: "Vendedor", href: "/user-profile" },
  rider: { label: "Repartidor", href: "/user-profile/rider" },
  logistic_operator: { label: "Operador Logístico", href: "/user-profile/logistics" },
  admin: { label: "Administrador", href: "/admin" },
}

const EXTRA_SELF_REGISTRABLE_ROLES: ProfileRole[] = ["rider", "logistic_operator"]

function getRoleEntries(userRoles: ProfileRole[]) {
  const hasBuyerOrSeller = userRoles.includes("buyer") || userRoles.includes("seller")
  const uniqueRoles = userRoles.filter((role) => role !== "buyer" && role !== "seller")

  const entries: Array<{ key: string; title: string; subtitle: string; href: string }> = []

  for (const role of uniqueRoles) {
    const metadata = ROLE_METADATA[role]

    if (!metadata) {
      continue
    }

    entries.push({
      key: role,
      title: `Entrar como ${metadata.label}`,
      subtitle: metadata.label,
      href: metadata.href,
    })
  }

  return entries
}

export function ProfileMenu() {
  const { isSignedIn, isLoaded } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [roles, setRoles] = useState<ProfileRole[] | null>(null)
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [savingRole, setSavingRole] = useState<ProfileRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!isSignedIn || !menuOpen || roles !== null || loadingRoles) {
      return
    }

    const fetchRoles = async () => {
      setLoadingRoles(true)
      setError(null)

      try {
        const response = await fetch("/api/user/roles", { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudieron obtener los roles")
        }

        setRoles(Array.isArray(data?.roles) ? data.roles : [])
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Error desconocido"
        setError(message)
        setRoles([])
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [isSignedIn, menuOpen, roles, loadingRoles])

  const registerRole = async (role: ProfileRole) => {
    setSavingRole(role)
    setError(null)

    try {
      const response = await fetch("/api/user/assign-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: [role] }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo registrar el rol")
      }

      setRoles((prev) => {
        const current = prev ?? []
        if (current.includes(role)) return current
        return [...current, role]
      })
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : "Error desconocido"
      setError(message)
    } finally {
      setSavingRole(null)
    }
  }

  if (!isLoaded || !isSignedIn) {
    return null
  }

  const userRoles = roles ?? []
  const hasRoles = userRoles.length > 0
  const roleEntries = getRoleEntries(userRoles)
  const availableExtraRoles = EXTRA_SELF_REGISTRABLE_ROLES.filter((role) => !userRoles.includes(role))

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        className="btn btn-default btn-sm w-full justify-center rounded-full"
        onClick={() => setMenuOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <User className="h-4 w-4 mr-2" />
        Mi perfil
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <div className="mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lg md:absolute md:right-0 md:top-full md:z-50 md:w-80">
          <div className="max-h-96 overflow-y-auto px-4 pt-6 pb-4 space-y-4">
          {loadingRoles ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Cargando roles...</p>
          ) : (
            <>
              {hasRoles ? (
                <div className="space-y-3">
                  <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tus roles</p>
                  {roleEntries.map((entry) => (
                    <Link
                      key={entry.key}
                      href={entry.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span>{entry.title}</span>
                      <span className="text-xs text-muted-foreground">{entry.subtitle}</span>
                    </Link>
                  ))}

                  <div className="h-px bg-border" />

                  <Link
                    href="/user-profile"
                    className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ir al panel de usuario
                  </Link>

                  {availableExtraRoles.length > 0 && (
                    <>
                      <div className="h-px bg-border" />

                      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agregar roles extra</p>
                      {availableExtraRoles.map((role) => {
                        const metadata = ROLE_METADATA[role]
                        const isSaving = savingRole === role

                        return (
                          <button
                            key={role}
                            type="button"
                            className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                            onClick={() => registerRole(role)}
                            disabled={isSaving || !!savingRole}
                          >
                            {isSaving ? "Registrando..." : `Agregar rol ${metadata.label}`}
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="px-3 py-1 text-sm text-muted-foreground">
                    Configurando tus roles base. Si no aparecen, recarga la página.
                  </p>

                  <div className="h-px bg-border" />

                  {EXTRA_SELF_REGISTRABLE_ROLES.map((role) => {
                    const metadata = ROLE_METADATA[role]
                    const isSaving = savingRole === role

                    return (
                      <button
                        key={role}
                        type="button"
                        className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                        onClick={() => registerRole(role)}
                        disabled={isSaving || !!savingRole}
                      >
                        {isSaving ? "Registrando..." : `Agregar rol ${metadata.label}`}
                      </button>
                    )
                  })}
                </div>
              )}

              {error && <p className="px-3 pt-2 text-xs text-red-500">{error}</p>}
            </>
          )}
          </div>
        </div>
      )}
    </div>
  )
}
