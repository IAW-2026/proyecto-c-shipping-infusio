"use server";

import { clerkClient } from "@clerk/nextjs/server";
import postgres from "postgres";
import { User, UserRole as DbUserRole, Roles } from "./definitions";
import { fetchUserRoles as getUserRoles } from "./data";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const DEFAULT_USER_ROLES = ["viewer"] as const;
const EXTRA_USER_ROLES = ["rider", "logistic_operator", "admin", "shipping_admin", "buyer", "seller"] as const;
const ALL_USER_ROLES = [...DEFAULT_USER_ROLES, ...EXTRA_USER_ROLES] as const;

type UserRole = (typeof ALL_USER_ROLES)[number];

type ClerkMetadata = {
  roles?: unknown;
};

type ClerkUserLike = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
  email_addresses?: Array<{ email_address: string }>;
  publicMetadata?: ClerkMetadata;
  public_metadata?: ClerkMetadata;
};

function parseRoles(roles: unknown): UserRole[] {
  if (!Array.isArray(roles)) {
    return [];
  }

  const normalizedRoles = new Set<UserRole>();

  for (const role of roles) {
    if (typeof role !== "string") {
      continue;
    }

    if ((ALL_USER_ROLES as readonly string[]).includes(role)) {
      normalizedRoles.add(role as UserRole);
    }
  }

  return [...normalizedRoles];
}

function withDefaultRoles(roles: UserRole[]) {
  return [...new Set<UserRole>([...DEFAULT_USER_ROLES, ...roles])];
}

function getRolesFromMetadata(metadata?: ClerkMetadata | null) {
  return parseRoles(metadata?.roles);
}

async function getClerkClientInstance() {
  return clerkClient();
}

async function getClerkUserRoles(userId: string): Promise<UserRole[]> {
  const clerk = await getClerkClientInstance();
  const clerkUser = await clerk.users.getUser(userId);
  const typedUser = clerkUser as ClerkUserLike;

  return parseRoles(
    typedUser.publicMetadata?.roles ?? typedUser.public_metadata?.roles
  );
}

async function setClerkUserRoles(userId: string, roles: UserRole[]) {
  const clerk = await getClerkClientInstance();
  const clerkUser = await clerk.users.getUser(userId);
  const typedUser = clerkUser as ClerkUserLike;
  const currentMetadata =
    (typedUser.publicMetadata ?? typedUser.public_metadata ?? {}) as Record<string, unknown>;

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...currentMetadata,
      roles: withDefaultRoles(roles),
    },
  });
}

async function syncDatabaseRoles(userId: string, roles: UserRole[]) {
  const desiredRoles = withDefaultRoles(roles);
  const currentRoles = parseRoles(await getUserRoles(userId));
  const desiredRolesSet = new Set(desiredRoles);
  const currentRolesSet = new Set(currentRoles);

  for (const role of currentRoles) {
    if (desiredRolesSet.has(role)) {
      continue;
    }

    await sql`
      DELETE FROM UserRole WHERE userId = ${userId} AND role = ${role}
    `;
  }

  for (const role of desiredRoles) {
    if (currentRolesSet.has(role)) {
      continue;
    }

    await sql`
      INSERT INTO UserRole (userId, role)
      VALUES (${userId}, ${role})
      ON CONFLICT (userId, role) DO NOTHING
    `;
  }
}

async function getCanonicalRoles(userId: string): Promise<UserRole[]> {
  const clerkRoles = await getClerkUserRoles(userId);

  if (clerkRoles.length > 0) {
    return withDefaultRoles(clerkRoles);
  }

  const databaseRoles = parseRoles(await getUserRoles(userId));

  if (databaseRoles.length > 0) {
    return withDefaultRoles(databaseRoles);
  }

  return withDefaultRoles([]);
}

export async function ensureDefaultUserRoles(userId: string) {
  const clerkRoles = await getClerkUserRoles(userId);
  const databaseRoles = parseRoles(await getUserRoles(userId));
  const mergedRoles = withDefaultRoles([...clerkRoles, ...databaseRoles]);

  await setClerkUserRoles(userId, mergedRoles);
  await syncDatabaseRoles(userId, mergedRoles);

  return mergedRoles;
}

