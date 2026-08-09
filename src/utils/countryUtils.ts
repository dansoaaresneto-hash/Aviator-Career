export const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  PT: 'Portugal',
  ES: 'Espanha',
  FR: 'França',
  AR: 'Argentina',
  CL: 'Chile',
  UY: 'Uruguai',
  PY: 'Paraguai',
  CO: 'Colômbia',
  PE: 'Peru',
  DE: 'Alemanha',
  IT: 'Itália',
  GB: 'Reino Unido',
  UK: 'Reino Unido',
  CA: 'Canadá',
  MX: 'México',
};

export function countryName(iso: string): string {
  if (!iso) return '';
  const clean = iso.trim().toUpperCase();
  return COUNTRY_NAMES[clean] || iso;
}

export function getCountryName(isoOrIcao?: string, cityName?: string, countryField?: string): string {
  if (countryField) return countryField;
  if (!isoOrIcao) return '';

  const clean = isoOrIcao.trim().toUpperCase();
  if (COUNTRY_NAMES[clean]) return COUNTRY_NAMES[clean];

  // If 4-character ICAO code, infer from prefix
  if (clean.length === 4) {
    if (clean.startsWith('SB') || clean.startsWith('SD') || clean.startsWith('SN') || clean.startsWith('SS') || clean.startsWith('SW') || clean.startsWith('SI') || clean.startsWith('SJ')) {
      return 'Brasil';
    }
    if (clean.startsWith('K')) return 'Estados Unidos';
    if (clean.startsWith('LP')) return 'Portugal';
    if (clean.startsWith('LE')) return 'Espanha';
    if (clean.startsWith('LF')) return 'França';
    if (clean.startsWith('SA')) return 'Argentina';
    if (clean.startsWith('SC')) return 'Chile';
    if (clean.startsWith('SU')) return 'Uruguai';
    if (clean.startsWith('SG')) return 'Paraguai';
    if (clean.startsWith('SK')) return 'Colômbia';
    if (clean.startsWith('SP')) return 'Peru';
    if (clean.startsWith('ED') || clean.startsWith('ET')) return 'Alemanha';
    if (clean.startsWith('LI')) return 'Itália';
    if (clean.startsWith('EG')) return 'Reino Unido';
    if (clean.startsWith('C')) return 'Canadá';
    if (clean.startsWith('MM')) return 'México';
  }

  // Fallback check against city name
  if (cityName) {
    if (cityName.includes('Brasil') || cityName.includes('- SP') || cityName.includes('- RJ') || cityName.includes('- MG') || cityName.includes('- PR') || cityName.includes('- RS') || cityName.includes('- SC') || cityName.includes('- GO') || cityName.includes('- DF') || cityName.includes('- BA') || cityName.includes('- PE') || cityName.includes('- CE') || cityName.includes('- AM') || cityName.includes('- PA') || cityName.includes('- MT') || cityName.includes('- MS') || cityName.includes('- RN') || cityName.includes('- AL') || cityName.includes('- SE') || cityName.includes('- PB') || cityName.includes('- MA') || cityName.includes('- PI') || cityName.includes('- TO') || cityName.includes('- RO') || cityName.includes('- AC') || cityName.includes('- RR') || cityName.includes('- AP')) {
      return 'Brasil';
    }
    if (cityName.includes('Estados Unidos') || cityName.includes('USA') || cityName.includes('- FL') || cityName.includes('- NY') || cityName.includes('- CA') || cityName.includes('- TX') || cityName.includes('- NJ')) {
      return 'Estados Unidos';
    }
    if (cityName.includes('Portugal')) return 'Portugal';
    if (cityName.includes('Espanha')) return 'Espanha';
    if (cityName.includes('França')) return 'França';
    if (cityName.includes('Argentina')) return 'Argentina';
    if (cityName.includes('Chile')) return 'Chile';
    if (cityName.includes('Uruguai')) return 'Uruguai';
  }

  return clean;
}
