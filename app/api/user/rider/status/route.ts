import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchRiderById, updateRiderStatus } from "@/app/lib/data";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rider = await fetchRiderById(userId);

    if (!rider) {
      return NextResponse.json({ error: "No se encontró el rider" }, { status: 404 });
    }

    return NextResponse.json({ status: rider.status }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo estado del rider:", error);
    return NextResponse.json({ error: "Error al obtener el estado" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const rider = await fetchRiderById(userId);

    if (!rider) {
      return NextResponse.json({ error: "No se encontró el rider" }, { status: 404 });
    }

    const nextStatus = rider.status === "activo" ? "inactivo" : "activo";
    const updatedRider = await updateRiderStatus(userId, nextStatus);

    if (!updatedRider) {
      return NextResponse.json({ error: "No se pudo actualizar el estado" }, { status: 500 });
    }

    return NextResponse.json({ status: updatedRider.status }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando estado del rider:", error);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}