const METERS_TO_YARDS = 1.09361
const YARDS_PER_MILE = 1760

export function formatDistance(meters) {
  const yards = meters * METERS_TO_YARDS
  if (yards < YARDS_PER_MILE) {
    return `${Math.round(yards)} yd`
  }
  return `${(yards / YARDS_PER_MILE).toFixed(1)} mi`
}

export function formatMiles(miles) {
  return formatDistance(miles * 1609.34)
}
