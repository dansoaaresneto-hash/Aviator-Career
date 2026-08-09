import {
  RegulatoryZone,
  CountryRegulatoryInfo,
  RegulatoryBody,
  RequiredDocument
} from '../types/regulatory';

export const INITIAL_REGULATORY_ZONES: RegulatoryZone[] = [
  {
    id: 'zone_faa',
    code: 'FAA',
    name: 'FAA Zone (EUA e Territórios)',
    description: 'Espaço aéreo sob jurisdição da Federal Aviation Administration (EUA, Porto Rico, Ilhas Virgens).',
    colorHex: '#0284c7', // Sky Blue
  },
  {
    id: 'zone_anac_latam',
    code: 'ANAC_LATAM',
    name: 'ANAC / LatAm Zone (Brasil e América Latina)',
    description: 'Espaço aéreo sob controle da ANAC/DECEA e autoridades sul-americanas.',
    colorHex: '#10b981', // Emerald
  },
  {
    id: 'zone_easa',
    code: 'EASA',
    name: 'EASA Zone (União Europeia e Reino Unido)',
    description: 'Espaço aéreo europeu integrado sob normas da EASA e Eurocontrol.',
    colorHex: '#8b5cf6', // Purple
  },
];

export const INITIAL_COUNTRIES_INFO: CountryRegulatoryInfo[] = [
  {
    isoCode: 'US',
    name: 'Estados Unidos da América',
    zoneId: 'zone_faa',
    requiresOverflightPermit: false,
    customsNotes: 'Port of Entry obrigatório no primeiro ponto de toque no território americano. Transmissão eAPIS mandatória.',
  },
  {
    isoCode: 'BR',
    name: 'Brasil',
    zoneId: 'zone_anac_latam',
    requiresOverflightPermit: false,
    customsNotes: 'Exige liberação alfandegária e vistoria de entrada (DI/RAB) no Port of Entry designado.',
  },
  {
    isoCode: 'PT',
    name: 'Portugal',
    zoneId: 'zone_easa',
    requiresOverflightPermit: true,
    customsNotes: 'Portal de entrada para a Zona Schengen Europeia. Exige plano de voo GAR e liberação Eurocontrol.',
  },
  {
    isoCode: 'ES',
    name: 'Espanha',
    zoneId: 'zone_easa',
    requiresOverflightPermit: true,
    customsNotes: 'Trânsito europeu sob diretrizes da Eurocontrol. Requer notificação prévia de voo privado/ferry.',
  },
  {
    isoCode: 'CA',
    name: 'Canadá',
    zoneId: 'zone_faa',
    requiresOverflightPermit: false,
    customsNotes: 'Entrada pelo sistema CANPASS e apóise de fronteira CBSA.',
  },
  {
    isoCode: 'CV',
    name: 'Cabo Verde',
    zoneId: 'zone_anac_latam',
    requiresOverflightPermit: true,
    customsNotes: 'Hub técnico de reabastecimento transatlântico no Atlântico Central.',
  },
];

export const INITIAL_REGULATORY_BODIES: RegulatoryBody[] = [
  {
    id: 'body_cbp_us',
    countryIso: 'US',
    name: 'U.S. Customs and Border Protection (CBP)',
    shortName: 'CBP',
    role: 'aduana',
    contactFlavorText: 'Divisão de Aviação Geral Executiva e Despacho de Fronteira Internacional - US CBP',
  },
  {
    id: 'body_faa_us',
    countryIso: 'US',
    name: 'Federal Aviation Administration (FAA)',
    shortName: 'FAA',
    role: 'aviação civil',
    contactFlavorText: 'Airworthiness & Foreign Flight Authorization Branch - FAA Washington DC',
  },
  {
    id: 'body_anac_br',
    countryIso: 'BR',
    name: 'Agência Nacional de Aviação Civil (ANAC)',
    shortName: 'ANAC',
    role: 'aviação civil',
    contactFlavorText: 'Superintendência de Ação Operacional & Registro Aeronáutico Brasileiro (RAB)',
  },
  {
    id: 'body_rfb_br',
    countryIso: 'BR',
    name: 'Receita Federal do Brasil / Alfândega',
    shortName: 'RFB',
    role: 'aduana',
    contactFlavorText: 'Inspetoria da Receita Federal em Aeroporto Internacional (Port of Entry)',
  },
  {
    id: 'body_easa_eu',
    countryIso: 'PT',
    name: 'European Union Aviation Safety Agency (EASA)',
    shortName: 'EASA',
    role: 'aviação civil',
    contactFlavorText: 'Eurocontrol Flight Operations & Schengen Border Control Bureau',
  },
];

