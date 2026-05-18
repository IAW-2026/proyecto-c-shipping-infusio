// proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
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
  "/sitemap.xml"
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isOperatorRoute = createRouteMatcher(["/user-profile/logistics(.*)"])
const isRiderRoute = createRouteMatcher(["/user-profile/rider(.*)"])

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

  const roles = (sessionClaims?.public_metadata as { roles?: string[] } | undefined)?.roles
  const userRoles = (roles ?? []) as string[]

  if (isAdminRoute(req)) {
    if (!hasAnyRole(userRoles, ["admin", "adminShipping"])) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (isOperatorRoute(req)) {
    if (!hasAnyRole(userRoles, ["logistic_operator"])) {
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