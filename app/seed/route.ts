import postgres from 'postgres';
import { SHIPMENTS, SHIPMENT_TRACKINGS } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function createTables(sqlClient: any = sql) {
  await sqlClient`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sqlClient`CREATE TABLE IF NOT EXISTS shipment (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      origin VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      origin_datetime TIMESTAMP NOT NULL,
      destination_datetime TIMESTAMP NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS logistic_operator (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS rider (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      status VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL
    )`;

  await sqlClient`CREATE TABLE IF NOT EXISTS tracking (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      shipment_id UUID NOT NULL REFERENCES shipment(id),
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

  await sqlClient`CREATE TABLE IF NOT EXISTS delivery_assignment (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        shipment_id UUID NOT NULL REFERENCES shipment(id),
        rider_id UUID NOT NULL REFERENCES rider(id),
        logistic_operator_id UUID NOT NULL REFERENCES logistic_operator(id)
    )`;
}

async function seedShipments(sqlClient: any = sql) {
  const insertedShipments = await Promise.all(
    SHIPMENTS.map((shipment) =>
      sqlClient`
        INSERT INTO shipment (id, origin, destination, origin_datetime, destination_datetime)
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

export async function GET() {
  try {
    await sql.begin(async (tx) => {
      await createTables(tx);
      await seedShipments(tx);
      await seedTrackings(tx);
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}