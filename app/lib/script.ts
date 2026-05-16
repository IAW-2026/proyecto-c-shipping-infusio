import { prisma } from "./prisma";

async function main() {
  await seedShipments();
  await seedTrackings();
}

async function seedShipments() {
  const shipment1 = await prisma.shipment.create({
    data: {
        id: 'SHIPAA001',
        origin: 'CABA, Buenos Aires, Argentina',
        destination: 'Zelarrayán 233, Bahía Blanca, Buenos Aires, Argentina',
        originDatetime: '2024-01-01T10:00:00Z',
        destinationDatetime: '2024-01-02T18:00:00Z',
        sellerId: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
        buyerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
    },
    include: {
        deliveryAssignments: false,
        trackings: false,
    },
  });
  console.log("Created shipment:", shipment1);

  const shipment2 = await prisma.shipment.create({
    data: {
        id: 'SHIPAA002',
        origin: 'Rosario, Santa Fe, Argentina',
        destination: 'CABA, Buenos Aires, Argentina',
        originDatetime: '2024-01-01T10:00:00Z',
        destinationDatetime: '2024-01-02T18:00:00Z',
        sellerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyerId: 'user_3DdtO3tGpGtvz1VoG5rJbLAWPAG',
    },
    include: {
        deliveryAssignments: false,
        trackings: false,
    },
  });
  console.log("Created shipment:", shipment2);

  const shipment3 = await prisma.shipment.create({
    data: {
        id: 'SHIPAA003',
        origin: 'Avenida Colón 80, Bahía Blanca, Buenos Aires, Argentina',
        destination: 'Dr. Arturo Sampay 1030, Bahía Blanca, Buenos Aires, Argentina',
        originDatetime: '2024-01-01T10:00:00Z',
        destinationDatetime: '2024-01-02T18:00:00Z',
        sellerId: 'user_3DXScqrDOZjBGz3sb00kYAxSgh1',
        buyerId: 'user_3DXOELulmYWRcib5qSHjXEJsiyU',
    },
    include: {
        deliveryAssignments: false,
        trackings: false,
    },
  });
  console.log("Created shipment:", shipment3);
}