export const INITIAL_REQUIRED_DOCUMENTS: RequiredDocument[] = [
  {
    id: 'doc_eapis_manifest',
    regulatoryBodyId: 'body_cbp_us',
    code: 'EAPIS_MANIFEST',
    name: 'Manifesto eAPIS (Electronic Advance Passenger Information System)',
    systemName: 'CBP Form APIS-301 Private Ferry Manifest',
    phase: 'departure',
    description: 'Declaração obrigatória enviada à CBP dos EUA contendo dados da aeronave, comandante e trajeto internacional.',
    requiresReviewDelayMinutes: 1,
    formSchema: {
      fields: [
        {
          key: 'aircraft_registration',
          label: 'Matrícula da Aeronave (Tail Number)',
          type: 'text',
          prefillFrom: 'mission.aircraft.registration',
          required: true,
        },
        {
          key: 'pilot_in_command',
          label: 'Piloto em Comando (Comandante)',
          type: 'text',
          prefillFrom: 'pilot.name',
          required: true,
        },
        {
          key: 'pilot_callsign',
          label: 'Indicativo de Chamada / Callsign',
          type: 'text',
          prefillFrom: 'pilot.callsign',
          required: true,
        },
        {
          key: 'departure_poe',
          label: 'Port of Entry de Saída (ICAO)',
          type: 'airport_select',
          prefillFrom: 'mission.departure.icao',
          required: true,
        },
        {
          key: 'passport_number',
          label: 'Passaporte / Licença de Voo do Piloto',
          type: 'text',
          placeholder: 'Ex: BR8493021 / PLA-98210',
          required: true,
        },
        {
          key: 'estimated_departure_datetime',
          label: 'Data e Hora Prevista de Decolagem (UTC)',
          type: 'datetime',
          required: true,
        },
      ],
    },
  },
  {
    id: 'doc_overflight_permit',
    regulatoryBodyId: 'body_easa_eu',
    code: 'OVERFLIGHT_PERMIT',
    name: 'Autorização de Sobrevoo Internacional (Eurocontrol Clearance)',
    systemName: 'EASA International Route Permit',
    phase: 'enroute',
    description: 'Licença especial de travessia e trânsito por áreas de controle oceânico e espaço aéreo internacional.',
    requiresReviewDelayMinutes: 2,
    formSchema: {
      fields: [
        {
          key: 'callsign',
          label: 'Indicativo de Chamada (Callsign ICAO)',
          type: 'text',
          prefillFrom: 'pilot.callsign',
          required: true,
        },
        {
          key: 'entry_waypoint',
          label: 'Ponto de Entrada FIR / Oceânico',
          type: 'text',
          placeholder: 'Ex: KOPAS / TASNA / OCEANIC-1',
          required: true,
        },
        {
          key: 'requested_altitude_fl',
          label: 'Nível de Voo Solicitado (FL)',
          type: 'text',
          placeholder: 'Ex: FL280 / FL350',
          required: true,
        },
        {
          key: 'technical_stops',
          label: 'Escalas Técnicas de Reabastecimento',
          type: 'textarea',
          placeholder: 'Ex: GVAC (Amílcar Cabral) - Autonomia 6h30m',
          required: false,
        },
      ],
    },
  },
  {
    id: 'doc_di_import_br',
    regulatoryBodyId: 'body_rfb_br',
    code: 'DI_IMPORT',
    name: 'Declaração de Importação (DI) & Vistoria do RAB/ANAC',
    systemName: 'SISCOMEX / Termo de Vistoria Inicial & Liberação Alfandegária',
    phase: 'arrival',
    description: 'Documento oficial de nacionalização, recolhimento de taxas alfandegárias e reserva de novas marcas brasileiras.',
    requiresReviewDelayMinutes: 2,
    formSchema: {
      fields: [
        {
          key: 'new_registration',
          label: 'Nova Matrícula Brasileira Atribuída (RAB)',
          type: 'text',
          placeholder: 'Ex: PS-GFA, PR-ZVA, PT-FMS',
          required: true,
        },
        {
          key: 'port_of_entry_arrival',
          label: 'Port of Entry de Desembaraço (ICAO)',
          type: 'airport_select',
          prefillFrom: 'mission.poe.icao',
          required: true,
        },
        {
          key: 'owner_cnpj_cpf',
          label: 'CNPJ / CPF do Novo Proprietário / Contratante',
          type: 'text',
          placeholder: 'Ex: 12.345.678/0001-90',
          required: true,
        },
        {
          key: 'msn_serial',
          label: 'Número de Série da Aeronave (MSN)',
          type: 'text',
          placeholder: 'Ex: MSN 172-84920',
          required: true,
        },
      ],
    },
  },
];

export const INITIAL_POE_AIRPORT_ICAOS = [
  'SBSG', 'SBEG', 'SBGR', 'SBGL', 'SBKP',
  'KMIA', 'KFLL', 'KJFK', 'KLAX',
  'LPPT', 'LEMD', 'GVAC'
];
