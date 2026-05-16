# Ejemplos de Uso - APIs Internas CRUD

## Configuración

Antes de ejecutar los comandos, reemplaza:
- `YOUR_API_KEY` con tu valor de `INTERNAL_API_KEY`
- `localhost:3000` con tu URL real si es diferente

---

## 📦 SHIPMENTS

### GET - Listar todos los shipments

```bash
curl -X GET "http://localhost:3000/api/internal/shipments" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Obtener shipment específico

```bash
curl -X GET "http://localhost:3000/api/internal/shipments?id=ship-001" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Filtrar por buyer

```bash
curl -X GET "http://localhost:3000/api/internal/shipments?buyerId=buyer-123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### POST - Crear shipment

```bash
curl -X POST "http://localhost:3000/api/internal/shipments" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ship-001",
    "origin": "Buenos Aires",
    "destination": "Córdoba",
    "originDatetime": "2026-05-16T10:00:00Z",
    "destinationDatetime": "2026-05-17T10:00:00Z",
    "buyerId": "buyer-123",
    "sellerId": "seller-456"
  }'
```

### PUT - Actualizar shipment

```bash
curl -X PUT "http://localhost:3000/api/internal/shipments" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ship-001",
    "destination": "Mendoza"
  }'
```

### DELETE - Eliminar shipment

```bash
curl -X DELETE "http://localhost:3000/api/internal/shipments?id=ship-001" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 📍 TRACKINGS

### GET - Listar todos los trackings

```bash
curl -X GET "http://localhost:3000/api/internal/trackings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Filtrar por shipment

```bash
curl -X GET "http://localhost:3000/api/internal/trackings?shipmentId=ship-001" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Filtrar por status

```bash
curl -X GET "http://localhost:3000/api/internal/trackings?status=IN_TRANSIT" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### POST - Crear tracking

```bash
curl -X POST "http://localhost:3000/api/internal/trackings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "ship-001",
    "datetime": "2026-05-16T10:30:00Z",
    "status": "CONFIRMED",
    "currentCity": "Buenos Aires",
    "nextCity": "La Plata",
    "completed": false,
    "current": true
  }'
```

### PUT - Actualizar tracking

```bash
curl -X PUT "http://localhost:3000/api/internal/trackings" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "shipmentId": "ship-001",
    "datetime": "2026-05-16T10:30:00Z",
    "status": "IN_TRANSIT",
    "currentCity": "La Plata"
  }'
```

### DELETE - Eliminar tracking

```bash
curl -X DELETE "http://localhost:3000/api/internal/trackings?shipmentId=ship-001&datetime=2026-05-16T10:30:00Z" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🚚 DELIVERIES

### GET - Listar todos los deliveries

```bash
curl -X GET "http://localhost:3000/api/internal/deliveries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Filtrar por shipment

```bash
curl -X GET "http://localhost:3000/api/internal/deliveries?shipmentId=ship-001" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### GET - Filtrar por rider

```bash
curl -X GET "http://localhost:3000/api/internal/deliveries?riderId=rider-123" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### POST - Crear delivery assignment

```bash
curl -X POST "http://localhost:3000/api/internal/deliveries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "delivery-001",
    "shipmentId": "ship-001",
    "riderId": "rider-123"
  }'
```

### PUT - Actualizar delivery assignment

```bash
curl -X PUT "http://localhost:3000/api/internal/deliveries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "delivery-001",
    "riderId": "rider-456"
  }'
```

### DELETE - Eliminar delivery assignment

```bash
curl -X DELETE "http://localhost:3000/api/internal/deliveries?id=delivery-001" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 🧪 Testing con Variables

Para simplificar el testing, puedes guardar la API KEY en una variable:

```bash
API_KEY="YOUR_API_KEY"
BASE_URL="http://localhost:3000"

# Crear shipment
curl -X POST "$BASE_URL/api/internal/shipments" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ship-001",
    "origin": "Buenos Aires",
    "destination": "Córdoba",
    "originDatetime": "2026-05-16T10:00:00Z",
    "destinationDatetime": "2026-05-17T10:00:00Z",
    "buyerId": "buyer-123",
    "sellerId": "seller-456"
  }'
```

---

## 🔍 Diferencia: Sin API KEY vs Con API KEY

### ❌ Sin API KEY

```bash
curl -X GET "http://localhost:3000/api/internal/shipments"

# Response 401
{
  "error": "API Key inválida o no proporcionada"
}
```

### ✅ Con API KEY

```bash
curl -X GET "http://localhost:3000/api/internal/shipments" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Response 200
{
  "shipments": [ ... ]
}
```

---

## 📊 Herramientas Recomendadas

- **Postman**: GUI para testing de APIs
- **Insomnia**: Similar a Postman, muy ligero
- **Thunder Client**: Extensión VS Code
- **REST Client**: Extensión VS Code (crea archivos `.http`)

---

## 📝 Script PowerShell para Testing

Crea un archivo `test-api.ps1`:

```powershell
$API_KEY = "YOUR_API_KEY"
$BASE_URL = "http://localhost:3000"

$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type" = "application/json"
}

# GET shipments
$response = Invoke-RestMethod -Uri "$BASE_URL/api/internal/shipments" `
    -Headers $headers -Method Get

Write-Host "Shipments:" ($response | ConvertTo-Json)
```

Ejecuta con:
```bash
powershell -ExecutionPolicy Bypass -File test-api.ps1
```
