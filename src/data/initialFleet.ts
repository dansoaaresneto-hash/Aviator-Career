import { AircraftModel } from '../types';

export const AIRCRAFT_CATALOG: AircraftModel[] = [
  {
    id: 'cessna-172',
    name: 'Cessna 172 Skyhawk',
    category: 'Monomotor a Pistão',
    manufacturer: 'Cessna',
    cruisingSpeedKts: 122,
    rangeNm: 640,
    passengerCapacity: 3,
    cargoCapacityKg: 220,
    rentalFeePerFlight: 0, // Free starter aircraft for initial contracts
    purchasePrice: 45000,
    imagePlaceholderColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'A aeronave de treinamento mais popular do mundo. Estável, confiável e ideal para pilotos iniciantes em voos VFR e IFR curtos.'
  },
  {
    id: 'da40-ng',
    name: 'Diamond DA40 NG',
    category: 'Monomotor a Pistão',
    manufacturer: 'Diamond Aircraft',
    cruisingSpeedKts: 154,
    rangeNm: 720,
    passengerCapacity: 3,
    cargoCapacityKg: 250,
    rentalFeePerFlight: 200,
    purchasePrice: 62000,
    imagePlaceholderColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Design moderno em fibra de carbono com aviônicos Garmin G1000 NXi e motor Austro Diesel eficiente.'
  },
  {
    id: 'baron-g58',
    name: 'Beechcraft Baron G58',
    category: 'Bimotor a Pistão',
    manufacturer: 'Beechcraft',
    cruisingSpeedKts: 202,
    rangeNm: 1020,
    passengerCapacity: 5,
    cargoCapacityKg: 450,
    rentalFeePerFlight: 450,
    purchasePrice: 135000,
    imagePlaceholderColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Bimotor de alto desempenho com excelente capacidade útil e velocidade ideal para cargas e executivos.'
  },
  {
    id: 'cessna-208b',
    name: 'Cessna 208B Grand Caravan',
    category: 'Monomotor Turboélice',
    manufacturer: 'Cessna',
    cruisingSpeedKts: 185,
    rangeNm: 912,
    passengerCapacity: 9,
    cargoCapacityKg: 1350,
    rentalFeePerFlight: 600,
    purchasePrice: 210000,
    imagePlaceholderColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'O cavalo de batalha definitivo da aviação regional. Capacidade gigantesca para cargas e pista curta.'
  },
  {
    id: 'king-air-350i',
    name: 'Beechcraft King Air 350i',
    category: 'Bimotor Turboélice',
    manufacturer: 'Beechcraft',
    cruisingSpeedKts: 312,
    rangeNm: 1800,
    passengerCapacity: 11,
    cargoCapacityKg: 1100,
    rentalFeePerFlight: 950,
    purchasePrice: 420000,
    imagePlaceholderColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Turboélice executivo pressurizado de luxo. Alcance superior, velocidade de jato leve e conforto de cabine.'
  }
];
