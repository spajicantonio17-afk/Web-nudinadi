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
    name: 'Citroën', slug: 'citroen',
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
    name: 'Škoda', slug: 'skoda',
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
  // Remaining brands from CAR_BRANDS with empty models (user can type manually)
  { name: 'Porsche', slug: 'porsche', models: [] },
  { name: 'Smart', slug: 'smart', models: [] },
  { name: 'Alpine', slug: 'alpine', models: [] },
  { name: 'DS', slug: 'ds', models: [] },
  { name: 'Alfa Romeo', slug: 'alfa-romeo', models: [] },
  { name: 'Maserati', slug: 'maserati', models: [] },
  { name: 'Ferrari', slug: 'ferrari', models: [] },
  { name: 'Lamborghini', slug: 'lamborghini', models: [] },
  { name: 'Mitsubishi', slug: 'mitsubishi', models: [] },
  { name: 'Subaru', slug: 'subaru', models: [] },
  { name: 'Lexus', slug: 'lexus', models: [] },
  { name: 'Infiniti', slug: 'infiniti', models: [] },
  { name: 'SsangYong', slug: 'ssangyong', models: [] },
  { name: 'Saab', slug: 'saab', models: [] },
  { name: 'Jaguar', slug: 'jaguar', models: [] },
  { name: 'Bentley', slug: 'bentley', models: [] },
  { name: 'Rolls-Royce', slug: 'rolls-royce', models: [] },
  { name: 'Aston Martin', slug: 'aston-martin', models: [] },
  { name: 'McLaren', slug: 'mclaren', models: [] },
  { name: 'Lotus', slug: 'lotus', models: [] },
  { name: 'MINI', slug: 'mini', models: [] },
  { name: 'Chrysler', slug: 'chrysler', models: [] },
  { name: 'Dodge', slug: 'dodge', models: [] },
  { name: 'Chevrolet', slug: 'chevrolet', models: [] },
  { name: 'Cadillac', slug: 'cadillac', models: [] },
  { name: 'Lincoln', slug: 'lincoln', models: [] },
  { name: 'GMC', slug: 'gmc', models: [] },
  { name: 'RAM', slug: 'ram', models: [] },
  { name: 'BYD', slug: 'byd', models: [] },
  { name: 'NIO', slug: 'nio', models: [] },
  { name: 'Geely', slug: 'geely', models: [] },
  { name: 'MG', slug: 'mg', models: [] },
  { name: 'Great Wall', slug: 'great-wall', models: [] },
  { name: 'Chery', slug: 'chery', models: [] },
  { name: 'Tata', slug: 'tata', models: [] },
  { name: 'Mahindra', slug: 'mahindra', models: [] },
  { name: 'Rimac', slug: 'rimac', models: [] },
  { name: 'Zastava', slug: 'zastava', models: [] },
  { name: 'Yugo', slug: '', models: [] },
  { name: 'Lada', slug: 'lada', models: [] },
  { name: 'Ostalo', slug: '', models: [] },
];

// ── Motorrad-Marken mit Modellen ─────────────────────────────

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
      { name: 'Ténéré 700' }, { name: 'XSR 700' }, { name: 'XSR 900' },
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

// ── Helper: Find brand models ────────────────────────────────

export function findBrandModels(brandName: string, isMotorcycle: boolean): VehicleModel[] {
  const brands = isMotorcycle ? MOTORCYCLE_BRANDS : CAR_BRANDS_WITH_MODELS;
  const brand = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
  return brand?.models || [];
}

export function findModelVariants(brandName: string, modelName: string, isMotorcycle: boolean): string[] {
  const models = findBrandModels(brandName, isMotorcycle);
  const model = models.find(m => m.name.toLowerCase() === modelName.toLowerCase());
  return model?.variants || [];
}
