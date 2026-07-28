export interface AviationAuthorityInfo {
  countryCode: string;
  countryName: string;
  civilAuthority: string;
  customsAuthority: string;
  borderControl: string;
  flagEmoji: string;
}

// Table of mapping for major aviation countries
const KNOWN_AUTHORITIES: Record<string, { civil: string; customs: string; border: string; flag: string }> = {
  BR: {
    civil: 'ANAC - Agência Nacional de Aviação Civil',
    customs: 'Receita Federal do Brasil',
    border: 'Polícia Federal (DEAIN)',
    flag: '🇧🇷',
  },
  US: {
    civil: 'FAA - Federal Aviation Administration',
    customs: 'CBP - U.S. Customs and Border Protection',
    border: 'USCIS / TSA Border Ops',
    flag: '🇺🇸',
  },
  PT: {
    civil: 'ANAC Portugal - Autoridade Nacional da Aviação Civil',
    customs: 'AT - Autoridade Tributária e Aduaneira',
    border: 'AIMA / SEF Portugal',
    flag: '🇵🇹',
  },
  EU: {
    civil: 'EASA - European Union Aviation Safety Agency',
    customs: 'União Aduaneira Europeia',
    border: 'Frontex EU Border Control',
    flag: '🇪🇺',
  },
  UK: {
    civil: 'CAA - UK Civil Aviation Authority',
    customs: 'HM Revenue & Customs (HMRC)',
    border: 'UK Border Force',
    flag: '🇬🇧',
  },
  FR: {
    civil: 'DGAC - Direction Générale de l\'Aviation Civile',
    customs: 'Douane Française',
    border: 'Police aux Frontières',
    flag: '🇫🇷',
  },
  DE: {
    civil: 'LBA - Luftfahrt-Bundesamt',
    customs: 'Zoll - Bundeszollverwaltung',
    border: 'Bundespolizei',
    flag: '🇩🇪',
  },
  CA: {
    civil: 'Transport Canada Civil Aviation (TCCA)',
    customs: 'CBSA - Canada Border Services Agency',
    border: 'CBSA Immigration Control',
    flag: '🇨🇦',
  },
  AR: {
    civil: 'ANAC Argentina - Administración Nacional de Aviación Civil',
    customs: 'AFIP - Aduana Argentina',
    border: 'Dirección Nacional de Migraciones',
    flag: '🇦🇷',
  },
  ES: {
    civil: 'AESA - Agencia Estatal de Seguridad Aérea',
    customs: 'Aduanas e Impuestos Especiales',
    border: 'Policía Nacional de España',
    flag: '🇪🇸',
  },
};

/**
 * Helper to dynamically resolve Aviation & Customs Authorities for any country.
 * Uses strict mapping for key nations with a procedural fallback algorithm for any unlisted country.
 */
export function getAviationAuthority(countryCode: string, countryName: string): AviationAuthorityInfo {
  const codeUpper = (countryCode || 'BR').toUpperCase();
  const matched = KNOWN_AUTHORITIES[codeUpper];

  if (matched) {
    return {
      countryCode: codeUpper,
      countryName,
      civilAuthority: matched.civil,
      customsAuthority: matched.customs,
      borderControl: matched.border,
      flagEmoji: matched.flag,
    };
  }

  // Algorithmic Procedural Fallback for unlisted countries
  return {
    countryCode: codeUpper,
    countryName: countryName || 'Internacional',
    civilAuthority: `Autoridade de Aviação Civil de ${countryName || 'Destino'}`,
    customsAuthority: `Alfândega & Receita Federal de ${countryName || 'Destino'}`,
    borderControl: `Controle de Imigração e Fronteiras de ${countryName || 'Destino'}`,
    flagEmoji: '🌐',
  };
}