async function seedTrackings() {
  const tracking1 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA001' },
    update: {
        status: 'Pedido confirmado',
        datetime: '2024-01-01T10:00:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    create: {
        shipmentId: 'SHIPAA001',
        status: 'Pedido confirmado',
        datetime: '2024-01-01T10:00:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    include: {
        shipment: false,
    },
  });
  console.log("Created tracking:", tracking1);

  const tracking2 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA001' },
    update: {
        status: 'Preparando tu pedido',
        datetime: '2024-01-01T14:15:00Z',
        currentCity: 'Centro de Distribución - Palermo',
        nextCity: 'Centro de Distribución - Palermo',
    },
    create: {
        shipmentId: 'SHIPAA001',
        status: 'Preparando tu pedido',
        datetime: '2024-01-01T14:15:00Z',
        currentCity: 'Centro de Distribución - Palermo',
        nextCity: 'Centro de Distribución - Palermo',
    },
    include: {
        shipment: false,
    },
  });
  console.log("Created tracking:", tracking2);
        
  const tracking3 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA001' },
    update: {
        status: 'Enviado',
        datetime: '2024-01-01T18:00:00Z',
        currentCity: 'Centro de Distribución - Palermo',
        nextCity: 'Centro Logístico - Bahía Blanca',
    },
    create: {
        shipmentId: 'SHIPAA001',
        status: 'Enviado',
        datetime: '2024-01-01T18:00:00Z',
        currentCity: 'Centro de Distribución - Palermo',
        nextCity: 'Centro Logístico - Bahía Blanca',
    },
    include: {
        shipment: false,
    },
  });
  console.log("Created tracking:", tracking3);

  const tracking4 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA001' },
    update: {
        status: 'En tránsito hacia tu ciudad',
        datetime: '2024-01-02T08:45:00Z',
        currentCity: 'Centro Logístico - Bahía Blanca',
        nextCity: 'Tu zona',
    },
    create: {
        shipmentId: 'SHIPAA001',
        status: 'En tránsito hacia tu ciudad',
        datetime: '2024-01-02T08:45:00Z',
        currentCity: 'Centro Logístico - Bahía Blanca',
        nextCity: 'Tu zona',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking4);

  const tracking5 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA001' },
    update: {
        status: 'En reparto',
        datetime: '2024-01-02T11:10:00Z',
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Domicilio de entrega',
    },
    create: {
        shipmentId: 'SHIPAA001',
        status: 'En reparto',
        datetime: '2024-01-02T11:10:00Z',
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Domicilio de entrega',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking5);

  const tracking6 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA002' },
    update: {
        status: 'Pedido confirmado',
        datetime: '2023-12-25T09:30:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    create: {
        shipmentId: 'SHIPAA002',
        status: 'Pedido confirmado',
        datetime: '2023-12-25T09:30:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking6);

  const tracking7 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA002' },
    update: {
        status: 'Preparando tu pedido',
        datetime: '2023-12-25T13:00:00Z',
        currentCity: 'Centro de Distribución - Rosario',
        nextCity: 'Centro de Distribución - Rosario',
    },
    create: {
        shipmentId: 'SHIPAA002',
        status: 'Preparando tu pedido',
        datetime: '2023-12-25T13:00:00Z',
        currentCity: 'Centro de Distribución - Rosario',
        nextCity: 'Centro de Distribución - Rosario',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking7);

  const tracking8 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA002' },
    update: {
        status: 'Enviado',
        datetime: '2023-12-25T16:45:00Z',
        currentCity: 'Centro de Distribución - Rosario',
        nextCity: 'Centro Logístico - CABA',
    },
    create: {
        shipmentId: 'SHIPAA002',
        status: 'Enviado',
        datetime: '2023-12-25T16:45:00Z',
        currentCity: 'Centro de Distribución - Rosario',
        nextCity: 'Centro Logístico - CABA',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking8);

  const tracking9 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA002' },
    update: {
        status: 'En reparto',
        datetime: '2023-12-26T07:30:00Z',
        currentCity: 'Centro Logístico - CABA',
        nextCity: 'Tu zona',
    },
    create: {
        shipmentId: 'SHIPAA002',
        status: 'En reparto',
        datetime: '2023-12-26T07:30:00Z',
        currentCity: 'Centro Logístico - CABA',
        nextCity: 'Tu zona',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking9);

  const tracking10 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA002' },
    update: {
        status: 'Entregado',
        datetime: '2023-12-26T14:20:00Z',
        currentCity: 'Tu dirección',
        nextCity: 'Entrega finalizada',
    },
    create: {
        shipmentId: 'SHIPAA002',
        status: 'Entregado',
        datetime: '2023-12-26T14:20:00Z',
        currentCity: 'Tu dirección',
        nextCity: 'Entrega finalizada',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking10);

  const tracking11 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA003' },
    update: {
        status: 'Pedido confirmado',
        datetime: '2024-01-03T11:00:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    create: {
        shipmentId: 'SHIPAA003',
        status: 'Pedido confirmado',
        datetime: '2024-01-03T11:00:00Z',
        currentCity: 'Tienda Online Infusio',
        nextCity: 'Centro de Distribución',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking11);

  const tracking12 = await prisma.tracking.upsert({
    where: { shipmentId: 'SHIPAA003' },
    update: {
        status: 'Preparando tu pedido',
        datetime: '2024-01-03T15:30:00Z',
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Centro de Distribución - Bahía Blanca',
    },
    create: {
        shipmentId: 'SHIPAA003',
        status: 'Preparando tu pedido',
        datetime: '2024-01-03T15:30:00Z',
        currentCity: 'Centro de Distribución - Bahía Blanca',
        nextCity: 'Centro de Distribución - Bahía Blanca',
    },
    include: { shipment: false },
  });
  console.log("Created tracking:", tracking12);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });