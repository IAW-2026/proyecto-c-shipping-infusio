"use server";

import { prisma } from "./prisma";
import { assignRoleToUser } from "./actions";

/* -------------- FETCH USER -------------- */
export async function fetchUserRoles(userId: string): Promise<string[]> {
  try {
    const result = await prisma.userRole.findMany({
      where: { userId },
      select: { role: true },
    });

    return result.map((row) => row.role);
  } catch (error) {
    console.error("Error getting user roles:", error);
    throw error;
  }
}

export async function fetchUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/* -------------- FETCH RIDERS -------------- */
export async function fetchAllRiders() {
  try {
    const riders = await prisma.rider.findMany();
    return riders;
  } catch (error) {
    console.error("Error getting all riders:", error);
    throw error;
  }
}

export async function fetchRiderByActive() {
  try {
    const rider = await prisma.rider.findMany({
      where: { status: "activo" },
    });

    return rider || null;
  } catch (error) {
    console.error("Error getting active rider:", error);
    throw error;
  }
}

export async function fetchRiderById(riderId: string) {
  try {
    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { deliveryAssignments: true },
    });

    return rider;
  } catch (error) {
    console.error("Error getting rider:", error);
    throw error;
  }
}

/* -------------- FETCH SHIPMENTS -------------- */
export async function fetchAllShipments() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        deliveryAssignments: true,
        trackings: true,
      },
    });

    return shipments;
  } catch (error) {
    console.error("Error getting all shipments:", error);
    throw error;
  }
}

export async function fetchShipmentById(shipmentId: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        deliveryAssignments: {
          include: {
            rider: true,
            logisticOperator: true,
          },
        },
        trackings: true,
      },
    });

    return shipment;
  } catch (error) {
    console.error("Error getting shipment:", error);
    throw error;
  }
}

export async function fetchShipmentsByBuyerId(buyerId: string) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { buyerId },
      include: {
        deliveryAssignments: true,
        trackings: true,
      },
    });

    return shipments;
  } catch (error) {
    console.error("Error getting shipments by buyer:", error);
    throw error;
  }
}

export async function fetchShipmentsBySellerId(sellerId: string) {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { sellerId },
      include: {
        deliveryAssignments: true,
        trackings: true,
      },
    });

    return shipments;
  } catch (error) {
    console.error("Error getting shipments by seller:", error);
    throw error;
  }
}

/* -------------- FETCH LOGISTIC OPERATORS -------------- */
export async function fetchAllLogisticOperators() {
  try {
    const operators = await prisma.logisticOperator.findMany({
      include: { deliveryAssignments: true },
    });

    return operators;
  } catch (error) {
    console.error("Error getting all logistic operators:", error);
    throw error;
  }
}

export async function fetchLogisticOperatorById(operatorId: string) {
  try {
    const operator = await prisma.logisticOperator.findUnique({
      where: { id: operatorId },
      include: { deliveryAssignments: true },
    });

    return operator;
  } catch (error) {
    console.error("Error getting logistic operator:", error);
    throw error;
  }
}

/* -------------- FETCH TRACKING -------------- */
export async function fetchAllTrackings() {
  try {
    const trackings = await prisma.tracking.findMany({
      include: { shipment: true },
    });

    return trackings;
  } catch (error) {
    console.error("Error getting all trackings:", error);
    throw error;
  }
}

export async function fetchTrackingByShipmentId(shipmentId: string) {
  try {
    const tracking = await prisma.tracking.findUnique({
      where: { shipmentId },
      include: { shipment: true },
    });

    return tracking;
  } catch (error) {
    console.error("Error getting tracking:", error);
    throw error;
  }
}

/* -------------- FETCH DELIVERY ASSIGNMENTS -------------- */
export async function fetchDeliveryAssignmentsByShipmentId(shipmentId: string) {
  try {
    const assignments = await prisma.deliveryAssignment.findMany({
      where: { shipmentId },
      include: {
        rider: true,
        logisticOperator: true,
        shipment: true,
      },
    });

    return assignments;
  } catch (error) {
    console.error("Error getting delivery assignments:", error);
    throw error;
  }
}

export async function fetchDeliveryAssignmentsByRiderId(riderId: string) {
  try {
    const assignments = await prisma.deliveryAssignment.findMany({
      where: { riderId },
      include: {
        shipment: true,
        logisticOperator: true,
      },
    });

    return assignments;
  } catch (error) {
    console.error("Error getting rider assignments:", error);
    throw error;
  }
}

/* -------------- CREATE RIDER -------------- */
export async function createRiderProfile(
  userId: string,
  riderData: { name: string; email: string; location: string }
) {
  try {
    const rider = await prisma.rider.upsert({
      where: { id: userId },
      update: {
        name: riderData.name,
        location: riderData.location,
      },
      create: {
        id: userId,
        name: riderData.name,
        email: riderData.email,
        status: "inactivo",
        location: riderData.location,
      },
    });

    // Asignar rol de rider
    await assignRoleToUser(userId, "rider");

    return rider;
  } catch (error) {
    console.error("Error creating rider profile:", error);
    throw error;
  }
}

/* -------------- CREATE LOGISTIC OPERATOR -------------- */
export async function createLogisticOperatorProfile(
  userId: string,
  operatorData: { name: string; email: string }
) {
  try {
    const operator = await prisma.logisticOperator.upsert({
      where: { id: userId },
      update: {
        name: operatorData.name,
      },
      create: {
        id: userId,
        name: operatorData.name,
        email: operatorData.email,
      },
    });

    // Asignar rol de logistic_operator
    await assignRoleToUser(userId, "logistic_operator");

    return operator;
  } catch (error) {
    console.error("Error creating logistic operator profile:", error);
    throw error;
  }
}

/* -------------- CREATE USER -------------- */
export async function createUser(userData: {
  id: string;
  name: string;
  surname: string;
  email: string;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        pushSub: false,
        emailSub: false,
      },
    });

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/* -------------- CREATE SHIPMENT -------------- */
export async function createShipment(shipmentData: {
  id: string;
  origin: string;
  destination: string;
  originDatetime: Date;
  destinationDatetime: Date;
  buyerId: string;
  sellerId: string;
}) {
  try {
    const shipment = await prisma.shipment.create({
      data: shipmentData,
      include: {
        deliveryAssignments: true,
        trackings: true,
      },
    });

    return shipment;
  } catch (error) {
    console.error("Error creating shipment:", error);
    throw error;
  }
}

/* -------------- CREATE TRACKING -------------- */
export async function createTracking(trackingData: {
  shipmentId: string;
  status: string;
  datetime: Date;
  currentCity: string;
  nextCity: string;
}) {
  try {
    const tracking = await prisma.tracking.upsert({
      where: { shipmentId: trackingData.shipmentId },
      update: {
        status: trackingData.status,
        datetime: trackingData.datetime,
        currentCity: trackingData.currentCity,
        nextCity: trackingData.nextCity,
      },
      create: trackingData,
    });

    return tracking;
  } catch (error) {
    console.error("Error creating tracking:", error);
    throw error;
  }
}
