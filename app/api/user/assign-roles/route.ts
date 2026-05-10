import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assignRoleToUser } from "@/app/lib/actions";

const SELF_REGISTRABLE_ROLES = new Set([
  "rider",
  "logistic_operator",
]);

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

    const rolesValidos = roles.filter(
      (role) => typeof role === "string" && SELF_REGISTRABLE_ROLES.has(role)
    );

    if (rolesValidos.length === 0) {
      return NextResponse.json(
        { error: "No hay roles permitidos para auto-registro" },
        { status: 400 }
      );
    }

    // Asignar cada rol seleccionado
    for (const role of rolesValidos) {
      await assignRoleToUser(userId, role);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Roles asignados correctamente",
        roles: rolesValidos,
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