// Crear o actualizar usuario desde Clerk
export async function syncUserFromClerk(clerkUser: ClerkUserLike) {
  try {
    const normalizedEmails =
      clerkUser.emailAddresses?.map((email) => email.emailAddress) ??
      clerkUser.email_addresses?.map((email) => email.email_address) ??
      [];

    const email = normalizedEmails[0];
    if (!email) throw new Error("No email found");

    const firstName = clerkUser.first_name ?? clerkUser.firstName ?? "";
    const lastName = clerkUser.last_name ?? clerkUser.lastName ?? "";

    console.log("Syncing user:", { ...clerkUser, email });

    const user = await sql.begin(async (tx) => {
      const existingById = await tx`
        SELECT id, email
        FROM User
        WHERE id = ${clerkUser.id}
        LIMIT 1
      `;

      if (existingById.length > 0) {
        const updatedById = await tx`
          UPDATE User
          SET name = ${firstName},
              surname = ${lastName},
              email = ${email}
          WHERE id = ${clerkUser.id}
          RETURNING *
        `;

        return updatedById[0] as User;
      }

      const existingByEmail = await tx`
        SELECT id
        FROM User
        WHERE email = ${email}
        LIMIT 1
      `;

      if (existingByEmail.length > 0) {
        const updatedByEmail = await tx`
          UPDATE "user"
          SET id = ${clerkUser.id},
              name = ${firstName},
              surname = ${lastName}
          WHERE email = ${email}
          RETURNING *
        `;

        return updatedByEmail[0] as User;
      }

      const inserted = await tx`
        INSERT INTO User (id, name, surname, email)
        VALUES (${clerkUser.id}, ${firstName}, ${lastName}, ${email})
        RETURNING *
      `;

      return inserted[0] as User;
    });

    const clerkMetadataRoles = getRolesFromMetadata(
      clerkUser.publicMetadata ?? clerkUser.public_metadata
    );

    if (clerkMetadataRoles.length > 0) {
      await setClerkUserRoles(user.id, clerkMetadataRoles);
      await syncDatabaseRoles(user.id, clerkMetadataRoles);
    } else {
      await ensureDefaultUserRoles(user.id);
    }

    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
}

// Asignar rol a un usuario
export async function assignRoleToUser(userId: string, role: string) {
  try {
    if (!(ALL_USER_ROLES as readonly string[]).includes(role)) {
      throw new Error(`Rol no permitido: ${role}`);
    }

    const canonicalRoles = await getCanonicalRoles(userId);
    const nextRoles = withDefaultRoles([...canonicalRoles, role as UserRole]);

    await setClerkUserRoles(userId, nextRoles);
    await syncDatabaseRoles(userId, nextRoles);

    const result = await sql`
      INSERT INTO UserRole (userId, role)
      VALUES (${userId}, ${role})
      ON CONFLICT (userId, role) DO NOTHING
      RETURNING *
    `;

    return result[0] as DbUserRole;
  } catch (error) {
    console.error("Error assigning role:", error);
    throw error;
  }
}

// Eliminar un rol de un usuario
export async function removeRoleFromUser(userId: string, role: string) {
  try {
    if (!(ALL_USER_ROLES as readonly string[]).includes(role)) {
      throw new Error(`Rol no permitido: ${role}`);
    }

    const canonicalRoles = await getCanonicalRoles(userId);
    const nextRoles = withDefaultRoles(
      canonicalRoles.filter((currentRole) => currentRole !== role)
    );

    await setClerkUserRoles(userId, nextRoles);
    await syncDatabaseRoles(userId, nextRoles);

    await sql`
      DELETE FROM user_role WHERE user_id = ${userId} AND role = ${role}
    `;

    return true;
  } catch (error) {
    console.error("Error removing role:", error);
    throw error;
  }
}