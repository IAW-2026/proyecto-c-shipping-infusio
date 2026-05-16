import postgres from 'postgres';
import { clerkClient } from "@clerk/nextjs/server";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
        INSERT INTO "User" (id, name, surname, email)
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
          INSERT INTO "UserRole" ("userId", role)
          VALUES (${userId}, ${role})
          ON CONFLICT ("userId", role) DO NOTHING
        `;
      }
      
      // 4. Si tiene rol de rider, crear perfil en tabla rider
      if (allRoles.includes('rider')) {
        // Usar datos de Clerk o valores por defecto
        const riderName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        const riderEmail = email;
        const riderLocation = 'CABA'; // Valor por defecto
        
        await sqlClient`
          INSERT INTO "Rider" (id, name, email, status, location)
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
          INSERT INTO "LogisticOperator" (id, name, email)
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

async function dropTables(sqlClient: any = sql) {
  await sqlClient`DROP TABLE IF EXISTS "UserRole"`;
  await sqlClient`DROP TABLE IF EXISTS "User"`;
  await sqlClient`DROP TABLE IF EXISTS "Tracking"`;
  await sqlClient`DROP TABLE IF EXISTS "DeliveryAssignment"`;
  await sqlClient`DROP TABLE IF EXISTS "Rider"`;
  await sqlClient`DROP TABLE IF EXISTS "LogisticOperator"`;
  await sqlClient`DROP TABLE IF EXISTS "Shipment"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'sync-clerk-users';
    
    const result = await sql.begin(async (tx) => {
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