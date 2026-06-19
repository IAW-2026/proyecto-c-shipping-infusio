import { NextRequest, NextResponse } from "next/server";
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const authError = validateApiKeyMiddleware(
      request,
      process.env.INTERNAL_API_KEY!
    );

    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        UserRole: true,
        Rider: true,
        LogisticOperator: true,
        PushSubscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const deletedAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const updatedRider = user.Rider
        ? await tx.rider.update({
            where: { id: user.Rider.id },
            data: {
              status: "inactivo",
              active: false,
              deletedAt,
              userId: null,
            },
          })
        : null;

      const updatedLogisticOperator = user.LogisticOperator
        ? await tx.logisticOperator.update({
            where: { id: user.LogisticOperator.id },
            data: {
              active: false,
              deletedAt,
              userId: null,
            },
          })
        : null;

      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      await tx.pushSubscription.deleteMany({
        where: { userId: id },
      });

      const deletedUser = await tx.user.update({
        where: { id },
        data: {
          active: false,
          deletedAt,
          pushSub: false,
          emailSub: false,
        },
      });

      return {
        user: deletedUser,
        rider: updatedRider,
        logisticOperator: updatedLogisticOperator,
      };
    });

    return NextResponse.json(
      {
        message: "Usuario dado de baja correctamente",
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error dando de baja usuario:", error);

    return NextResponse.json(
      { error: "Error al dar de baja el usuario" },
      { status: 500 }
    );
  }
}