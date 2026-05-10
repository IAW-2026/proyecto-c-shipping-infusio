export type ShippingCostInput = {
  originPostalCode: string
  destinationPostalCode: string
  volume: number
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

export function calculateShippingCost({
  originPostalCode,
  destinationPostalCode,
  volume,
}: ShippingCostInput) {
  const originScore = postalCodeScore(originPostalCode)
  const destinationScore = postalCodeScore(destinationPostalCode)
  const distanceScore = Math.abs(originScore - destinationScore)

  const baseCost = 2500
  const distanceCost = Math.round(Math.min(25000, distanceScore * 0.02))
  const volumeCost = Math.round(Math.max(volume, 0) * 1200)

  return Math.max(0, baseCost + distanceCost + volumeCost)
}