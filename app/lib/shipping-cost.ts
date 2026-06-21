"use server"

export type ShippingCostInput = {
  originPostalCode: string
  destinationPostalCode: string
}

function postalCodeScore(postalCode: string) {
  const normalized = postalCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
  const digits = normalized.replace(/\D/g, "")
  const letters = normalized.replace(/[^A-Z]/g, "")

  let score = 0

  if (digits) {
    score += Number(digits)
  }

  for (const letter of letters) {
    score = score * 26 + (letter.charCodeAt(0) - 64)
  }

  return score
}

export async function calculateShippingCost({
  originPostalCode,
  destinationPostalCode,
}: ShippingCostInput) {
  const originScore = postalCodeScore(originPostalCode)
  const destinationScore = postalCodeScore(destinationPostalCode)
  const distanceScore = Math.abs(originScore - destinationScore)

  const baseCost = 2500
  const distanceCost = Math.round(Math.min(25000, distanceScore * 0.02))

  return Math.max(0, baseCost + distanceCost)
}