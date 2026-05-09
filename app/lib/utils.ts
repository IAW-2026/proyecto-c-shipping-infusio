import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // radio promedio de la Tierra en km

  const toRad = (valor: number) => (valor * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculatePrize(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  volume: number
): number {
  const distanceKm = calculateDistanceKm(lat1, lon1, lat2, lon2);
  const basePrice = 10; // precio base por km
  const volumeSurcharge = volume > 1 ? (volume - 1) * 2 : 0; // recargo por volumen adicional
  return distanceKm * basePrice + volumeSurcharge;
}
