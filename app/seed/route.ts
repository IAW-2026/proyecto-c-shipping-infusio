import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { clerkClient } from '@clerk/nextjs/server';
import { SHIPMENTS, SHIPMENT_TRACKINGS } from '../lib/placeholder-data';
import { TimelineStatuses } from '../lib/definitions';

const connectionString = process.env.PRISMA_DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Map descriptive strings to Prisma enum values
const statusMap: Record<string, string> = {
  [TimelineStatuses.CONFIRMED]: 'CONFIRMED',
  [TimelineStatuses.PREPARING]: 'PREPARING',
  [TimelineStatuses.IN_TRANSIT]: 'IN_TRANSIT',
  [TimelineStatuses.ARRIVED_CITY]: 'ARRIVED_CITY',
  [TimelineStatuses.OUT_FOR_DELIVERY]: 'OUT_FOR_DELIVERY',
  [TimelineStatuses.DELIVERED]: 'DELIVERED',
  [TimelineStatuses.CANCELLED]: 'CANCELLED',
  [TimelineStatuses.WITH_ISSUE]: 'WITH_ISSUE',
};

function mapStatusToPrismaEnum(status: string): string {
  return statusMap[status] || 'CONFIRMED';
}

async function seedShipments(prismaClient: PrismaClient = prisma) {
  const ops = SHIPMENTS.map((shipment) =>
    prismaClient.shipment.upsert({
      where: { id: shipment.id },
      create: {
        id: shipment.id,
        origin: shipment.origin,
        destination: shipment.destination,
        originDatetime: new Date(shipment.originDatetime),
        destinationDatetime: new Date(shipment.destinationDatetime!),
        buyerId: shipment.buyerId,
        sellerId: shipment.sellerId,
      },
      update: {},
    }),
  );

  return Promise.all(ops);
}

async function seedTrackings(prismaClient: PrismaClient = prisma) {
  const ops = SHIPMENT_TRACKINGS.map(async (tracking) => {
    const datetime = new Date(tracking.datetime);
    
    const existing = await prismaClient.tracking.findFirst({
      where: {
        shipmentId: tracking.shipmentId,
        datetime: datetime,
      },
    });

    if (existing) {
      // Update existing
        return prismaClient.tracking.updateMany({
          where: {
            shipmentId: tracking.shipmentId,
            datetime: datetime,
          },
        data: {
          status: mapStatusToPrismaEnum(tracking.status) as any,
          currentCity: tracking.currentCity,
          nextCity: tracking.nextCity,
          completed: tracking.completed,
          current: tracking.current,
        },
      });
    } else {
      // Create new
      return prismaClient.tracking.create({
        data: {
          shipmentId: tracking.shipmentId,
          orderId: tracking.orderId,
          status: mapStatusToPrismaEnum(tracking.status) as any,
          datetime: datetime,
          currentCity: tracking.currentCity,
          nextCity: tracking.nextCity,
          completed: tracking.completed,
          current: tracking.current,
        },
      });
    }
  });

  return Promise.all(ops);
}

async function seedUsersFromClerk(prismaClient: PrismaClient = prisma) {
  try {
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({ limit: 500 });
    const users = clerkUsers.data;

    console.log(`Sincronizando ${users.length} usuarios de Clerk...`);

    for (const clerkUser of users) {
      const userId = clerkUser.id;
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';

      if (!email) {
        console.warn(`Usuario ${userId} sin email, omitiendo...`);
        continue;
      }

      await prismaClient.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          name: firstName || '',
          surname: lastName || '',
          email,
          pushSub: false,
          emailSub: false,
        },
        update: {
          name: firstName || '',
          surname: lastName || '',
          email,
        },
      });

      const roles = (clerkUser.publicMetadata?.roles as string[]) || [];
      const allRoles = Array.from(new Set(['viewer', ...roles]));

      // Insert roles using createMany to skip duplicates
      const roleData = allRoles.map((role) => ({ userId, role: role as any }));
      try {
        await prismaClient.userRole.createMany({ data: roleData, skipDuplicates: true });
      } catch (e) {
        // Fallback: create one by one
        for (const r of roleData) {
          try {
            await prismaClient.userRole.create({ data: r as any });
          } catch (err) {
            // ignore duplicates
          }
        }
      }

      if (allRoles.includes('rider')) {
        const riderName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        await prismaClient.rider.upsert({
          where: { id: userId },
          create: {
            id: userId,
            name: riderName,
            email,
            status: 'activo',
            location: 'CABA',
          },
          update: {
            name: riderName,
            email,
            status: 'activo',
          },
        });
      }

      if (allRoles.includes('logistic_operator')) {
        const operatorName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
        await prismaClient.logisticOperator.upsert({
          where: { id: userId },
          create: { id: userId, name: operatorName, email },
          update: { name: operatorName, email },
        });
      }

      console.log(`✓ Usuario sincronizado: ${email} (roles: ${allRoles.join(', ')})`);
    }

    console.log(`✓ Sincronización de usuarios completada`);
    return { success: true, count: users.length };
  } catch (error) {
    console.error('Error seeding users from Clerk:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'sync-clerk-users';
    let result: any = null;

    if (action === 'sync-clerk-users' || action === 'all') {
      result = await seedUsersFromClerk(prisma);
    }

    if (action === 'shipments' || action === 'all') {
      await seedShipments(prisma);
    }

    if (action === 'trackings' || action === 'all') {
      await seedTrackings(prisma);
    }

    return Response.json({ message: 'Database seeded successfully', action, result });
  } catch (error: any) {
    console.error('Seed error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}