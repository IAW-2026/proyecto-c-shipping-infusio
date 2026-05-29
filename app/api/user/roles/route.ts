import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureDefaultUserRoles, syncUserFromClerk } from "@/app/lib/actions";
import { fetchUserRoles as getUserRoles } from "@/app/lib/data";

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await syncUserFromClerk({
      id: clerkUser.id,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      emailAddresses: clerkUser.emailAddresses.map((email) => ({
        emailAddress: email.emailAddress,
      })),
      publicMetadata: clerkUser.publicMetadata as { roles?: unknown } | undefined,
    });

    const userId = clerkUser.id;
    await ensureDefaultUserRoles(userId);
    const roles = await getUserRoles(userId);

    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 });
  }
}
