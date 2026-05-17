# ABM - APIs Internas de Shipments, Trackings y Deliveries

## Base URL
```
http://localhost:3000/api/internal
```

---

## 📦 SHIPMENTS

### GET - Obtener todos los shipments
```
GET /shipments
```

**Query Parameters:**
- `id` (opcional) - ID específico de shipment
- `buyerId` (opcional) - Filtrar por buyer
- `sellerId` (opcional) - Filtrar por seller

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/internal/shipments?buyerId=user123"
```

**Response (200):**
```json
{
  "shipments": [
    {
      "id": "ship-001",
      "origin": "Buenos Aires",
      "destination": "Córdoba",
      "originDatetime": "2026-05-16T10:00:00Z",
      "destinationDatetime": "2026-05-17T10:00:00Z",
      "buyerId": "buyer-123",
      "sellerId": "seller-456",
      "DeliveryAssignment": [],
      "Tracking": []
    }
  ]
}
```

---

### POST - Crear nuevo shipment
```
POST /shipments
```

**Body:**
```json
{
  "id": "ship-001",
  "origin": "Buenos Aires",
  "destination": "Córdoba",
  "originDatetime": "2026-05-16T10:00:00Z",
  "destinationDatetime": "2026-05-17T10:00:00Z",
  "buyerId": "buyer-123",
  "sellerId": "seller-456"
}
```

**Response (201):**
```json
{
  "shipment": {
    "id": "ship-001",
    "origin": "Buenos Aires",
    "destination": "Córdoba",
    "originDatetime": "2026-05-16T10:00:00Z",
    "destinationDatetime": "2026-05-17T10:00:00Z",
    "buyerId": "buyer-123",
    "sellerId": "seller-456"
  }
}
```

---

### PUT - Actualizar shipment
```
PUT /shipments
```

**Body (campos opcionales):**
```json
{
  "id": "ship-001",
  "origin": "Buenos Aires (updated)",
  "destination": "Córdoba (updated)"
}
```

**Response (200):**
```json
{
  "shipment": { ... }
}
```

---

### DELETE - Eliminar shipment
```
DELETE /shipments?id=ship-001
```

**Response (200):**
```json
{
  "message": "Shipment eliminado correctamente"
}
```

---

## 📍 TRACKINGS

### GET - Obtener trackings
```
GET /trackings
```

**Query Parameters:**
- `shipmentId` (opcional) - Filtrar por shipment
- `status` (opcional) - Filtrar por estado (CONFIRMED, PREPARING, IN_TRANSIT, etc)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/internal/trackings?shipmentId=ship-001"
```

**Response (200):**
```json
{
  "trackings": [
    {
      "shipmentId": "ship-001",
      "datetime": "2026-05-16T10:30:00Z",
      "status": "CONFIRMED",
      "currentCity": "Buenos Aires",
      "nextCity": "La Plata",
      "completed": false,
      "current": true,
      "Shipment": { ... }
    }
  ]
}
```

---

### POST - Crear tracking
```
POST /trackings
```

**Body:**
```json
{
  "shipmentId": "ship-001",
  "datetime": "2026-05-16T10:30:00Z",
  "status": "CONFIRMED",
  "currentCity": "Buenos Aires",
  "nextCity": "La Plata",
  "completed": false,
  "current": true
}
```

**Response (201):**
```json
{
  "tracking": { ... }
}
```

---

### PUT - Actualizar tracking
```
PUT /trackings
```

**Body:**
```json
{
  "shipmentId": "ship-001",
  "datetime": "2026-05-16T10:30:00Z",
  "status": "IN_TRANSIT",
  "currentCity": "La Plata",
  "nextCity": "Quilmes"
}
```

**Response (200):**
```json
{
  "tracking": { ... }
}
```

---

### DELETE - Eliminar tracking
```
DELETE /trackings?shipmentId=ship-001&datetime=2026-05-16T10:30:00Z
```

**Response (200):**
```json
{
  "message": "Tracking eliminado correctamente"
}
```

---

## 🚚 DELIVERY ASSIGNMENTS

### GET - Obtener delivery assignments
```
GET /deliveries
```

**Query Parameters:**
- `id` (opcional) - ID específico
- `shipmentId` (opcional) - Filtrar por shipment
- `riderId` (opcional) - Filtrar por rider
- `logisticOperatorId` (opcional) - Filtrar por operador logístico

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/internal/deliveries?shipmentId=ship-001"
```

**Response (200):**
```json
{
  "deliveries": [
    {
      "id": "delivery-001",
      "shipmentId": "ship-001",
      "riderId": "rider-123",
      "logisticOperatorId": null,
      "Shipment": { ... },
      "Rider": { ... },
      "LogisticOperator": null
    }
  ]
}
```

---

### POST - Crear delivery assignment
```
POST /deliveries
```

**Body:**
```json
{
  "id": "delivery-001",
  "shipmentId": "ship-001",
  "riderId": "rider-123",
  "logisticOperatorId": null
}
```

**Response (201):**
```json
{
  "delivery": { ... }
}
```

---

### PUT - Actualizar delivery assignment
```
PUT /deliveries
```

**Body:**
```json
{
  "id": "delivery-001",
  "riderId": "rider-456",
  "logisticOperatorId": null
}
```

**Response (200):**
```json
{
  "delivery": { ... }
}
```

---

### DELETE - Eliminar delivery assignment
```
DELETE /deliveries?id=delivery-001
```

**Response (200):**
```json
{
  "message": "DeliveryAssignment eliminado correctamente"
}
```

---

## 🔗 USO DESDE COMPONENTES REACT

Importa las server actions desde `@/app/lib/crud-actions`:

```typescript
import {
  getShipments,
  createShipment,
  updateShipment,
  deleteShipment,
  getTrackings,
  createTracking,
  updateTracking,
  deleteTracking,
  getDeliveries,
  createDelivery,
  updateDelivery,
  deleteDelivery,
} from "@/app/lib/crud-actions";

// Obtener shipments
const { shipments } = await getShipments({ buyerId: "user-123" });

// Crear shipment
const { shipment } = await createShipment({
  id: "ship-001",
  origin: "Buenos Aires",
  destination: "Córdoba",
  originDatetime: "2026-05-16T10:00:00Z",
  destinationDatetime: "2026-05-17T10:00:00Z",
  buyerId: "buyer-123",
  sellerId: "seller-456",
});

// Actualizar shipment
const { shipment: updated } = await updateShipment({
  id: "ship-001",
  destination: "Mendoza",
});

// Eliminar shipment
await deleteShipment("ship-001");
```

---

## ⚠️ AUTENTICACIÓN

Todas las rutas requieren autenticación con **API KEY**:

### Header Requerido
```
Authorization: Bearer YOUR_INTERNAL_API_KEY
```

### Configuración

1. Define la API KEY en tu `.env.local`:
```env
INTERNAL_API_KEY=sk-internal-dev-key
```

2. La API KEY se enviará automáticamente en todas las peticiones

### Errores de Autenticación

Si la API KEY no es válida o no está proporcionada:

```json
{
  "error": "API Key inválida o no proporcionada"
}
```

**Status HTTP: 401 Unauthorized**

Para más detalles, consulta [API_KEY_SETUP.md](API_KEY_SETUP.md)

---

## 🚨 VALIDACIONES

- **Shipments**: id, origin, destination, originDatetime, destinationDatetime, buyerId, sellerId (requeridos)
- **Trackings**: shipmentId, datetime, status (requeridos); el shipmentId debe existir
- **Deliveries**: id, shipmentId (requeridos); riderId/logisticOperatorId deben existir si se proporcionan
