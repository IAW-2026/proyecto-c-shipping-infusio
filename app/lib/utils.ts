import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateShippingCost({
  originPostalCode,
  destinationPostalCode,
  volume,
}: { originPostalCode: string; destinationPostalCode: string; volume: number }) {
    const postalCodeScore = (postalCode: string) => {
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
}
