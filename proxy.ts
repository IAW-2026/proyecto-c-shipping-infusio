// proxy.ts
import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/tracking(.*)",
  "/contact",
  "/privacy",
  "/terms",
  "/help",
  "/shipping-policies",
  "/sitemap.xml",
  "/api(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isOperatorRoute = createRouteMatcher(["/user-profile/logistics(.*)"])
const isRiderRoute = createRouteMatcher(["/user-profile/rider(.*)"])

type ClerkUserLike = {
  publicMetadata?: { roles?: unknown }
  public_metadata?: { roles?: unknown }
}

function parseRoles(roles: unknown) {
  if (!Array.isArray(roles)) {
    return [] as string[]
  }

  return roles.filter((role): role is string => typeof role === "string")
}

async function getUserRoles(userId: string, sessionClaims: Record<string, unknown> | null | undefined) {
  const sessionRoles = parseRoles(
    (sessionClaims?.publicMetadata as { roles?: unknown } | undefined)?.roles ??
      (sessionClaims?.public_metadata as { roles?: unknown } | undefined)?.roles
  )

  if (sessionRoles.length > 0) {
    return sessionRoles
  }

  const clerk = await clerkClient()
  const clerkUser = (await clerk.users.getUser(userId)) as ClerkUserLike

  return parseRoles(clerkUser.publicMetadata?.roles ?? clerkUser.public_metadata?.roles)
}

function hasAnyRole(userRoles: string[], allowedRoles: string[]) {
  return allowedRoles.some((role) => userRoles.includes(role))
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth()

  if (isPublicRoute(req)) {
    return
  }

  if (!userId) {
    return redirectToSignIn()
  }

  const userRoles = await getUserRoles(userId, sessionClaims as Record<string, unknown> | null | undefined)

  if (isAdminRoute(req)) {
    if (!hasAnyRole(userRoles, ["admin", "adminShipping"])) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (isOperatorRoute(req)) {
    if (!hasAnyRole(userRoles, ["logistic_operator", "OL"])) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (isRiderRoute(req)) {
    if (!hasAnyRole(userRoles, ["rider"])) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
}