import postgres from 'postgres';
import { clerkClient } from "@clerk/nextjs/server";
import { SHIPMENTS, SHIPMENT_TRACKINGS } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function createTables(sqlClient: any = sql) {
  await sqlClient`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sqlClient`CREATE TABLE IF NOT EXISTS shipment (
      id VARCHAR(255) PRIMARY KEY,
      buyerId VARCHAR(255) NOT NULL,
      sellerId VARCHAR(255) NOT NULL,
      origin VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      origin_datetime TIMESTAMP NOT NULL,
      destination_datetime TIMESTAMP NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS rider (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS tracking (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      shipment_id VARCHAR(255) NOT NULL REFERENCES shipment(id),
      status VARCHAR(255) NOT NULL,
      datetime TIMESTAMP NOT NULL,
      current_city VARCHAR(255) NOT NULL,
      next_city VARCHAR(255) NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS "user" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      surname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS user_role (
        user_id VARCHAR(255) NOT NULL REFERENCES "user"(id),
        role VARCHAR(50) NOT NULL,
        PRIMARY KEY (user_id, role)
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS logistic_operator (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS delivery_assignment (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        shipment_id VARCHAR(255) NOT NULL REFERENCES shipment(id),
        rider_id VARCHAR(255) REFERENCES rider(id),
        logistic_operator_id VARCHAR(255) REFERENCES logistic_operator(id)
    )`;
}

async function seedShipments(sqlClient: any = sql) {
  const insertedShipments = await Promise.all(
    SHIPMENTS.map((shipment) =>
      sqlClient`
        INSERT INTO shipment (id, buyerId, sellerId, origin, destination, origin_datetime, destination_datetime)
        VALUES (${shipment.id}, ${shipment.origin}, ${shipment.destination}, ${shipment.origin_datetime}, ${shipment.destination_datetime})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedShipments;
}

async function seedTrackings(sqlClient: any = sql) {
  const insertedTrackings = await Promise.all(
    SHIPMENT_TRACKINGS.map((tracking) =>
      sqlClient`
        INSERT INTO tracking (id, shipment_id, status, datetime, current_city, next_city)
        VALUES (${tracking.id}, ${tracking.shipment_id}, ${tracking.status}, ${tracking.datetime}, ${tracking.current_city}, ${tracking.next_city})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedTrackings;
}

async function seedUsersFromClerk(sqlClient: any = sql) {
  try {
    const clerk = await clerkClient();
    
    // Obtener todos los usuarios de Clerk
    const clerkUsers = await clerk.users.getUserList({ limit: 500 });
    
    console.log(`Sincronizando ${clerkUsers.data.length} usuarios de Clerk...`);
    
    for (const clerkUser of clerkUsers.data) {
      const userId = clerkUser.id;
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
      
      if (!email) {
        console.warn(`Usuario ${userId} sin email, omitiendo...`);
        continue;
      }
      
      // 1. Insertar o actualizar usuario
      await sqlClient`
        INSERT INTO "user" (id, name, surname, email)
        VALUES (${userId}, ${firstName}, ${lastName}, ${email})
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name, surname = EXCLUDED.surname, email = EXCLUDED.email
      `;
      
      // 2. Obtener roles del metadata de Clerk
      const roles = (clerkUser.publicMetadata?.roles as string[]) || [];
      
      // Siempre asignar el rol "viewer" por defecto
      const allRoles = Array.from(new Set(['viewer', ...roles]));
      
      // 3. Insertar roles del usuario
      for (const role of allRoles) {
        await sqlClient`
          INSERT INTO user_role (user_id, role)
          VALUES (${userId}, ${role})
          ON CONFLICT (user_id, role) DO NOTHING
        `;
      }
      
      // 4. Si tiene rol de rider, crear perfil en tabla rider
      if (allRoles.includes('rider')) {
        // Usar datos de Clerk o valores por defecto
        const riderName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        const riderEmail = email;
        const riderLocation = 'CABA'; // Valor por defecto
        
        await sqlClient`
          INSERT INTO rider (id, name, email, status, location)
          VALUES (${userId}, ${riderName}, ${riderEmail}, 'activo', ${riderLocation})
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name, email = EXCLUDED.email, status = EXCLUDED.status
        `;
      }
      
      // 5. Si tiene rol de logistic_operator, crear perfil en tabla logistic_operator
      if (allRoles.includes('logistic_operator')) {
        const operatorName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        const operatorEmail = email;
        
        await sqlClient`
          INSERT INTO logistic_operator (id, name, email)
          VALUES (${userId}, ${operatorName}, ${operatorEmail})
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name, email = EXCLUDED.email
        `;
      }
      
      console.log(`✓ Usuario sincronizado: ${email} (roles: ${allRoles.join(', ')})`);
    }
    
    console.log(`✓ Sincronización de usuarios completada`);
    return { success: true, count: clerkUsers.data.length };
  } catch (error) {
    console.error("Error seeding users from Clerk:", error);
    throw error;
  }
}

async function seedUsers(sqlClient: any = sql) {
  await sqlClient`CREATE TABLE IF NOT EXISTS "user" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      surname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS user_role (
        user_id VARCHAR(255) NOT NULL REFERENCES "user"(id),
        role VARCHAR(50) NOT NULL,
        PRIMARY KEY (user_id, role)
    )`;
  }

async function dropTables(sqlClient: any = sql) {
  await sqlClient`DROP TABLE IF EXISTS user_role`;
  await sqlClient`DROP TABLE IF EXISTS "user"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'sync-clerk-users';
    
    const result = await sql.begin(async (tx) => {
      // await createTables(tx);
      // await seedShipments(tx);
      // await seedTrackings(tx);
      // await dropTables(tx);
      
      if (action === 'sync-clerk-users' || action === 'all') {
        await seedUsersFromClerk(tx);
      }
    });

    return Response.json({ 
      message: 'Database seeded successfully',
      action,
      result 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}