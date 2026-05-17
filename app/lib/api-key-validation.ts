import { NextRequest, NextResponse } from "next/server";

/**
 * Valida que la API KEY proporcionada sea válida
 * Espera el header: Authorization: Bearer YOUR_API_KEY
 */
export function validateApiKey(request: NextRequest, validApiKey: string): boolean {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return false;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return false;
  }

  const apiKey = parts[1];

  if (!validApiKey) {
    console.error("INTERNAL_API_KEY no está configurada en variables de entorno");
    return false;
  }

  return apiKey === validApiKey;
}

/**
 * Middleware para validar API KEY en rutas internas
 * Retorna una respuesta 401 si la API KEY no es válida
 */
export function validateApiKeyMiddleware(request: NextRequest, validApiKey: string) {
  if (!validateApiKey(request, validApiKey)) {
    return NextResponse.json(
      { error: "API Key inválida o no proporcionada" },
      { status: 401 }
    );
  }
  return null; // Continuar con la request
}

/**
 * Valida contra múltiples API keys (retorna 401 si ninguna coincide)
 * Uso: `validateApiKeysMiddleware(request, [process.env.INTERNAL_API_KEY, process.env.BUYER])`
 */
export function validateApiKeysMiddleware(request: NextRequest, validApiKeys: Array<string | undefined>) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "API Key inválida o no proporcionada" },
      { status: 401 }
    );
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return NextResponse.json(
      { error: "API Key inválida o no proporcionada" },
      { status: 401 }
    );
  }

  const apiKey = parts[1];

  const hasValid = validApiKeys.some((k) => !!k && apiKey === k);
  if (!hasValid) {
    return NextResponse.json(
      { error: "API Key inválida o no proporcionada" },
      { status: 401 }
    );
  }

  return null;
}
