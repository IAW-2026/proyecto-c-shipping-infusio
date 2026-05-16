/* DATABASE SCHEMA DEFINITIONS */

export type Shipment = {
  id: string;
  origin: string;
  destination: string;
  originDatetime: string;
  destinationDatetime: string | null;
  buyer_id: string;
  seller_id: string;
};

export type LogisticOperator = {
  id: string;
  name: string;
  email: string;
};

export type Rider = {
  id: string;
  name: string;
  email: string;
  status: 'activo' | 'inactivo';
  location: string;
};

export type Tracking = {
  shipmentId: string;
  status: string;
  datetime: string;
  currentCity: string;
  nextCity: string;
};

export type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
  emailSub: boolean;
  pushSub: boolean;
};

export type UserRole = {
  userId: string;
  role: 'rider' | 'logistic_operator' | 'admin' | 'buyer' | 'seller' | 'shipping_admin' | 'viewer';
};

export type DeliveryAssignment = {
  id: string;
  shipmentId: string;
  riderId: string;
  logisticOperatorId: string;
};

/* ROLES DEFINITIONS */

export const ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SELLER: "seller",
  LOGISTIC_OPERATOR: "logistic_operator",
  RIDER: "rider",
  SHIPPING_ADMIN: "shipping_admin",
  VIEWER: "viewer",
} as const;

/* UTILS */

export type ShipmentSummary = {
  id: string
  origin: string
  destination: string
  latestStatus: string
  latestDatetime: string
  assignedRiderId: string | null
};

export const TimelineStatuses = 
{
  CONFIRMED: "Pedido confirmado",
  PREPARING: "Preparando tu pedido",
  IN_TRANSIT: "En tránsito hacia tu ciudad",
  ARRIVED_CITY: "El envió llegó a tu ciudad",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Pedido cancelado",
  WITH_ISSUE: "Pedido con incidencia"
} as const;