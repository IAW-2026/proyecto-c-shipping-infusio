"use server";

/**
 * Server Actions para CRUD de Shipments, Trackings y DeliveryAssignments
 * Todas las solicitudes incluyen autenticación API KEY
 */

const getHeaders = () => {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    console.error("INTERNAL_API_KEY no está configurada en variables de entorno");
    throw new Error("INTERNAL_API_KEY no está configurada en variables de entorno");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
};

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ============= SHIPMENTS =============

export async function getShipments(filters?: {
  buyerId?: string;
  sellerId?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.buyerId) params.append("buyerId", filters.buyerId);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);

    const response = await fetch(
      `${getBaseUrl()}/api/internal/shipments?${params}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error fetching shipments");
    return await response.json();
  } catch (error) {
    console.error("Error en getShipments:", error);
    throw error;
  }
}

export async function getShipmentById(id: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/shipments?id=${id}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error fetching shipment");
    return await response.json();
  } catch (error) {
    console.error("Error en getShipmentById:", error);
    throw error;
  }
}

export async function createShipment(data: {
  id: string;
  origin: string;
  destination: string;
  originDatetime: string;
  destinationDatetime: string;
  buyerId: string;
  sellerId: string;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/shipments`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error creating shipment");
    return await response.json();
  } catch (error) {
    console.error("Error en createShipment:", error);
    throw error;
  }
}

export async function updateShipment(data: {
  id: string;
  origin?: string;
  destination?: string;
  originDatetime?: string;
  destinationDatetime?: string;
  buyerId?: string;
  sellerId?: string;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/shipments`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error updating shipment");
    return await response.json();
  } catch (error) {
    console.error("Error en updateShipment:", error);
    throw error;
  }
}

export async function deleteShipment(id: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/shipments?id=${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error deleting shipment");
    return await response.json();
  } catch (error) {
    console.error("Error en deleteShipment:", error);
    throw error;
  }
}

// ============= TRACKINGS =============

export async function getTrackings(filters?: {
  shipmentId?: string;
  status?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.shipmentId) params.append("shipmentId", filters.shipmentId);
    if (filters?.status) params.append("status", filters.status);

    const response = await fetch(
      `${getBaseUrl()}/api/internal/trackings?${params}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error fetching trackings");
    return await response.json();
  } catch (error) {
    console.error("Error en getTrackings:", error);
    throw error;
  }
}

export async function createTracking(data: {
  shipmentId: string;
  datetime: string;
  status: string;
  currentCity?: string;
  nextCity?: string;
  completed?: boolean;
  current?: boolean;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/trackings`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error creating tracking");
    return await response.json();
  } catch (error) {
    console.error("Error en createTracking:", error);
    throw error;
  }
}

export async function updateTracking(data: {
  shipmentId: string;
  datetime: string;
  status?: string;
  currentCity?: string;
  nextCity?: string;
  completed?: boolean;
  current?: boolean;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/trackings`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error updating tracking");
    return await response.json();
  } catch (error) {
    console.error("Error en updateTracking:", error);
    throw error;
  }
}

export async function deleteTracking(shipmentId: string, datetime: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/trackings?shipmentId=${shipmentId}&datetime=${encodeURIComponent(datetime)}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error deleting tracking");
    return await response.json();
  } catch (error) {
    console.error("Error en deleteTracking:", error);
    throw error;
  }
}

// ============= DELIVERY ASSIGNMENTS =============

export async function getDeliveries(filters?: {
  id?: string;
  shipmentId?: string;
  riderId?: string;
  logisticOperatorId?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.id) params.append("id", filters.id);
    if (filters?.shipmentId) params.append("shipmentId", filters.shipmentId);
    if (filters?.riderId) params.append("riderId", filters.riderId);
    if (filters?.logisticOperatorId)
      params.append("logisticOperatorId", filters.logisticOperatorId);

    const response = await fetch(
      `${getBaseUrl()}/api/internal/deliveries?${params}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error fetching deliveries");
    return await response.json();
  } catch (error) {
    console.error("Error en getDeliveries:", error);
    throw error;
  }
}

export async function createDelivery(data: {
  id: string;
  shipmentId: string;
  riderId?: string;
  logisticOperatorId?: string;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/deliveries`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error creating delivery");
    return await response.json();
  } catch (error) {
    console.error("Error en createDelivery:", error);
    throw error;
  }
}

export async function updateDelivery(data: {
  id: string;
  riderId?: string;
  logisticOperatorId?: string;
}) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/deliveries`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Error updating delivery");
    return await response.json();
  } catch (error) {
    console.error("Error en updateDelivery:", error);
    throw error;
  }
}

export async function deleteDelivery(id: string) {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/internal/deliveries?id=${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) throw new Error("Error deleting delivery");
    return await response.json();
  } catch (error) {
    console.error("Error en deleteDelivery:", error);
    throw error;
  }
}
