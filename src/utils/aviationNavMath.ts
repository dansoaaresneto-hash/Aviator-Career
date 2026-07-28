// Aviation Navigation Mathematics Utilities (Distance NM, Bearing Deg, ETE, Fuel)

export const EarthRadiusNM = 3440.065; // Earth radius in Nautical Miles

/**
 * Calculates Great Circle distance between two coordinates in Nautical Miles (NM)
 */
export function calculateDistanceNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EarthRadiusNM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Calculates Initial True Bearing (Heading) in degrees (0 - 360°)
 */
export function calculateBearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  return Math.round(brng);
}

/**
 * Estimates Time Enroute (ETE) in minutes
 */
export function calculateEteMinutes(distanceNm: number, cruisingSpeedKts: number): number {
  if (cruisingSpeedKts <= 0) return 0;
  const hours = distanceNm / cruisingSpeedKts;
  return Math.round(hours * 60);
}

/**
 * Formats minutes into HH:MM or Xm format
 */
export function formatEteTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  }
  return `${mins}m`;
}

/**
 * Calculates estimated fuel burn in Liters or Kg based on cruising speed, distance, and aircraft fuel burn rate
 */
export function calculateFuelBurn(
  distanceNm: number,
  cruisingSpeedKts: number,
  fuelBurnRateKgPerHour: number = 180
): { tripFuelKg: number; totalWithReserveKg: number } {
  const eteMinutes = calculateEteMinutes(distanceNm, cruisingSpeedKts);
  const tripFuelKg = (eteMinutes / 60) * fuelBurnRateKgPerHour;
  // Standard IFR reserve: 45 mins reserve + 15 mins taxi
  const reserveFuelKg = (60 / 60) * fuelBurnRateKgPerHour;
  const totalWithReserveKg = tripFuelKg + reserveFuelKg;

  return {
    tripFuelKg: Math.round(tripFuelKg),
    totalWithReserveKg: Math.round(totalWithReserveKg),
  };
}

/**
 * Interpolates points along a great circle arc between two points for smooth map polyline rendering
 */
export function interpolateGreatCircle(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numSegments: number = 12
): [number, number][] {
  const points: [number, number][] = [];
  const distNm = calculateDistanceNm(lat1, lon1, lat2, lon2);

  // If points are very close, return direct line
  if (distNm < 20) {
    return [
      [lat1, lon1],
      [lat2, lon2],
    ];
  }

  const rLat1 = (lat1 * Math.PI) / 180;
  const rLon1 = (lon1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const rLon2 = (lon2 * Math.PI) / 180;

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((rLat1 - rLat2) / 2), 2) +
          Math.cos(rLat1) * Math.cos(rLat2) * Math.pow(Math.sin((rLon1 - rLon2) / 2), 2)
      )
    );

  if (d === 0) return [[lat1, lon1], [lat2, lon2]];

  for (let i = 0; i <= numSegments; i++) {
    const f = i / numSegments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2);
    const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2);
    const z = A * Math.sin(rLat1) + B * Math.sin(rLat2);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI);
    const lon = Math.atan2(y, x) * (180 / Math.PI);

    points.push([lat, lon]);
  }

  return points;
}
