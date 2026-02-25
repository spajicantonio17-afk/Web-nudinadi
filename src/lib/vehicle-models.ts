// ── Vehicle Brand & Model Data ──────────────────────────────

export interface VehicleModel {
  name: string;
  variants?: string[];
}

export interface VehicleBrand {
  name: string;
  slug: string;
  models: VehicleModel[];
}

// ── Vehicle Type System ─────────────────────────────────────

export type VehicleType = 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'camper' | 'boat' | 'atv' | 'parts';

export const VEHICLE_SUBCATEGORY_MAP: Record<string, VehicleType> = {
  'osobni automobili': 'car',
  'vozila': 'car',
  'motocikli i skuteri': 'motorcycle',
  'teretna vozila': 'truck',
  'autobusi i minibusi': 'truck',
  'bicikli': 'bicycle',
  'kamperi i kamp prikolice': 'camper',
  'nautika i plovila': 'boat',
  'atv / quad / utv': 'atv',
  'dijelovi za vozila': 'parts',
};

export function resolveVehicleType(name: string): VehicleType {
  return VEHICLE_SUBCATEGORY_MAP[name.toLowerCase().trim()] ?? 'car';
}

// ── Car Brands with Models ──────────────────────────────────

export const CAR_BRANDS_WITH_MODELS: VehicleBrand[] = [
  {
    name: 'BMW', slug: 'bmw',
    models: [
      { name: 'Serija 1', variants: ['114', '116', '118', '120', '125', '128', '130', '135', '140'] },
      { name: 'Serija 2', variants: ['218', '220', '225', '228', '230', '235', '240'] },
      { name: 'Serija 3', variants: ['316', '318', '320', '325', '328', '330', '335', '340'] },
      { name: 'Serija 4', variants: ['418', '420', '425', '428', '430', '435', '440'] },
      { name: 'Serija 5', variants: ['518', '520', '523', '525', '528', '530', '535', '540', '545', '550'] },
      { name: 'Serija 6', variants: ['620', '630', '640', '650'] },
      { name: 'Serija 7', variants: ['725', '728', '730', '735', '740', '745', '750', '760'] },
      { name: 'Serija 8', variants: ['840', '850'] },
      { name: 'X1' }, { name: 'X2' }, { name: 'X3' }, { name: 'X4' },
      { name: 'X5' }, { name: 'X6' }, { name: 'X7' },
      { name: 'Z3' }, { name: 'Z4' },
      { name: 'M2' }, { name: 'M3' }, { name: 'M4' }, { name: 'M5' }, { name: 'M8' },
      { name: 'iX' }, { name: 'iX3' }, { name: 'i3' }, { name: 'i4' }, { name: 'i5' }, { name: 'i7' },
    ]
  },
  {
    name: 'Mercedes-Benz', slug: 'mercedes-benz',
    models: [
      { name: 'A-Klasse', variants: ['A140', 'A150', 'A160', 'A170', 'A180', 'A200', 'A220', 'A250', 'A35 AMG', 'A45 AMG'] },
      { name: 'B-Klasse', variants: ['B150', 'B160', 'B170', 'B180', 'B200', 'B220', 'B250'] },
      { name: 'C-Klasse', variants: ['C160', 'C180', 'C200', 'C220', 'C230', 'C240', 'C250', 'C280', 'C300', 'C320', 'C350', 'C400', 'C43 AMG', 'C63 AMG'] },
      { name: 'E-Klasse', variants: ['E200', 'E220', 'E230', 'E240', 'E250', 'E270', 'E280', 'E300', 'E320', 'E350', 'E400', 'E450', 'E500', 'E53 AMG', 'E63 AMG'] },
      { name: 'S-Klasse', variants: ['S280', 'S300', 'S320', 'S350', 'S400', 'S450', 'S500', 'S560', 'S580', 'S600', 'S63 AMG', 'S65 AMG'] },
      { name: 'CLA', variants: ['CLA180', 'CLA200', 'CLA220', 'CLA250', 'CLA35 AMG', 'CLA45 AMG'] },
      { name: 'CLS', variants: ['CLS250', 'CLS300', 'CLS350', 'CLS400', 'CLS450', 'CLS500', 'CLS53 AMG', 'CLS63 AMG'] },
      { name: 'GLA', variants: ['GLA180', 'GLA200', 'GLA220', 'GLA250', 'GLA35 AMG', 'GLA45 AMG'] },
      { name: 'GLB', variants: ['GLB180', 'GLB200', 'GLB220', 'GLB250', 'GLB35 AMG'] },
      { name: 'GLC', variants: ['GLC200', 'GLC220', 'GLC250', 'GLC300', 'GLC350', 'GLC43 AMG', 'GLC63 AMG'] },
      { name: 'GLE', variants: ['GLE250', 'GLE300', 'GLE350', 'GLE400', 'GLE450', 'GLE500', 'GLE53 AMG', 'GLE63 AMG'] },
      { name: 'GLS', variants: ['GLS350', 'GLS400', 'GLS450', 'GLS500', 'GLS580', 'GLS600', 'GLS63 AMG'] },
      { name: 'G-Klasse', variants: ['G270', 'G300', 'G350', 'G400', 'G500', 'G550', 'G63 AMG'] },
      { name: 'V-Klasse', variants: ['V200', 'V220', 'V250', 'V300'] },
      { name: 'Vito' }, { name: 'Sprinter' },
      { name: 'SLK / SLC' }, { name: 'SL' }, { name: 'AMG GT' },
      { name: 'EQA' }, { name: 'EQB' }, { name: 'EQC' }, { name: 'EQE' }, { name: 'EQS' },
    ]
  },
  {
    name: 'Audi', slug: 'audi',
    models: [
      { name: 'A1', variants: ['25', '30', '35', '40'] },
      { name: 'A3', variants: ['30', '35', '40', 'S3', 'RS3'] },
      { name: 'A4', variants: ['30', '35', '40', '45', 'S4', 'RS4'] },
      { name: 'A5', variants: ['35', '40', '45', 'S5', 'RS5'] },
      { name: 'A6', variants: ['40', '45', '50', '55', 'S6', 'RS6'] },
      { name: 'A7', variants: ['45', '50', '55', 'S7', 'RS7'] },
      { name: 'A8', variants: ['50', '55', '60', 'S8'] },
      { name: 'Q2' }, { name: 'Q3', variants: ['35', '40', '45', 'RSQ3'] },
      { name: 'Q5', variants: ['40', '45', '50', 'SQ5'] },
      { name: 'Q7', variants: ['45', '50', '55', 'SQ7'] },
      { name: 'Q8', variants: ['50', '55', 'SQ8', 'RSQ8'] },
      { name: 'TT', variants: ['TT', 'TTS', 'TTRS'] },
      { name: 'R8' },
      { name: 'e-tron' }, { name: 'e-tron GT' }, { name: 'Q4 e-tron' },
    ]
  },
  {
    name: 'Volkswagen', slug: 'volkswagen',
    models: [
      { name: 'Golf', variants: ['Golf 1', 'Golf 2', 'Golf 3', 'Golf 4', 'Golf 5', 'Golf 6', 'Golf 7', 'Golf 8', 'GTI', 'GTD', 'GTE', 'R'] },
      { name: 'Polo', variants: ['Polo 4', 'Polo 5', 'Polo 6', 'GTI'] },
      { name: 'Passat', variants: ['B5', 'B6', 'B7', 'B8', 'CC'] },
      { name: 'Tiguan' }, { name: 'T-Roc' }, { name: 'T-Cross' }, { name: 'Touareg' },
      { name: 'Arteon' }, { name: 'Taigo' }, { name: 'Caddy' },
      { name: 'Transporter / T5 / T6' }, { name: 'Touran' }, { name: 'Sharan' },
      { name: 'Up!' }, { name: 'Jetta' }, { name: 'Scirocco' },
      { name: 'ID.3' }, { name: 'ID.4' }, { name: 'ID.5' }, { name: 'ID.7' },
    ]
  },
  {
    name: 'Opel', slug: 'opel',
    models: [
      { name: 'Corsa' }, { name: 'Astra' }, { name: 'Insignia' }, { name: 'Mokka' },
      { name: 'Crossland' }, { name: 'Grandland' }, { name: 'Meriva' },
      { name: 'Zafira' }, { name: 'Vectra' }, { name: 'Omega' }, { name: 'Combo' },
      { name: 'Vivaro' }, { name: 'Movano' }, { name: 'Adam' }, { name: 'Karl' },
    ]
  },
  {
    name: 'Renault', slug: 'renault',
    models: [
      { name: 'Clio' }, { name: 'Megane' }, { name: 'Scenic' }, { name: 'Captur' },
      { name: 'Kadjar' }, { name: 'Koleos' }, { name: 'Talisman' }, { name: 'Twingo' },
      { name: 'Kangoo' }, { name: 'Master' }, { name: 'Trafic' }, { name: 'Laguna' },
      { name: 'Austral' }, { name: 'Arkana' }, { name: 'Zoe' },
    ]
  },
  {
    name: 'Peugeot', slug: 'peugeot',
    models: [
      { name: '108' }, { name: '208' }, { name: '308' }, { name: '408' },
      { name: '508' }, { name: '2008' }, { name: '3008' }, { name: '5008' },
      { name: 'Partner' }, { name: 'Rifter' }, { name: 'Expert' }, { name: 'Boxer' },
    ]
  },
  {
    name: 'Citro\u00ebn', slug: 'citroen',
    models: [
      { name: 'C1' }, { name: 'C3' }, { name: 'C3 Aircross' }, { name: 'C4' },
      { name: 'C4 Cactus' }, { name: 'C5 Aircross' }, { name: 'C5 X' },
      { name: 'Berlingo' }, { name: 'Jumper' }, { name: 'Jumpy' },
    ]
  },
  {
    name: 'Fiat', slug: 'fiat',
    models: [
      { name: 'Panda' }, { name: '500' }, { name: '500X' }, { name: '500L' },
      { name: 'Tipo' }, { name: 'Punto' }, { name: 'Grande Punto' },
      { name: 'Bravo' }, { name: 'Stilo' }, { name: 'Doblo' },
      { name: 'Ducato' }, { name: 'Fiorino' }, { name: 'Multipla' },
    ]
  },
  {
    name: 'Toyota', slug: 'toyota',
    models: [
      { name: 'Yaris' }, { name: 'Corolla' }, { name: 'Camry' }, { name: 'RAV4' },
      { name: 'C-HR' }, { name: 'Aygo' }, { name: 'Avensis' }, { name: 'Prius' },
      { name: 'Land Cruiser' }, { name: 'Hilux' }, { name: 'Supra' },
      { name: 'Proace' }, { name: 'Yaris Cross' }, { name: 'bZ4X' },
    ]
  },
  {
    name: 'Honda', slug: 'honda',
    models: [
      { name: 'Civic' }, { name: 'Jazz' }, { name: 'CR-V' }, { name: 'HR-V' },
      { name: 'Accord' }, { name: 'e:Ny1' }, { name: 'ZR-V' },
    ]
  },
  {
    name: 'Hyundai', slug: 'hyundai',
    models: [
      { name: 'i10' }, { name: 'i20' }, { name: 'i30' }, { name: 'i40' },
      { name: 'Tucson' }, { name: 'Santa Fe' }, { name: 'Kona' },
      { name: 'Bayon' }, { name: 'Ioniq' }, { name: 'Ioniq 5' }, { name: 'Ioniq 6' },
    ]
  },
  {
    name: 'Kia', slug: 'kia',
    models: [
      { name: 'Picanto' }, { name: 'Rio' }, { name: 'Ceed' }, { name: 'Stonic' },
      { name: 'Sportage' }, { name: 'Sorento' }, { name: 'Niro' },
      { name: 'EV6' }, { name: 'EV9' }, { name: 'Proceed' }, { name: 'XCeed' },
    ]
  },
  {
    name: '\u0160koda', slug: 'skoda',
    models: [
      { name: 'Fabia' }, { name: 'Octavia' }, { name: 'Superb' },
      { name: 'Karoq' }, { name: 'Kodiaq' }, { name: 'Kamiq' },
      { name: 'Scala' }, { name: 'Rapid' }, { name: 'Enyaq' }, { name: 'Citigo' },
    ]
  },
  {
    name: 'Ford', slug: 'ford',
    models: [
      { name: 'Fiesta' }, { name: 'Focus' }, { name: 'Mondeo' }, { name: 'Puma' },
      { name: 'Kuga' }, { name: 'EcoSport' }, { name: 'Explorer' },
      { name: 'Mustang' }, { name: 'Ranger' }, { name: 'Transit' },
      { name: 'Transit Connect' }, { name: 'Galaxy' }, { name: 'S-Max' },
    ]
  },
  {
    name: 'Dacia', slug: 'dacia',
    models: [
      { name: 'Sandero' }, { name: 'Duster' }, { name: 'Logan' },
      { name: 'Jogger' }, { name: 'Spring' }, { name: 'Dokker' }, { name: 'Lodgy' },
    ]
  },
  {
    name: 'Volvo', slug: 'volvo',
    models: [
      { name: 'XC40' }, { name: 'XC60' }, { name: 'XC90' },
      { name: 'S60' }, { name: 'S90' }, { name: 'V40' }, { name: 'V60' }, { name: 'V90' },
      { name: 'C40' }, { name: 'EX30' }, { name: 'EX90' },
    ]
  },
  {
    name: 'Nissan', slug: 'nissan',
    models: [
      { name: 'Micra' }, { name: 'Juke' }, { name: 'Qashqai' }, { name: 'X-Trail' },
      { name: 'Leaf' }, { name: 'Ariya' }, { name: 'Navara' }, { name: 'Note' },
    ]
  },
  {
    name: 'Mazda', slug: 'mazda',
    models: [
      { name: 'Mazda 2' }, { name: 'Mazda 3' }, { name: 'Mazda 6' },
      { name: 'CX-3' }, { name: 'CX-30' }, { name: 'CX-5' }, { name: 'CX-60' },
      { name: 'MX-5' }, { name: 'MX-30' },
    ]
  },
  {
    name: 'Suzuki', slug: 'suzuki',
    models: [
      { name: 'Swift' }, { name: 'Vitara' }, { name: 'S-Cross' },
      { name: 'Ignis' }, { name: 'Jimny' }, { name: 'Across' },
    ]
  },
  {
    name: 'Seat', slug: 'seat',
    models: [
      { name: 'Ibiza' }, { name: 'Leon' }, { name: 'Arona' },
      { name: 'Ateca' }, { name: 'Tarraco' }, { name: 'Mii' }, { name: 'Alhambra' },
    ]
  },
  {
    name: 'Cupra', slug: 'cupra',
    models: [
      { name: 'Formentor' }, { name: 'Born' }, { name: 'Leon' }, { name: 'Ateca' }, { name: 'Tavascan' },
    ]
  },
  {
    name: 'Tesla', slug: 'tesla',
    models: [
      { name: 'Model 3' }, { name: 'Model Y' }, { name: 'Model S' }, { name: 'Model X' }, { name: 'Cybertruck' },
    ]
  },
  {
    name: 'Jeep', slug: 'jeep',
    models: [
      { name: 'Renegade' }, { name: 'Compass' }, { name: 'Cherokee' },
      { name: 'Grand Cherokee' }, { name: 'Wrangler' }, { name: 'Gladiator' }, { name: 'Avenger' },
    ]
  },
  {
    name: 'Land Rover', slug: 'land-rover',
    models: [
      { name: 'Defender' }, { name: 'Discovery' }, { name: 'Discovery Sport' },
      { name: 'Range Rover' }, { name: 'Range Rover Sport' }, { name: 'Range Rover Evoque' }, { name: 'Range Rover Velar' },
    ]
  },
  // ── Brands with models filled in ─────────────────────────
  {
    name: 'Porsche', slug: 'porsche',
    models: [
      { name: '911', variants: ['Carrera', 'Turbo', 'GT3', 'GT3 RS', 'Targa'] },
      { name: '718 Boxster' }, { name: '718 Cayman' },
      { name: 'Cayenne' }, { name: 'Cayenne Coup\u00e9' },
      { name: 'Macan' }, { name: 'Panamera' },
      { name: 'Taycan', variants: ['4S', 'Turbo', 'GTS', 'Cross Turismo'] },
    ]
  },
  {
    name: 'Alfa Romeo', slug: 'alfa-romeo',
    models: [
      { name: 'Giulietta' }, { name: 'Giulia' }, { name: 'Stelvio' },
      { name: 'MiTo' }, { name: 'Tonale' },
      { name: '147' }, { name: '156' }, { name: '159' },
      { name: 'GT' }, { name: 'Brera' }, { name: 'Spider' }, { name: '4C' },
    ]
  },
  {
    name: 'MINI', slug: 'mini',
    models: [
      { name: 'Cooper', variants: ['3-door', '5-door'] },
      { name: 'Clubman' }, { name: 'Countryman' }, { name: 'Paceman' },
      { name: 'Convertible' }, { name: 'Electric' }, { name: 'JCW' },
    ]
  },
  {
    name: 'Mitsubishi', slug: 'mitsubishi',
    models: [
      { name: 'Outlander' }, { name: 'ASX' }, { name: 'Eclipse Cross' },
      { name: 'Space Star' }, { name: 'Pajero' }, { name: 'L200' },
      { name: 'Colt' }, { name: 'Lancer' }, { name: 'Galant' }, { name: 'i-MiEV' },
    ]
  },
  {
    name: 'Subaru', slug: 'subaru',
    models: [
      { name: 'Forester' }, { name: 'Outback' }, { name: 'XV / Crosstrek' },
      { name: 'Impreza' }, { name: 'WRX' }, { name: 'Legacy' },
      { name: 'BRZ' }, { name: 'Levorg' }, { name: 'Solterra' },
    ]
  },
  {
    name: 'Jaguar', slug: 'jaguar',
    models: [
      { name: 'XE' }, { name: 'XF' }, { name: 'XJ' },
      { name: 'F-Pace' }, { name: 'E-Pace' }, { name: 'I-Pace' },
      { name: 'F-Type' }, { name: 'S-Type' }, { name: 'X-Type' },
    ]
  },
  {
    name: 'Lexus', slug: 'lexus',
    models: [
      { name: 'IS' }, { name: 'ES' }, { name: 'GS' }, { name: 'LS' },
      { name: 'NX' }, { name: 'RX' }, { name: 'UX' },
      { name: 'LC' }, { name: 'LX' }, { name: 'RC' }, { name: 'LBX' },
    ]
  },
  {
    name: 'Ferrari', slug: 'ferrari',
    models: [
      { name: '296 GTB' }, { name: '296 GTS' }, { name: 'F8 Tributo' },
      { name: 'SF90 Stradale' }, { name: 'Roma' }, { name: 'Portofino' },
      { name: '812' }, { name: 'Purosangue' },
      { name: '488 GTB' }, { name: '458 Italia' },
      { name: 'California T' }, { name: 'LaFerrari' },
    ]
  },
  {
    name: 'Lamborghini', slug: 'lamborghini',
    models: [
      { name: 'Hurac\u00e1n', variants: ['EVO', 'STO', 'Tecnica', 'Sterrato'] },
      { name: 'Urus', variants: ['S', 'Performante'] },
      { name: 'Revuelto' },
      { name: 'Aventador', variants: ['S', 'SVJ', 'Ultimae'] },
      { name: 'Gallardo' },
    ]
  },
  {
    name: 'Maserati', slug: 'maserati',
    models: [
      { name: 'Ghibli' }, { name: 'Levante' }, { name: 'Quattroporte' },
      { name: 'MC20' },
      { name: 'Grecale', variants: ['GT', 'Modena', 'Trofeo'] },
      { name: 'GranTurismo' }, { name: 'GranCabrio' },
    ]
  },
  {
    name: 'McLaren', slug: 'mclaren',
    models: [
      { name: '720S' }, { name: '765LT' }, { name: 'Artura' },
      { name: 'GT' }, { name: '570S' }, { name: '600LT' }, { name: 'Senna' },
    ]
  },
  {
    name: 'Bentley', slug: 'bentley',
    models: [
      { name: 'Continental GT' }, { name: 'Continental GTC' },
      { name: 'Flying Spur' },
      { name: 'Bentayga', variants: ['V8', 'Speed', 'EWB'] },
    ]
  },
  {
    name: 'Rolls-Royce', slug: 'rolls-royce',
    models: [
      { name: 'Ghost' }, { name: 'Phantom' }, { name: 'Wraith' },
      { name: 'Cullinan' }, { name: 'Dawn' }, { name: 'Spectre' },
    ]
  },
  {
    name: 'Aston Martin', slug: 'aston-martin',
    models: [
      { name: 'DB11' }, { name: 'DB12' }, { name: 'Vantage' },
      { name: 'DBX', variants: ['707'] },
      { name: 'DBS' }, { name: 'V8 Vantage' },
    ]
  },
  {
    name: 'Smart', slug: 'smart',
    models: [
      { name: 'ForTwo' }, { name: 'ForFour' }, { name: '#1' }, { name: '#3' },
    ]
  },
  {
    name: 'DS', slug: 'ds',
    models: [
      { name: 'DS3 Crossback' }, { name: 'DS4' }, { name: 'DS7 Crossback' }, { name: 'DS9' },
    ]
  },
  {
    name: 'Alpine', slug: 'alpine',
    models: [
      { name: 'A110', variants: ['Pure', 'L\u00e9gende', 'S', 'GT', 'R'] },
      { name: 'A290' },
    ]
  },
  {
    name: 'MG', slug: 'mg',
    models: [
      { name: 'ZS' }, { name: 'ZS EV' }, { name: 'HS' },
      { name: 'MG4' }, { name: 'MG5' }, { name: 'Marvel R' }, { name: 'Cyberster' },
    ]
  },
  {
    name: 'BYD', slug: 'byd',
    models: [
      { name: 'Atto 3' }, { name: 'Han' }, { name: 'Tang' },
      { name: 'Seal' }, { name: 'Dolphin' }, { name: 'Song Plus' }, { name: 'Yuan Plus' },
    ]
  },
  {
    name: 'Chrysler', slug: 'chrysler',
    models: [
      { name: '300' }, { name: 'Pacifica' }, { name: 'Voyager' }, { name: 'PT Cruiser' },
    ]
  },
  {
    name: 'Dodge', slug: 'dodge',
    models: [
      { name: 'Charger' },
      { name: 'Challenger', variants: ['R/T', 'SRT', 'Hellcat'] },
      { name: 'Durango' }, { name: 'Journey' }, { name: 'Nitro' },
    ]
  },
  {
    name: 'Chevrolet', slug: 'chevrolet',
    models: [
      { name: 'Camaro' },
      { name: 'Corvette', variants: ['C7', 'C8'] },
      { name: 'Tahoe' }, { name: 'Suburban' }, { name: 'Silverado' },
      { name: 'Equinox' }, { name: 'Trax' }, { name: 'Cruze' },
      { name: 'Malibu' }, { name: 'Spark' }, { name: 'Captiva' }, { name: 'Orlando' },
    ]
  },
  {
    name: 'Cadillac', slug: 'cadillac',
    models: [
      { name: 'Escalade' }, { name: 'CT5' },
      { name: 'XT4' }, { name: 'XT5' }, { name: 'XT6' }, { name: 'Lyriq' },
    ]
  },
  {
    name: 'GMC', slug: 'gmc',
    models: [
      { name: 'Sierra', variants: ['1500', '2500', '3500'] },
      { name: 'Yukon', variants: ['XL', 'Denali'] },
      { name: 'Canyon' }, { name: 'Terrain' }, { name: 'Acadia' }, { name: 'Hummer EV' },
    ]
  },
  {
    name: 'RAM', slug: 'ram',
    models: [
      { name: '1500', variants: ['Classic', 'Laramie', 'Limited', 'TRX'] },
      { name: '2500' }, { name: '3500' }, { name: 'ProMaster' },
    ]
  },
  {
    name: 'SsangYong', slug: 'ssangyong',
    models: [
      { name: 'Tivoli' }, { name: 'Korando' }, { name: 'Rexton' },
      { name: 'Musso' }, { name: 'Torres' },
    ]
  },
  {
    name: 'Saab', slug: 'saab',
    models: [
      { name: '9-3', variants: ['Sport Sedan', 'Convertible', 'SportCombi'] },
      { name: '9-5', variants: ['Sedan', 'SportCombi'] },
      { name: '9-4X' },
    ]
  },
  {
    name: 'Infiniti', slug: 'infiniti',
    models: [
      { name: 'Q30' }, { name: 'Q50' }, { name: 'Q60' }, { name: 'Q70' },
      { name: 'QX30' }, { name: 'QX50' }, { name: 'QX60' }, { name: 'QX70' }, { name: 'QX80' },
    ]
  },
  {
    name: 'Lincoln', slug: 'lincoln',
    models: [
      { name: 'Navigator' }, { name: 'Aviator' }, { name: 'Corsair' }, { name: 'Nautilus' },
    ]
  },
  {
    name: 'Lotus', slug: 'lotus',
    models: [
      { name: 'Emira' }, { name: 'Eletre' }, { name: 'Evija' },
      { name: 'Elise' }, { name: 'Exige' }, { name: 'Evora' },
    ]
  },
  {
    name: 'Zastava', slug: 'zastava',
    models: [
      { name: '101' }, { name: '128' }, { name: '750 (Fi\u0107o)' },
      { name: 'Yugo 45' }, { name: 'Yugo 55' }, { name: 'Yugo 60' }, { name: 'Yugo 65' },
      { name: 'Skala' }, { name: 'Florida' }, { name: 'Tempo' },
    ]
  },
  {
    name: 'Lada', slug: 'lada',
    models: [
      { name: 'Niva', variants: ['Legend', 'Travel'] },
      { name: '2101 (\u017diguli)' }, { name: '2103' }, { name: '2104' },
      { name: '2105' }, { name: '2106' }, { name: '2107' },
      { name: 'Samara' }, { name: 'Vesta' }, { name: 'Granta' },
    ]
  },
  {
    name: 'NIO', slug: 'nio',
    models: [
      { name: 'ET5' }, { name: 'ET7' }, { name: 'ES6' },
      { name: 'ES8' }, { name: 'EC6' }, { name: 'EC7' }, { name: 'EL8' },
    ]
  },
  {
    name: 'Geely', slug: 'geely',
    models: [
      { name: 'Coolray' }, { name: 'Atlas' }, { name: 'Emgrand' }, { name: 'Monjaro' },
    ]
  },
  {
    name: 'Great Wall', slug: 'great-wall',
    models: [
      { name: 'Haval H6' }, { name: 'Haval Jolion' },
      { name: 'Haval Dargo' }, { name: 'Ora Good Cat' },
    ]
  },
  {
    name: 'Chery', slug: 'chery',
    models: [
      { name: 'Tiggo 4 Pro' }, { name: 'Tiggo 7 Pro' },
      { name: 'Tiggo 8 Pro' }, { name: 'Omoda 5' },
    ]
  },
  {
    name: 'Tata', slug: 'tata',
    models: [
      { name: 'Nexon' }, { name: 'Harrier' }, { name: 'Safari' }, { name: 'Punch' },
    ]
  },
  {
    name: 'Mahindra', slug: 'mahindra',
    models: [
      { name: 'XUV700' }, { name: 'Thar' }, { name: 'Scorpio' }, { name: 'Bolero' },
    ]
  },
  {
    name: 'Rimac', slug: 'rimac',
    models: [
      { name: 'Nevera' }, { name: 'C Two' },
    ]
  },
  {
    name: 'Yugo', slug: 'yugo',
    models: [
      { name: '45' }, { name: '55' }, { name: '60' }, { name: '65' },
      { name: 'Koral' }, { name: 'Florida' }, { name: 'Tempo' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Motorcycle Brands with Models ───────────────────────────

export const MOTORCYCLE_BRANDS: VehicleBrand[] = [
  {
    name: 'Kawasaki', slug: 'kawasaki',
    models: [
      { name: 'Ninja 250' }, { name: 'Ninja 300' }, { name: 'Ninja 400' },
      { name: 'Ninja 650' }, { name: 'Ninja ZX-6R' }, { name: 'Ninja ZX-10R' },
      { name: 'Z400' }, { name: 'Z650' }, { name: 'Z900' }, { name: 'Z1000' },
      { name: 'Versys 650' }, { name: 'Versys 1000' },
      { name: 'Vulcan S' }, { name: 'Vulcan 900' },
      { name: 'KLR 650' }, { name: 'KLX 250' }, { name: 'KX 450' },
      { name: 'W800' }, { name: 'H2' }, { name: 'ZZR 1400' },
    ]
  },
  {
    name: 'Yamaha', slug: 'yamaha',
    models: [
      { name: 'YZF-R1' }, { name: 'YZF-R6' }, { name: 'YZF-R3' }, { name: 'YZF-R125' },
      { name: 'MT-03' }, { name: 'MT-07' }, { name: 'MT-09' }, { name: 'MT-10' },
      { name: 'Tracer 7' }, { name: 'Tracer 9' },
      { name: 'T\u00e9n\u00e9r\u00e9 700' }, { name: 'XSR 700' }, { name: 'XSR 900' },
      { name: 'XMAX 300' }, { name: 'TMAX 560' }, { name: 'NMAX 125' },
      { name: 'WR 250' }, { name: 'YZ 250' }, { name: 'YZ 450' },
      { name: 'Bolt' }, { name: 'V-Star' }, { name: 'Drag Star' },
    ]
  },
  {
    name: 'Honda', slug: 'honda',
    models: [
      { name: 'CBR 125' }, { name: 'CBR 250' }, { name: 'CBR 300' },
      { name: 'CBR 500R' }, { name: 'CBR 600RR' }, { name: 'CBR 1000RR' },
      { name: 'CB 125R' }, { name: 'CB 300R' }, { name: 'CB 500F' },
      { name: 'CB 650R' }, { name: 'CB 1000R' },
      { name: 'Africa Twin' }, { name: 'NC 750' },
      { name: 'X-ADV' }, { name: 'Forza 125' }, { name: 'Forza 350' },
      { name: 'PCX 125' }, { name: 'SH 125' }, { name: 'SH 300' },
      { name: 'Gold Wing' }, { name: 'Rebel 500' }, { name: 'Rebel 1100' },
      { name: 'CRF 250' }, { name: 'CRF 450' }, { name: 'CRF 1100' },
    ]
  },
  {
    name: 'Suzuki', slug: 'suzuki',
    models: [
      { name: 'GSX-R 600' }, { name: 'GSX-R 750' }, { name: 'GSX-R 1000' },
      { name: 'GSX-S 750' }, { name: 'GSX-S 1000' },
      { name: 'V-Strom 650' }, { name: 'V-Strom 1050' },
      { name: 'SV 650' }, { name: 'Hayabusa' }, { name: 'Katana' },
      { name: 'Burgman 400' }, { name: 'Burgman 650' },
      { name: 'Boulevard' }, { name: 'DR-Z 400' },
      { name: 'RM-Z 250' }, { name: 'RM-Z 450' },
    ]
  },
  {
    name: 'KTM', slug: 'ktm',
    models: [
      { name: 'Duke 125' }, { name: 'Duke 200' }, { name: 'Duke 390' },
      { name: 'Duke 690' }, { name: 'Duke 790' }, { name: 'Duke 890' }, { name: 'Duke 1290' },
      { name: 'RC 125' }, { name: 'RC 200' }, { name: 'RC 390' },
      { name: 'Adventure 390' }, { name: 'Adventure 790' },
      { name: 'Adventure 890' }, { name: 'Adventure 1290' },
      { name: 'SMC 690' }, { name: 'Enduro 690' },
      { name: 'EXC 250' }, { name: 'EXC 300' }, { name: 'EXC 450' }, { name: 'EXC 500' },
      { name: 'SX 125' }, { name: 'SX 250' }, { name: 'SX-F 350' }, { name: 'SX-F 450' },
    ]
  },
  {
    name: 'Ducati', slug: 'ducati',
    models: [
      { name: 'Panigale V2' }, { name: 'Panigale V4' },
      { name: 'Monster' }, { name: 'Monster 821' }, { name: 'Monster 1200' },
      { name: 'Streetfighter V2' }, { name: 'Streetfighter V4' },
      { name: 'Multistrada V2' }, { name: 'Multistrada V4' },
      { name: 'Diavel' }, { name: 'XDiavel' },
      { name: 'Scrambler' }, { name: 'Hypermotard' }, { name: 'DesertX' },
    ]
  },
  {
    name: 'BMW', slug: 'bmw',
    models: [
      { name: 'S 1000 RR' }, { name: 'S 1000 R' }, { name: 'S 1000 XR' },
      { name: 'R 1250 GS' }, { name: 'R 1250 RT' }, { name: 'R 1250 RS' },
      { name: 'R 1300 GS' },
      { name: 'F 900 R' }, { name: 'F 900 XR' },
      { name: 'F 750 GS' }, { name: 'F 850 GS' },
      { name: 'G 310 R' }, { name: 'G 310 GS' },
      { name: 'R nineT' }, { name: 'K 1600' },
      { name: 'C 400' }, { name: 'C 650' }, { name: 'CE 04' },
    ]
  },
  {
    name: 'Harley-Davidson', slug: 'harley-davidson',
    models: [
      { name: 'Sportster' }, { name: 'Sportster S' }, { name: 'Iron 883' },
      { name: 'Fat Boy' }, { name: 'Softail' }, { name: 'Street Bob' },
      { name: 'Road King' }, { name: 'Road Glide' }, { name: 'Street Glide' },
      { name: 'Electra Glide' }, { name: 'Pan America' },
      { name: 'Nightster' }, { name: 'Breakout' }, { name: 'Low Rider' },
      { name: 'LiveWire' },
    ]
  },
  {
    name: 'Aprilia', slug: 'aprilia',
    models: [
      { name: 'RS 125' }, { name: 'RS 660' }, { name: 'RSV4' },
      { name: 'Tuono 660' }, { name: 'Tuono V4' },
      { name: 'Tuareg 660' }, { name: 'Shiver 900' },
      { name: 'SR GT' }, { name: 'SX 125' },
    ]
  },
  {
    name: 'Triumph', slug: 'triumph',
    models: [
      { name: 'Street Triple' }, { name: 'Speed Triple' }, { name: 'Tiger 660' },
      { name: 'Tiger 900' }, { name: 'Tiger 1200' },
      { name: 'Bonneville' }, { name: 'Scrambler' },
      { name: 'Trident 660' }, { name: 'Rocket 3' }, { name: 'Speed 400' },
    ]
  },
  {
    name: 'Husqvarna', slug: 'husqvarna',
    models: [
      { name: 'Svartpilen 401' }, { name: 'Vitpilen 401' },
      { name: 'Norden 901' }, { name: 'FE 350' }, { name: 'FE 501' },
      { name: 'FC 250' }, { name: 'FC 450' }, { name: 'TE 300' },
    ]
  },
  {
    name: 'Benelli', slug: 'benelli',
    models: [
      { name: 'TRK 502' }, { name: 'Leoncino 500' }, { name: 'BN 125' },
      { name: '752S' }, { name: 'TNT 125' },
    ]
  },
  {
    name: 'Vespa', slug: 'vespa',
    models: [
      { name: 'Primavera 50' }, { name: 'Primavera 125' }, { name: 'Primavera 150' },
      { name: 'GTS 125' }, { name: 'GTS 300' }, { name: 'Sprint 125' },
      { name: 'Elettrica' },
    ]
  },
  {
    name: 'Piaggio', slug: 'piaggio',
    models: [
      { name: 'Beverly 300' }, { name: 'Beverly 400' },
      { name: 'Medley 125' }, { name: 'Liberty 125' }, { name: 'MP3' },
    ]
  },
  {
    name: 'Ostalo', slug: '',
    models: []
  }
];

// ── Bicycle Brands with Models ──────────────────────────────

export const BICYCLE_BRANDS: VehicleBrand[] = [
  {
    name: 'Trek', slug: 'trek',
    models: [
      { name: 'Marlin' }, { name: 'X-Caliber' }, { name: 'Fuel EX' },
      { name: 'Top Fuel' }, { name: 'Slash' }, { name: 'Remedy' }, { name: 'Roscoe' },
      { name: 'Domane' }, { name: 'Emonda' }, { name: 'Madone' },
      { name: 'Checkpoint' }, { name: 'FX' }, { name: 'Verve' },
      { name: 'Dual Sport' }, { name: 'Rail' }, { name: 'Powerfly' },
    ]
  },
  {
    name: 'Specialized', slug: 'specialized',
    models: [
      { name: 'Rockhopper' }, { name: 'Chisel' }, { name: 'Epic' },
      { name: 'Stumpjumper' }, { name: 'Enduro' },
      { name: 'Levo' }, { name: 'Kenevo' },
      { name: 'Tarmac' }, { name: 'Roubaix' }, { name: 'Aethos' },
      { name: 'Crux' }, { name: 'Diverge' },
      { name: 'Turbo Levo' }, { name: 'Turbo Creo' }, { name: 'Vado' },
    ]
  },
  {
    name: 'Giant', slug: 'giant',
    models: [
      { name: 'Talon' }, { name: 'Fathom' }, { name: 'Trance' }, { name: 'Reign' },
      { name: 'TCR' }, { name: 'Defy' }, { name: 'Revolt' }, { name: 'Contend' },
      { name: 'Explore E+' }, { name: 'Trance X E+' },
    ]
  },
  {
    name: 'Canyon', slug: 'canyon',
    models: [
      { name: 'Spectral' }, { name: 'Strive' }, { name: 'Neuron' }, { name: 'Lux' },
      { name: 'Endurace' }, { name: 'Aeroad' }, { name: 'Grail' },
      { name: 'Ultimate' }, { name: 'Inflite' },
      { name: 'Roadlite' }, { name: 'Pathlite' },
    ]
  },
  {
    name: 'Cube', slug: 'cube',
    models: [
      { name: 'Attention' }, { name: 'Analog' }, { name: 'Stereo' },
      { name: 'AMS' }, { name: 'Reaction' },
      { name: 'Attain' }, { name: 'Agree' }, { name: 'Nuroad' },
      { name: 'Cross' }, { name: 'Touring' }, { name: 'Kathmandu' },
    ]
  },
  {
    name: 'Scott', slug: 'scott',
    models: [
      { name: 'Scale' }, { name: 'Spark' }, { name: 'Genius' }, { name: 'Ransom' },
      { name: 'Addict' }, { name: 'Speedster' }, { name: 'Contessa' }, { name: 'Sub Cross' },
    ]
  },
  {
    name: 'Cannondale', slug: 'cannondale',
    models: [
      { name: 'Trail' }, { name: 'Scalpel' }, { name: 'Habit' }, { name: 'Jekyll' },
      { name: 'SuperSix' }, { name: 'Synapse' }, { name: 'Topstone' },
      { name: 'CAAD' }, { name: 'Quick' }, { name: 'Moterra' },
    ]
  },
  {
    name: 'Merida', slug: 'merida',
    models: [
      { name: 'Big Nine' }, { name: 'Big Seven' },
      { name: 'One-Twenty' }, { name: 'One-Forty' }, { name: 'One-Sixty' },
      { name: 'Scultura' }, { name: 'Reacto' }, { name: 'Silex' },
      { name: 'Crossway' }, { name: 'eOne-Sixty' },
    ]
  },
  {
    name: 'Orbea', slug: 'orbea',
    models: [
      { name: 'Alma' }, { name: 'Oiz' }, { name: 'Occam' }, { name: 'Rallon' },
      { name: 'Orca' }, { name: 'Avant' }, { name: 'Terra' },
      { name: 'Gain' }, { name: 'Vibe' }, { name: 'MX' },
    ]
  },
  {
    name: 'Bianchi', slug: 'bianchi',
    models: [
      { name: 'Magma' }, { name: 'T-Tronik' }, { name: 'Oltre' },
      { name: 'Infinito' }, { name: 'Impulso' }, { name: 'Sprint' },
      { name: 'Via Nirone' }, { name: 'Aria' }, { name: 'Arcadex' },
    ]
  },
  {
    name: 'KTM', slug: 'ktm',
    models: [
      { name: 'Chicago' }, { name: 'Scarp' }, { name: 'Prowler' },
      { name: 'Revelator' }, { name: 'Strada' }, { name: 'Macina' }, { name: 'Ultra' },
    ]
  },
  {
    name: 'Kellys', slug: 'kellys',
    models: [
      { name: 'Spider' }, { name: 'Gate' }, { name: 'Tygon' },
      { name: 'Arc' }, { name: 'Cliff' }, { name: 'Phanatic' },
    ]
  },
  {
    name: 'Capriolo', slug: 'capriolo',
    models: [
      { name: 'Level' }, { name: 'Fireball' }, { name: 'Attack' },
      { name: 'Passion' }, { name: 'Sunrise' },
    ]
  },
  {
    name: 'Ghost', slug: 'ghost',
    models: [
      { name: 'Lector' }, { name: 'Riot' }, { name: 'SL AMR' },
      { name: 'Nirvana' }, { name: 'Kato' }, { name: 'Lanao' }, { name: 'E-Teru' },
    ]
  },
  {
    name: 'Haibike', slug: 'haibike',
    models: [
      { name: 'AllMtn' }, { name: 'AllTrail' }, { name: 'Adventr' },
      { name: 'Trekking' }, { name: 'Nduro' }, { name: 'Lyke' },
    ]
  },
  {
    name: 'Focus', slug: 'focus',
    models: [
      { name: 'Jam' }, { name: 'Thron' }, { name: 'Aventura' },
      { name: 'Paralane' }, { name: 'Izalco' }, { name: 'ATLAS' }, { name: 'Whistler' },
    ]
  },
  {
    name: 'Gazelle', slug: 'gazelle',
    models: [
      { name: 'Medeo' }, { name: 'Ultimate' }, { name: 'CityZen' },
      { name: 'Eclipse' }, { name: 'Arroyo' }, { name: 'Paris' },
    ]
  },
  {
    name: 'GT', slug: 'gt',
    models: [
      { name: 'Avalanche' }, { name: 'Sensor' }, { name: 'Force' },
      { name: 'Grade' }, { name: 'Aggressor' }, { name: 'Palomar' }, { name: 'Performer' },
    ]
  },
  {
    name: 'BMC', slug: 'bmc',
    models: [
      { name: 'Twostroke' }, { name: 'Fourstroke' }, { name: 'Speedfox' },
      { name: 'Agonist' }, { name: 'Roadmachine' }, { name: 'Teammachine' },
      { name: 'Alpenchallenge' }, { name: 'URS' },
    ]
  },
  {
    name: 'Rose', slug: 'rose',
    models: [
      { name: 'Count Solo' }, { name: 'Root Miller' }, { name: 'Backroad' },
      { name: 'The Bruce' }, { name: 'Pikes Peak' }, { name: 'Reveal' },
    ]
  },
  {
    name: 'Kona', slug: 'kona',
    models: [
      { name: 'Process' }, { name: 'Honzo' }, { name: 'Hei Hei' },
      { name: 'Rove' }, { name: 'Sutra' }, { name: 'Dew' }, { name: 'Unit' },
    ]
  },
  {
    name: 'Santa Cruz', slug: 'santa-cruz',
    models: [
      { name: 'Hightower' }, { name: 'Megatower' }, { name: 'Bronson' },
      { name: 'Tallboy' }, { name: '5010' }, { name: 'Chameleon' },
      { name: 'Stigmata' }, { name: 'Blur' },
    ]
  },
  {
    name: 'Pinarello', slug: 'pinarello',
    models: [
      { name: 'Dogma' }, { name: 'Prince' }, { name: 'Paris' },
      { name: 'Nytro' }, { name: 'Razha' },
    ]
  },
  {
    name: 'Cerv\u00e9lo', slug: 'cervelo',
    models: [
      { name: 'S5' }, { name: 'R5' }, { name: 'Caledonia' },
      { name: 'Soloist' }, { name: 'Aspero' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Truck Brands with Models ────────────────────────────────

export const TRUCK_BRANDS: VehicleBrand[] = [
  {
    name: 'MAN', slug: 'man',
    models: [
      { name: 'TGX' }, { name: 'TGS' }, { name: 'TGM' }, { name: 'TGL' }, { name: 'TGE' },
    ]
  },
  {
    name: 'Scania', slug: 'scania',
    models: [
      { name: 'R' }, { name: 'S' }, { name: 'G' }, { name: 'P' }, { name: 'L' }, { name: 'XT' },
    ]
  },
  {
    name: 'Volvo Trucks', slug: 'volvo-trucks',
    models: [
      { name: 'FH' }, { name: 'FH16' }, { name: 'FM' }, { name: 'FMX' },
      { name: 'FE' }, { name: 'FL' },
    ]
  },
  {
    name: 'DAF', slug: 'daf',
    models: [
      { name: 'XG+' }, { name: 'XG' }, { name: 'XF' }, { name: 'CF' }, { name: 'LF' },
    ]
  },
  {
    name: 'Iveco', slug: 'iveco',
    models: [
      { name: 'S-Way' }, { name: 'X-Way' }, { name: 'Eurocargo' },
      { name: 'Daily' }, { name: 'T-Way' },
    ]
  },
  {
    name: 'Mercedes-Benz', slug: 'mercedes-benz',
    models: [
      { name: 'Actros' }, { name: 'Arocs' }, { name: 'Atego' },
      { name: 'eActros' }, { name: 'Econic' }, { name: 'Unimog' }, { name: 'Zetros' },
    ]
  },
  {
    name: 'Renault Trucks', slug: 'renault-trucks',
    models: [
      { name: 'T' }, { name: 'T High' }, { name: 'C' },
      { name: 'D' }, { name: 'D Wide' }, { name: 'Master' },
    ]
  },
  {
    name: 'Tatra', slug: 'tatra',
    models: [
      { name: 'Phoenix' }, { name: 'Force' }, { name: 'Terra' },
    ]
  },
  {
    name: 'KAMAZ', slug: 'kamaz',
    models: [
      { name: '5490' }, { name: '54901' }, { name: '65115' }, { name: '6520' },
    ]
  },
  {
    name: 'Isuzu', slug: 'isuzu',
    models: [
      { name: 'N-Series' }, { name: 'F-Series' }, { name: 'Forward' }, { name: 'Giga' },
    ]
  },
  {
    name: 'Mitsubishi Fuso', slug: 'mitsubishi-fuso',
    models: [
      { name: 'Canter' }, { name: 'Fighter' }, { name: 'Super Great' },
    ]
  },
  {
    name: 'Hino', slug: 'hino',
    models: [
      { name: '300' }, { name: '500' }, { name: '700' },
    ]
  },
  {
    name: 'Ford Trucks', slug: 'ford-trucks',
    models: [
      { name: 'F-Max' }, { name: 'Cargo' }, { name: 'Transit' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Camper Brands with Models ───────────────────────────────

export const CAMPER_BRANDS: VehicleBrand[] = [
  {
    name: 'Hymer', slug: 'hymer',
    models: [
      { name: 'B-Klasse' }, { name: 'Exsis' }, { name: 'ML-T' },
      { name: 'Free' }, { name: 'Grand Canyon' }, { name: 'DuoMobil' },
    ]
  },
  {
    name: 'Dethleffs', slug: 'dethleffs',
    models: [
      { name: 'Pulse' }, { name: 'Trend' }, { name: 'Esprit' },
      { name: 'Globebus' }, { name: 'Just Go' }, { name: 'Globetrotter' },
    ]
  },
  {
    name: 'B\u00fcrstner', slug: 'burstner',
    models: [
      { name: 'Lyseo' }, { name: 'Ixeo' }, { name: 'Lineo' },
      { name: 'Copa' }, { name: 'Campeo' }, { name: 'Delfin' },
    ]
  },
  {
    name: 'Knaus', slug: 'knaus',
    models: [
      { name: 'BoxStar' }, { name: 'BoxDrive' }, { name: 'Van TI' },
      { name: 'Sky TI' }, { name: 'Live' }, { name: 'Sun TI' },
    ]
  },
  {
    name: 'Adria', slug: 'adria',
    models: [
      { name: 'Twin' }, { name: 'Coral' }, { name: 'Matrix' },
      { name: 'Sonic' }, { name: 'Supersonic' },
      { name: 'Altea' }, { name: 'Adora' }, { name: 'Action' },
    ]
  },
  {
    name: 'Hobby', slug: 'hobby',
    models: [
      { name: 'Vantana' }, { name: 'Optima' }, { name: 'Siesta' },
      { name: 'De Luxe' }, { name: 'Excellent' }, { name: 'Prestige' },
    ]
  },
  {
    name: 'Carthago', slug: 'carthago',
    models: [
      { name: 'Liner' }, { name: 'Chic' }, { name: 'Malibu' },
      { name: 'C-Tourer' }, { name: 'C-Compactline' },
    ]
  },
  {
    name: 'Weinsberg', slug: 'weinsberg',
    models: [
      { name: 'CaraCompact' }, { name: 'CaraBus' }, { name: 'CaraCore' },
      { name: 'CaraHome' }, { name: 'CaraOne' },
    ]
  },
  {
    name: 'Carado', slug: 'carado',
    models: [
      { name: 'V' }, { name: 'T' }, { name: 'I' }, { name: 'CV' }, { name: 'CT' },
    ]
  },
  {
    name: 'Sunlight', slug: 'sunlight',
    models: [
      { name: 'Cliff' }, { name: 'T-Series' }, { name: 'I-Series' }, { name: 'Van' },
    ]
  },
  {
    name: 'LMC', slug: 'lmc',
    models: [
      { name: 'Cruiser' }, { name: 'Explorer' }, { name: 'Innovan' },
      { name: 'Style' }, { name: 'Vivo' },
    ]
  },
  {
    name: 'Eura Mobil', slug: 'eura-mobil',
    models: [
      { name: 'Integra' }, { name: 'Profila' }, { name: 'Van' },
      { name: 'Terrestra' }, { name: 'Activa' },
    ]
  },
  {
    name: 'Fendt', slug: 'fendt',
    models: [
      { name: 'Bianco' }, { name: 'Tendenza' }, { name: 'Diamant' },
      { name: 'Opal' }, { name: 'Saphir' },
    ]
  },
  {
    name: 'Concorde', slug: 'concorde',
    models: [
      { name: 'Liner' }, { name: 'Charisma' }, { name: 'Carver' }, { name: 'Cruiser' },
    ]
  },
  {
    name: 'Pilote', slug: 'pilote',
    models: [
      { name: 'Galaxy' }, { name: 'Pacific' }, { name: 'Van V' }, { name: 'Foxy Van' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Boat Brands with Models ─────────────────────────────────

export const BOAT_BRANDS: VehicleBrand[] = [
  {
    name: 'Bayliner', slug: 'bayliner',
    models: [
      { name: 'VR4' }, { name: 'VR5' }, { name: 'VR6' },
      { name: 'Element' }, { name: 'Trophy' }, { name: 'DX' },
    ]
  },
  {
    name: 'Sea Ray', slug: 'sea-ray',
    models: [
      { name: 'SPX' }, { name: 'SLX' }, { name: 'SDX' },
      { name: 'Sundancer' }, { name: 'Fly' },
    ]
  },
  {
    name: 'Yamaha Marine', slug: 'yamaha-marine',
    models: [
      { name: '190 FSH' }, { name: '195S' }, { name: '210 FSH' },
      { name: 'AR190' }, { name: '242X' },
      { name: 'FX Cruiser' }, { name: 'GP1800' }, { name: 'EX' },
    ]
  },
  {
    name: 'Quicksilver', slug: 'quicksilver',
    models: [
      { name: 'Activ 455' }, { name: 'Activ 505' }, { name: 'Activ 555' },
      { name: 'Activ 605' }, { name: 'Activ 675' },
      { name: 'Captur' }, { name: 'Commander' }, { name: 'Pilothouse' },
    ]
  },
  {
    name: 'Jeanneau', slug: 'jeanneau',
    models: [
      { name: 'Cap Camarat' }, { name: 'Merry Fisher' },
      { name: 'Leader' }, { name: 'Sun Odyssey' },
    ]
  },
  {
    name: 'Bavaria', slug: 'bavaria',
    models: [
      { name: 'Vida' }, { name: 'S-Series' }, { name: 'R40' }, { name: 'Cruiser' },
    ]
  },
  {
    name: 'Beneteau', slug: 'beneteau',
    models: [
      { name: 'Flyer' }, { name: 'Antares' }, { name: 'Gran Turismo' },
      { name: 'Oceanis' }, { name: 'First' },
    ]
  },
  {
    name: 'Zodiac', slug: 'zodiac',
    models: [
      { name: 'Cadet' }, { name: 'Medline' }, { name: 'Open' }, { name: 'Pro' },
    ]
  },
  {
    name: 'Glastron', slug: 'glastron',
    models: [
      { name: 'GT' }, { name: 'GTD' }, { name: 'GX' },
    ]
  },
  {
    name: 'Parker', slug: 'parker',
    models: [
      { name: '550' }, { name: '660' }, { name: '750' },
      { name: '800' }, { name: '850' }, { name: '920' },
    ]
  },
  {
    name: 'Chaparral', slug: 'chaparral',
    models: [
      { name: 'SSi' }, { name: 'Surf' }, { name: 'OSX' },
    ]
  },
  {
    name: 'Four Winns', slug: 'four-winns',
    models: [
      { name: 'HD' }, { name: 'Vista' }, { name: 'Horizon' },
    ]
  },
  {
    name: 'Honda Marine', slug: 'honda-marine',
    models: [
      { name: 'Outboard Motors' },
    ]
  },
  {
    name: 'Suzuki Marine', slug: 'suzuki-marine',
    models: [
      { name: 'Outboard Motors' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── ATV / Quad / UTV Brands with Models ─────────────────────

export const ATV_BRANDS: VehicleBrand[] = [
  {
    name: 'Polaris', slug: 'polaris',
    models: [
      { name: 'Sportsman' }, { name: 'Scrambler' },
      { name: 'RZR' }, { name: 'Ranger' }, { name: 'General' },
    ]
  },
  {
    name: 'Can-Am', slug: 'can-am',
    models: [
      { name: 'Outlander' }, { name: 'Renegade' },
      { name: 'Commander' }, { name: 'Maverick' }, { name: 'Defender' },
    ]
  },
  {
    name: 'CF Moto', slug: 'cf-moto',
    models: [
      { name: 'CForce' }, { name: 'ZForce' }, { name: 'UForce' },
    ]
  },
  {
    name: 'Yamaha', slug: 'yamaha',
    models: [
      { name: 'Grizzly' }, { name: 'Kodiak' }, { name: 'YXZ1000R' },
      { name: 'Wolverine' }, { name: 'Viking' },
    ]
  },
  {
    name: 'Honda', slug: 'honda',
    models: [
      { name: 'TRX250' }, { name: 'TRX420' }, { name: 'TRX520' },
      { name: 'Pioneer' }, { name: 'Talon' },
    ]
  },
  {
    name: 'Suzuki', slug: 'suzuki',
    models: [
      { name: 'KingQuad' }, { name: 'LT-Z90' }, { name: 'QuadSport Z400' },
    ]
  },
  {
    name: 'Kawasaki', slug: 'kawasaki',
    models: [
      { name: 'Brute Force' }, { name: 'KFX' }, { name: 'Mule' },
      { name: 'Teryx' }, { name: 'Ridge' },
    ]
  },
  {
    name: 'Arctic Cat', slug: 'arctic-cat',
    models: [
      { name: 'Alterra' }, { name: 'Prowler Pro' }, { name: 'Wildcat XX' },
    ]
  },
  {
    name: 'TGB', slug: 'tgb',
    models: [
      { name: 'Blade' }, { name: 'Target' }, { name: 'Gunner' },
    ]
  },
  {
    name: 'Kymco', slug: 'kymco',
    models: [
      { name: 'MXU' }, { name: 'UXV' },
    ]
  },
  {
    name: 'Linhai', slug: 'linhai',
    models: [
      { name: 'M550' }, { name: 'M750' }, { name: 'T-Boss' },
    ]
  },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Unified Vehicle Brand Registry ──────────────────────────

const VEHICLE_BRAND_REGISTRY: Record<VehicleType, VehicleBrand[]> = {
  car: CAR_BRANDS_WITH_MODELS,
  motorcycle: MOTORCYCLE_BRANDS,
  bicycle: BICYCLE_BRANDS,
  truck: TRUCK_BRANDS,
  camper: CAMPER_BRANDS,
  boat: BOAT_BRANDS,
  atv: ATV_BRANDS,
  parts: CAR_BRANDS_WITH_MODELS,
};

// ── Helper Functions (new, type-aware) ──────────────────────

export function getBrandsForVehicleType(type: VehicleType): VehicleBrand[] {
  return VEHICLE_BRAND_REGISTRY[type] ?? CAR_BRANDS_WITH_MODELS;
}

export function findBrandModelsForType(brand: string, type: VehicleType): VehicleModel[] {
  const brands = VEHICLE_BRAND_REGISTRY[type] ?? CAR_BRANDS_WITH_MODELS;
  const found = brands.find(b => b.name.toLowerCase() === brand.toLowerCase());
  return found?.models || [];
}

export function findModelVariantsForType(brand: string, model: string, type: VehicleType): string[] {
  const models = findBrandModelsForType(brand, type);
  const found = models.find(m => m.name.toLowerCase() === model.toLowerCase());
  return found?.variants || [];
}

// ── Backward-compatible Helper Functions ────────────────────

export function findBrandModels(brand: string, isMotorcycle: boolean): VehicleModel[] {
  return findBrandModelsForType(brand, isMotorcycle ? 'motorcycle' : 'car');
}

export function findModelVariants(brand: string, model: string, isMotorcycle: boolean): string[] {
  return findModelVariantsForType(brand, model, isMotorcycle ? 'motorcycle' : 'car');
}
