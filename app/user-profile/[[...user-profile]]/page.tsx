// app/user-profile/[[...user-profile]]/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"

export default function UserProfilePage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <p>Cargando...</p>
  if (!user) return <p>No autenticado</p>

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 items-start justify-center px-6 py-10 lg:px-8">
      <div>
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.primaryEmailAddress?.emailAddress}</p>
        {/* Más datos del usuario */}
      </div>
    </div>
  )
}