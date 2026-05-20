import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncUserFromClerk } from "@/app/lib/actions";

export async function POST() {
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sincronizando usuario con Clerk:", error);
    return NextResponse.json(
      { error: "Error al sincronizar usuario" },
      { status: 500 }
    );
  }
}