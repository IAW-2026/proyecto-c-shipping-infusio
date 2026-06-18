En la UI, la home está en app/page.tsx y usa componentes reutilizables como 
- app/ui/utils/tracking-input.tsx, 
- app/ui/utils/shipment-timeline.tsx y 
- app/ui/utils/quick-actions.tsx. 

La navegación principal está en app/ui/header/header.tsx y su mapa de sitio en app/ui/header/sitemap-menu.tsx. El área de usuario se concentra en [app/user-profile/[[...user-profile]]/page.tsx](c:/Users/ludmila/Documents/IAW/Proyecto/Entrega2/app/user-profile/[[...user-profile]]/page.tsx), con vistas separadas para historial, rider, logística y suscripción en 
- app/user-profile/history/page.tsx, 
- app/user-profile/rider/page.tsx, 
- app/user-profile/logistics/page.tsx y 
- app/user-profile/subscription/page.tsx.

Las piezas cruciales de funcionamiento están bastante bien separadas. 
- La autenticación y sincronización con Clerk se manejan en app/api/user/sync/route.ts y app/api/internal/webhooks/clerk/route.ts. 
- Las reglas de roles viven sobre todo en 
  - app/lib/actions.ts y los accesos a datos en app/lib/data.ts. 
- El tracking y avance de estados se concentra en 
  - app/lib/shipment-actions.ts, 
  - app/lib/tracking-actions.ts y 
  - app/api/user/rider/deliveries/complete/route.ts. 
- Las notificaciones por email y push se resuelven en 
  - app/lib/notification-actions.ts, 
  - app/lib/push.ts y 
  - app/api/push/vapid/route.ts. 
- El geocoding está en app/lib/geocoding.ts. 
- El validador central de API keys en app/lib/api-key-validation.ts.

Las APIs que tenés hoy se dividen en varios bloques. 
- Hay un bloque interno de CRUD sobre shipments, trackings y deliveries en 
  - app/api/internal/shipments/route.ts, 
  - app/api/internal/trackings/route.ts y 
  - app/api/internal/deliveries/route.ts. 
- Hay un bloque público o de operación con 
  - app/api/shipping/route.ts, 
  - app/api/shipping/cost/route.ts, 
  - app/api/shipment/filter/route.ts y 
  - app/api/deliveries/assign/route.ts. 
- Hay un bloque de usuario con 
  - app/api/user/roles/route.ts, 
  - app/api/user/assign-roles/route.ts, 
  - app/api/user/subscription/route.ts, 
  - app/api/user/push-subscription/route.ts, 
  - app/api/user/rider/status/route.ts y 
  - app/api/user/rider/deliveries/route.ts. 
- También tenés rutas de soporte como 
  - app/api/geocoding/resolve/route.ts, 
  - app/api/push/send/route.ts y 
  - app/api/shipping/status-update/[shipping_id]/route.ts.

Sobre código que hoy parece no usarse, lo más claro es que app/lib/crud-actions.ts y app/lib/shipping-cost.ts no aparecen importados desde la fuente actual que revisé; además, el cálculo de costo ya está duplicado dentro de app/api/shipping/cost/route.ts. También hay solapamiento funcional entre app/api/shipping/route.ts y app/api/internal/shipments/route.ts, y entre app/api/deliveries/assign/route.ts y app/api/user/assign-delivery/route.ts, así que ahí hay más duplicación que código muerto.