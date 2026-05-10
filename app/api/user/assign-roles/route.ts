import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assignRoleToUser, removeRoleFromUser } from "@/app/lib/actions";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { roles } = await req.json();

    if (!Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "Roles inválidos" },
        { status: 400 }
      );
    }

    // Asignar cada rol seleccionado
    for (const role of roles) {
      await assignRoleToUser(userId, role);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Roles asignados correctamente",
        roles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error asignando roles:", error);
    return NextResponse.json(
      { error: "Error al asignar roles" },
      { status: 500 }
    );
  }
}
