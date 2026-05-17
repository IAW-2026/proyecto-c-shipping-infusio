"use server"

import postgres from "postgres";
import { assignRoleToUser } from "./actions";
import { Rider, Shipment } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });


/* -------------- FETCH -------------- */
export async function fetchUserRoles(userId: string): Promise<string[]> {
  try {
    const result = await sql<{ role: string }[]>`
      SELECT role FROM "UserRole" WHERE "userId" = ${userId}
    `;

    return result.map((row) => row.role);
  } catch (error) {
    console.error("Error getting user roles:", error);
    throw error;
  }
}

export async function fetchAllRiders(): Promise<Rider[]> {
  try {
    const result = await sql<Rider[]>`
      SELECT * FROM "Rider"
    `;

    return result;
  } catch (error) {
    console.error("Error getting all riders:", error);
    throw error;
  }
}

export async function fetchRiderByActive(): Promise<Rider | null> {
  try {
    const result = await sql<Rider[]>`
      SELECT * FROM "Rider" WHERE status = 'activo'
    `;

    return result[0] || null;
  } catch (error) {
    console.error("Error getting active rider:", error);
    throw error;
  }
}

export async function fetchRiderById(userId: string): Promise<Rider | null> {
  try {
    const result = await sql<Rider[]>`
      SELECT * FROM "Rider" WHERE id = ${userId} LIMIT 1
    `;

    return result[0] || null;
  } catch (error) {
    console.error("Error getting rider by id:", error);
    throw error;
  }
}

export async function updateRiderStatus(
  userId: string,
  status: Rider["status"]
): Promise<Rider | null> {
  try {
    const result = await sql<Rider[]>`
      UPDATE "Rider"
      SET status = ${status}
      WHERE id = ${userId}
      RETURNING *
    `;

    return result[0] || null;
  } catch (error) {
    console.error("Error updating rider status:", error);
    throw error;
  }
}

export async function fetchAllShipments(): Promise<Shipment[]> {
  try {
    const result = await sql<Shipment[]>`
      SELECT * FROM "Shipment"
    `;

    return result;
  } catch (error) {
    console.error("Error getting all shipments:", error);
    throw error;
  }
}

export async function fetchAllTrackings() {
  try {
    const result = await sql`
      SELECT * FROM "Tracking"
      ORDER BY datetime DESC
    `;

    return result;
  } catch (error) {
    console.error("Error getting all trackings:", error);
    throw error;
  }
}

/* -------------- CREATE -------------- */
export async function createRiderProfile(
  userId: string,
  riderData: { name: string; email: string; location: string }
) {
  try {
    const result = await sql`
      INSERT INTO "Rider" (id, name, email, status, location)
      VALUES (${userId}, ${riderData.name}, ${riderData.email}, 'inactivo', ${riderData.location})
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name, location = EXCLUDED.location
      RETURNING *
    `;

    // Asignar rol de rider
    await assignRoleToUser(userId, "rider");

    return result[0];
  } catch (error) {
    console.error("Error creating rider profile:", error);
    throw error;
  }
}

// Crear logistic operator asociado a usuario
export async function createLogisticOperatorProfile(
  userId: string,
  operatorData: { name: string; email: string }
) {
  try {
    const result = await sql`
      INSERT INTO "LogisticOperator" (id, name, email)
      VALUES (${userId}, ${operatorData.name}, ${operatorData.email})
      ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name
      RETURNING *
    `;

    // Asignar rol de logistic_operator
    await assignRoleToUser(userId, "logistic_operator");

    return result[0];
  } catch (error) {
    console.error("Error creating logistic operator profile:", error);
    throw error;
  }
}