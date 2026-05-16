# Configuración de Autenticación API KEY

## Requisitos

Para usar las APIs internas, necesitas configurar una variable de entorno con tu API KEY.

## Pasos para Configurar

### 1. Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo `.env.local` (si no existe):

```bash
touch .env.local
```

### 2. Agregar la API KEY

Abre `.env.local` y agrega:

```env
INTERNAL_API_KEY=tu_api_key_super_secreta
```

**Recomendación:** Usa una API KEY fuerte, ejemplo:
```env
INTERNAL_API_KEY=sk-internal-project-2026-xyz123abc789
```

### 3. Para desarrollo local

Si estás usando `NEXT_PUBLIC_API_URL`, agrégalo también:

```env
INTERNAL_API_KEY=sk-internal-dev-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ⚠️ Seguridad

- **NO** incluyas `INTERNAL_API_KEY` en el control de versiones
- El archivo `.env.local` debe estar en `.gitignore`
- Para producción, configura esta variable en tu plataforma de hosting (Vercel, etc.)
- Usa una API KEY única por ambiente (dev, staging, prod)

---

## Cómo Funciona

Todas las solicitudes a las APIs internas incluyen el header:

```
Authorization: Bearer <INTERNAL_API_KEY>
```

Si la API KEY es inválida o no está proporcionada, recibirás:

```json
{
  "error": "API Key inválida o no proporcionada"
}
```

Con status HTTP **401 Unauthorized**.

---

## Ejemplo de Solicitud Manual (con cURL)

```bash
curl -X GET "http://localhost:3000/api/internal/shipments" \
  -H "Authorization: Bearer sk-internal-dev-key" \
  -H "Content-Type: application/json"
```

---

## Validación en el Código

La validación se realiza automáticamente en cada endpoint:

```typescript
import { validateApiKeyMiddleware } from "@/app/lib/api-key-validation";

export async function GET(request: NextRequest) {
  // Valida API KEY automáticamente
  const authError = validateApiKeyMiddleware(request);
  if (authError) return authError;
  
  // Tu lógica aquí...
}
```

---

## Variables de Entorno Necesarias

| Variable | Tipo | Requerida | Ejemplo |
|----------|------|-----------|---------|
| `INTERNAL_API_KEY` | string | ✅ Sí | `sk-internal-dev-key` |
| `NEXT_PUBLIC_API_URL` | string | ❌ No | `http://localhost:3000` |
| `POSTGRES_URL` | string | ✅ Sí | `postgresql://...` |

