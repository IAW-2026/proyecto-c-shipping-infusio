[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mVV06Hfm)
# shipping

Aplicación **Shipping** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `Infusio`.

Esta app corresponde al módulo de envíos y logística en el proyecto de tipo **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

---

Link a la aplicación: <https://proyecto-c-shipping-infusio.vercel.app/>

---

**Qué se puede hacer**
- Gestionar envíos: crear, listar y actualizar estados.
- Asignar paquetes a riders y seguir entregas en tiempo real.
- Calcular costos de envío y optimizar rutas.
- Enviar notificaciones por email y push a usuarios.

**Roles y funcionalidades**
- `usuario sin autenticar`: puede ver el estado de envío consultando un número de seguimiento y acceder a un chatbot de consultas e información general de la página.
- `viewer`: seguir envíos como comprador o vendedor, ver historial de pedidos, recibir notificaciones (email/push). Puede generar un perfil de repartidor y/o operador logístico. Puede realizar las mismas operaciones que un usuario sin autenticar.
- `logistic_operator` (operador logístico): asignar riders a envíos, actualizar estado de paquetes, supervisar estado de entregas. Puede realizar las mismas operaciones que un usuario sin autenticar.
- `shipping_admin` / `admin`: panel administrativo, métricas, generación de reporte con información. Puede realizar las mismas operaciones que un usuario sin autenticar.

---
**Credenciales de acceso**

| Rol | Email | Contraseña |
|------|--------|------------|
| Todos (viewer, rider, operador logístico, administrador) | shipping+clerktest@iaw.com | iawuser# |

**Credenciales de acceso extra**

| Rol | Email | Contraseña |
|------|--------|------------|
| Rider | rider1@infusio.com | ridernumero1 |
| Rider | rider2@infusio.com | ridernumero2 |
| Rider | rider3@infusio.com | ridernumero3 |
| Rider | rider4@infusio.com | ridernumero4 |
| Operador Logístico | ol1@infusio.com | operadorlogistico1 |
| Operador Logístico | ol2@infusio.com | operadorlogistico2 |
| Admin | admin@infusio.com | Infusio2024! |

---

**Partes de la aplicación**
- `app/`: UI y rutas públicas/administrativas.
- `app/api/`: endpoints internos y de soporte (envíos, trackings, push, geocoding).
- `app/lib/`: lógica compartida (Prisma, geocoding, push, notificaciones).
- `prisma/`: esquema y migraciones de la base de datos.
- `public/` y `ui/`: activos estáticos y componentes de interfaz.
- `docs/`: documentación de uso de la aplicación.

**APIs / servicios externos utilizados**
- Clerk — autenticación y gestión de usuarios.
- Resend — envío de correos (API: https://api.resend.com).
- Nominatim (OpenStreetMap) — geocoding (https://nominatim.openstreetmap.org).
- Web Push (VAPID) — notificaciones push vía la librería `web-push`.
- Postgres / Prisma — base de datos y ORM.

---

Casos de prueba relevantes ya cargados:
- Pedido asignado a rider: ingresar con rider2@infusio.com
- Paginación y búsqueda por parámetros URL: ingresar con cliente@infusio.com
- Para vincular un paquete a un rider: ingresar con cualquier operador logístico y seleccionar paquete `SHIP-E9124761`

---

Más documentación: <https://github.com/IAW-2026/proyecto-c-shipping-infusio/tree/main/docs>
Link al deploy: <https://proyecto-c-shipping-infusio.vercel.app/>
