# Guía de rutas API

Este documento resume todas las rutas `route.ts` dentro de `app/api`, indicando qué hace cada una, qué autenticación usa, qué datos espera y cuál es la API puntual expuesta.

## Resumen general

- Las rutas bajo `app/api/user/**` usan Clerk con `auth()` o `currentUser()`.
- Las rutas bajo `app/api/internal/**` usan API key interna con `validateApiKeyMiddleware`.
- Algunas rutas son públicas o de soporte, como geocoding y VAPID.

## Endpoints

| Ruta | Método | API puntual | Qué hace | Autenticación | Input principal | Respuesta |
|---|---|---|---|---|---|---|
| `/api/shipping` | `POST` | `app/api/shipping/route.ts` | Crea un envío nuevo y su tracking inicial | API key interna | `order_id`, `buyer_id`, `seller_id`, `origin_address`, `destination_address` | `{ shipping_id, status: "pending" }` |
| `/api/shipping/[shipping_id]` | `GET` | `app/api/shipping/[shipping_id]/route.ts` | Devuelve el estado actual de un envío | API key interna | `shipping_id` por params | `{ shipping_id, status, last_update, current_city }` |
| `/api/shipping/cost` | `POST` | `app/api/shipping/cost/route.ts` | Calcula un costo estimado de envío | API key interna | `origin_postal_code`, `destination_postal_code`, `volume?` | `{ shipping_cost, currency: "ARS" }` |
| `/api/shipping/status-update/[shipping_id]` | `PATCH` | `app/api/shipping/status-update/[shipping_id]/route.ts` | Actualiza el estado del envío y crea un nuevo tracking | API key interna | `status` | `{ shipping_id, status }` |
| `/api/shipments/filter` | `GET` | `app/api/shipments/filter/route.ts` | Filtra shipments por estado lógico | API key interna | `filter?` (`total`, `inTransit`, `delivered`, `incidents`) | `{ shipments }` |
| `/api/deliveries/assign` | `POST` | `app/api/deliveries/assign/route.ts` | Asigna un rider a un shipment, avanza el tracking a `OUT_FOR_DELIVERY` y notifica | Clerk + `auth()` | `id`, `shipmentId`, `riderId` | `{ delivery, tracking }` |
| `/api/user/assign-delivery` | `POST` | `app/api/user/assign-delivery/route.ts` | Crea o actualiza una asignación de delivery | Sin auth explícita en la ruta | `id`, `shipmentId`, `riderId?`, `logisticOperatorId?` | `{ delivery }` |
| `/api/user/sync` | `POST` | `app/api/user/sync/route.ts` | Sincroniza el usuario de Clerk con la base local | Clerk `currentUser()` | Sin body obligatorio | `{ success: true }` |
| `/api/user/subscription` | `GET` | `app/api/user/subscription/route.ts` | Lee preferencias de notificación del usuario | Clerk `auth()` | Ninguno | `{ emailSub, pushSub }` |
| `/api/user/subscription` | `PATCH` | `app/api/user/subscription/route.ts` | Actualiza preferencias de notificación | Clerk `auth()` | `emailSub?`, `pushSub?` | `{ emailSub, pushSub }` |
| `/api/user/roles` | `GET` | `app/api/user/roles/route.ts` | Devuelve roles del usuario actual | Clerk `auth()` | Ninguno | `{ roles }` |
| `/api/user/assign-roles` | `POST` | `app/api/user/assign-roles/route.ts` | Permite autoasignar roles permitidos | Clerk `auth()` | `roles[]` | `{ success, message, roles }` |
| `/api/user/push-subscription` | `POST` | `app/api/user/push-subscription/route.ts` | Guarda la suscripción push del usuario | Clerk `auth()` | `endpoint`, `expirationTime?`, `keys.p256dh`, `keys.auth` | `{ ok: true }` |
| `/api/user/push-subscription` | `DELETE` | `app/api/user/push-subscription/route.ts` | Borra la suscripción push del usuario | Clerk `auth()` | Ninguno | `{ ok: true }` |
| `/api/user/rider/status` | `GET` | `app/api/user/rider/status/route.ts` | Obtiene el estado del rider | Clerk `auth()` | Ninguno | `{ status }` |
| `/api/user/rider/status` | `POST` | `app/api/user/rider/status/route.ts` | Alterna entre `activo` e `inactivo` | Clerk `auth()` | Ninguno | `{ status }` |
| `/api/user/rider/deliveries` | `GET` | `app/api/user/rider/deliveries/route.ts` | Lista entregas asignadas al rider | Clerk `auth()` | Ninguno | `{ shipments }` |
| `/api/user/rider/deliveries/complete` | `POST` | `app/api/user/rider/deliveries/complete/route.ts` | Marca una entrega como entregada | Clerk `auth()` | `shipmentId` | `{ shipmentId, status, datetime }` |
| `/api/internal/webhooks/clerk` | `POST` | `app/api/internal/webhooks/clerk/route.ts` | Recibe webhooks de Clerk y sincroniza usuarios | Firma Svix + `CLERK_WEBHOOK_SECRET` | Payload Clerk webhook | `Webhook processed` |
| `/api/internal/shipments` | `GET` | `app/api/internal/shipments/route.ts` | Lista o busca shipments | API key interna | `id?`, `buyerId?`, `sellerId?` | `{ shipment }` o `{ shipments }` |
| `/api/internal/shipments` | `POST` | `app/api/internal/shipments/route.ts` | Crea un shipment | API key interna | `id`, `origin`, `destination`, `originDatetime`, `destinationDatetime`, `buyerId`, `sellerId` | `{ shipment }` |
| `/api/internal/shipments` | `PUT` | `app/api/internal/shipments/route.ts` | Actualiza un shipment | API key interna | `id` + campos opcionales | `{ shipment }` |
| `/api/internal/shipments` | `DELETE` | `app/api/internal/shipments/route.ts` | Elimina un shipment | API key interna | `id` por query | `{ message }` |
| `/api/internal/deliveries` | `GET` | `app/api/internal/deliveries/route.ts` | Lista o busca asignaciones de delivery | API key interna | `id?`, `shipmentId?`, `riderId?`, `logisticOperatorId?` | `{ delivery }` o `{ deliveries }` |
| `/api/internal/deliveries` | `POST` | `app/api/internal/deliveries/route.ts` | Crea una asignación de delivery | API key interna | `id`, `shipmentId`, `riderId?`, `logisticOperatorId?` | `{ delivery }` |
| `/api/internal/deliveries` | `PUT` | `app/api/internal/deliveries/route.ts` | Actualiza una asignación de delivery | API key interna | `id`, `riderId?`, `logisticOperatorId?` | `{ delivery }` |
| `/api/internal/deliveries` | `DELETE` | `app/api/internal/deliveries/route.ts` | Elimina una asignación de delivery | API key interna | `id` por query | `{ message }` |
| `/api/internal/trackings` | `GET` | `app/api/internal/trackings/route.ts` | Lista trackings filtrados | API key interna | `shipmentId?`, `status?` | `{ trackings }` |
| `/api/internal/trackings` | `POST` | `app/api/internal/trackings/route.ts` | Crea un tracking manual | API key interna | `shipmentId`, `datetime`, `status`, `currentCity?`, `nextCity?`, `completed?`, `current?` | `{ tracking }` |
| `/api/internal/trackings` | `PUT` | `app/api/internal/trackings/route.ts` | Actualiza un tracking existente | API key interna | `shipmentId`, `datetime`, campos opcionales | `{ tracking }` |
| `/api/internal/trackings` | `DELETE` | `app/api/internal/trackings/route.ts` | Elimina un tracking | API key interna | `shipmentId`, `datetime` por query | `{ message }` |
| `/api/internal/user/roles` | `GET` | `app/api/internal/user/roles/route.ts` | Devuelve roles del usuario autenticado | Clerk `auth()` | Ninguno | `{ roles }` |
| `/api/internal/user/assign-roles` | `POST` | `app/api/internal/user/assign-roles/route.ts` | Autoasigna roles permitidos | Clerk `auth()` | `roles[]` | `{ success, message, roles }` |
| `/api/geocoding/resolve` | `GET` | `app/api/geocoding/resolve/route.ts` | Resuelve una dirección en geocoding | Sin auth explícita | `address` por query | Resultado de `resolveSingleDestination` |
| `/api/push/send` | `POST` | `app/api/push/send/route.ts` | Envía una notificación push | Sin auth explícita | `userId?`, `title`, `message`, `url?` | `{ ok: true }` |
| `/api/push/vapid` | `GET` | `app/api/push/vapid/route.ts` | Expone la clave pública VAPID | Sin auth explícita | Ninguno | `{ publicKey }` |

## Lectura rápida por grupo

### Rutas de envío

Las rutas `/api/shipping/*`, `/api/shipments/filter` y `/api/shipping/status-update/[shipping_id]` cubren el ciclo de vida del envío: creación, consulta, cálculo de costo y cambio de estado.

### Rutas de usuario

Las rutas `/api/user/*` manejan sincronización con Clerk, roles, suscripciones, estado de rider, suscripciones push y entregas asignadas.

### Rutas internas

Las rutas `/api/internal/*` son las más administrativas: CRUD de shipments, deliveries, trackings, roles y webhook de Clerk.

### Integraciones

Las rutas `/api/geocoding/resolve`, `/api/push/send` y `/api/push/vapid` sirven como soporte para geocoding y notificaciones push.

## Observaciones importantes

- En varias rutas internas, la seguridad depende de una API key en lugar de Clerk.
- Algunas rutas disparan efectos secundarios: push notifications y emails.
- La ruta `deliveries/assign` avanza el tracking automáticamente a `OUT_FOR_DELIVERY`, mientras que `user/assign-delivery` sólo crea o actualiza la asignación.
- La ruta `user/assign-roles` y su equivalente interna sólo permiten autoasignación de `rider` y `logistic_operator`.