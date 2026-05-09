export type Shipment = {
  id: string;
  origin: string;
  destination: string;
  origin_datetime: string;
  destination_datetime: string;
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
  id: string;
  shipment_id: string;
  status: 'pendiente' | 'preparado' | 'despachado' | 'en tránsito' | 'entregado' | 'cancelado' | 'con incidencia';
  datetime: string;
  current_city: string;
  next_city: string;
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