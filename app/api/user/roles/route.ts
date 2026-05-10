import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureDefaultUserRoles, getUserRoles } from "@/app/lib/actions";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await ensureDefaultUserRoles(userId);
    const roles = await getUserRoles(userId);

    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 });
  }
}
