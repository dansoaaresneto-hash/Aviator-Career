import { FlightPlanWaypoint } from '../types';

/**
 * Generates MSFS 2020/2024 .PLN XML file for download
 */
export function exportMsfsPlnFile(
  title: string,
  waypoints: FlightPlanWaypoint[],
  cruiseAltFt: number = 24000
): void {
  if (waypoints.length < 2) return;

  const origin = waypoints[0];
  const dest = waypoints[waypoints.length - 1];

  let waypointsXml = '';
  waypoints.forEach((wp, index) => {
    const wayptType = wp.type === 'airport' ? 'Airport' : wp.type === 'vor' ? 'VOR' : 'NDB';
    const icaoid = wp.identifier;

    waypointsXml += `
        <ATCWaypoint id="${icaoid}">
            <ATCWaypointType>${wayptType}</ATCWaypointType>
            <WorldPosition>${wp.lat.toFixed(6)},${wp.lng.toFixed(6)},+${(wp.altitudeFt || cruiseAltFt).toFixed(2)}</WorldPosition>
            <ICAO>
                <ICAOIdent>${icaoid}</ICAOIdent>
            </ICAO>
        </ATCWaypoint>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<SimBase.Document Type="AceXML" version="1,0">
    <Descr>AceXML Document</Descr>
    <FlightPlan.FlightPlan>
        <Title>${title} (${origin.identifier} to ${dest.identifier})</Title>
        <FPType>IFR</FPType>
        <RouteType>HighAlt</RouteType>
        <CruisingAlt>${cruiseAltFt}</CruisingAlt>
        <DepartureID>${origin.identifier}</DepartureID>
        <DepartureLLA>${origin.lat.toFixed(6)},${origin.lng.toFixed(6)},+002000.00</DepartureLLA>
        <DestinationID>${dest.identifier}</DestinationID>
        <DestinationLLA>${dest.lat.toFixed(6)},${dest.lng.toFixed(6)},+002000.00</DestinationLLA>
        <AppVersion>
            <AppVersionMajor>11</AppVersionMajor>
            <AppVersionBuild>282174</AppVersionBuild>
        </AppVersion>
        ${waypointsXml}
    </FlightPlan.FlightPlan>
</SimBase.Document>`;

  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PLANO_DE_VOO_${origin.identifier}_${dest.identifier}.pln`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates GPX file for GPS devices
 */
export function exportGpxFile(
  title: string,
  waypoints: FlightPlanWaypoint[]
): void {
  if (waypoints.length < 2) return;

  const origin = waypoints[0];
  const dest = waypoints[waypoints.length - 1];

  let rtepts = '';
  waypoints.forEach((wp) => {
    rtepts += `
    <rtept lat="${wp.lat.toFixed(6)}" lon="${wp.lng.toFixed(6)}">
      <name>${wp.identifier}</name>
      <cmt>${wp.name}</cmt>
      <ele>${((wp.altitudeFt || 0) * 0.3048).toFixed(1)}</ele>
    </rtept>`;
  });

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Aviator MSFS Flight Planner" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${title}</name>
  </metadata>
  <rte>
    <name>${origin.identifier} to ${dest.identifier}</name>
    ${rtepts}
  </rte>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ROTA_${origin.identifier}_${dest.identifier}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates ICAO / SimBrief Route String (e.g. SBGR DCT BGC UT200 SBSG)
 */
export function buildIcaoRouteString(waypoints: FlightPlanWaypoint[]): string {
  if (waypoints.length < 2) return '';

  const routeParts: string[] = [];
  waypoints.forEach((wp, index) => {
    if (index === 0) {
      routeParts.push(wp.identifier);
    } else {
      if (wp.viaAirway) {
        routeParts.push(wp.viaAirway);
      } else if (index < waypoints.length - 1) {
        routeParts.push('DCT');
      }
      routeParts.push(wp.identifier);
    }
  });

  return routeParts.join(' ');
}
