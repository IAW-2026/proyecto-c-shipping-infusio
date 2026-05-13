export type Shipment = {
  id: string;
  origin: string;
  destination: string;
  origin_datetime: string;
  destination_datetime: string | null;
  order_id?: string;
  buyer_id?: string;
  seller_id?: string;
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

export type ShipmentTracking = {
  shipment_id: string;
  status: string;
  datetime: string;
  current_city: string;
  next_city: string;
  seller_id: string;
  buyer_id: string;
};

export type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export type RoleUser = {
  user_id: string;
  role: 'rider' | 'logistic_operator' | 'admin' | 'buyer' | 'seller';
};

export type DeliveryAssignment = {
  id: string;
  shipment_id: string;
  rider_id: string;
  operator_id: string;
};

export const ROLES = {
  ADMIN: "admin",
  BUYER: "buyer",
  SELLER: "seller",
  LOGISTIC_OPERATOR: "logistic_operator",
  RIDER: "rider",
  SHIPPING_ADMIN: "shipping_admin",
  VIEWER: "viewer",
} as const;