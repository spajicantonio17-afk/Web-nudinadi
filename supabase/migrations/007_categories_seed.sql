-- =============================================
-- NudiNađi - Migration 007: Categories Seed
-- Kompletna struktura kategorija v2.0
-- =============================================
-- Izvršiti u Supabase SQL Editor
-- NAPOMENA: Briše sve postojeće kategorije i umetne nove!

-- Očisti postojeće kategorije
TRUNCATE TABLE categories CASCADE;

-- ─── LEVEL 1: Glavne kategorije ───────────────────────────
INSERT INTO categories (slug, name, icon, parent_category_id) VALUES
  ('vozila',      'Vozila',                      'fa-car',       NULL),
  ('dijelovi',    'Dijelovi za automobile',        'fa-gears',     NULL),
  ('nekretnine',  'Nekretnine',                  'fa-building',  NULL),
  ('mobiteli',    'Mobiteli i oprema',            'fa-mobile-screen', NULL),
  ('racunala',    'Računala i IT',               'fa-laptop',    NULL),
  ('tehnika',     'Tehnika i elektronika',        'fa-tv',        NULL),
  ('dom',         'Dom i vrtne garniture',        'fa-house',     NULL),
  ('odjeca',      'Odjeća i obuća',              'fa-shirt',     NULL),
  ('sport',       'Sport i rekreacija',           'fa-dumbbell',  NULL),
  ('djeca',       'Djeca i bebe',                'fa-baby',      NULL),
  ('glazba',      'Glazba i glazbeni instrumenti','fa-music',     NULL),
  ('literatura',  'Literatura i mediji',          'fa-book',      NULL),
  ('videoigre',   'Videoigre',                   'fa-gamepad',   NULL),
  ('zivotinje',   'Životinje',                   'fa-paw',       NULL),
  ('hrana',       'Hrana i piće',                'fa-utensils',  NULL),
  ('strojevi',    'Strojevi i alati',            'fa-wrench',    NULL),
  ('poslovi',     'Poslovi',                     'fa-briefcase', NULL),
  ('usluge',      'Usluge',                      'fa-handshake', NULL),
  ('umjetnost',   'Umjetnost i kolekcionarstvo', 'fa-palette',   NULL),
  ('ostalo',      'Ostalo',                      'fa-ellipsis',  NULL);


-- ─── LEVEL 2 + 3: Podkategorije ──────────────────────────
-- Koristimo funkciju koja dohvaća parent_id po slugu

-- ════════════════════════════════════════════════
-- 1. VOZILA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'vozila';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-osobni-automobili',      'Osobni automobili',       pid),
    ('vozila-motocikli-i-skuteri',    'Motocikli i skuteri',     pid),
    ('vozila-teretna-vozila',         'Teretna vozila',          pid),
    ('vozila-autobusi-i-minibusi',    'Autobusi i minibusi',     pid),
    ('vozila-bicikli',                'Bicikli',                 pid),
    ('vozila-kamperi',                'Kamperi i kamp prikolice',pid),
    ('vozila-prikolice',              'Prikolice',               pid),
    ('vozila-nautika',                'Nautika i plovila',       pid),
    ('vozila-atv-quad-utv',           'ATV / Quad / UTV',        pid),
    ('vozila-ostala-vozila',          'Ostala vozila',           pid);

  -- Osobni automobili items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-osobni-automobili';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-osobni-novi',            'Novi automobili (od autokuće)',           pid),
    ('vozila-osobni-rabljeni',        'Polovni automobili',                     pid),
    ('vozila-osobni-s-jamstvom',      'Automobili s garancijom',                pid),
    ('vozila-osobni-oldtimeri',       'Oldtimeri',                              pid),
    ('vozila-osobni-karambolirani',   'Karambolirani i neispravni automobili',  pid),
    ('vozila-osobni-elektricni',      'Električni automobili',                  pid),
    ('vozila-osobni-hibridni',        'Hibridni automobili',                    pid);

  -- Motocikli items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-motocikli-i-skuteri';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-moto-sport',             'Sport motocikli',                         pid),
    ('vozila-moto-cruiser',           'Cruiser / chopper',                       pid),
    ('vozila-moto-enduro',            'Enduro i cross',                          pid),
    ('vozila-moto-naked',             'Naked / streetfighter',                   pid),
    ('vozila-moto-skuteri',           'Skuteri i mopedi',                        pid),
    ('vozila-moto-elektricni',        'Električni motocikli i skuteri',          pid),
    ('vozila-moto-tricikli',          'Tricikli i quadricikli',                  pid);

  -- Teretna vozila items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-teretna-vozila';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-teretna-kombiji',        'Kombiji i dostavna vozila (do 3.5t)',     pid),
    ('vozila-teretna-kamioni',        'Kamioni (3.5t – 7.5t)',                   pid),
    ('vozila-teretna-teski',          'Teški kamioni (7.5t+)',                   pid),
    ('vozila-teretna-hladnjace',      'Hladnjače',                              pid),
    ('vozila-teretna-kiperi',         'Kiperi i kiper prikolice',                pid),
    ('vozila-teretna-cistijerne',     'Cisterne',                                pid),
    ('vozila-teretna-tegljaci',       'Tegljači i vučna vozila',                pid);

  -- Autobusi items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-autobusi-i-minibusi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-bus-mini',               'Minibusi (do 20 mjesta)',                 pid),
    ('vozila-bus-gradski',            'Gradski autobusi',                        pid),
    ('vozila-bus-turisticki',         'Turistički autobusi',                    pid),
    ('vozila-bus-skolski',            'Školski autobusi',                       pid);

  -- Bicikli items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-bicikli';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-bicikl-mtb',             'MTB / Mountain bike',                     pid),
    ('vozila-bicikl-trekking',        'Trekking i city bicikli',                 pid),
    ('vozila-bicikl-cestovni',        'Cestovni (road) bicikli',                 pid),
    ('vozila-bicikl-elektricni',      'Električni bicikli (e-bike)',             pid),
    ('vozila-bicikl-djecji',          'Dječji bicikli',                         pid),
    ('vozila-bicikl-bmx',             'BMX',                                     pid),
    ('vozila-bicikl-gravel',          'Gravel bicikli',                          pid),
    ('vozila-bicikl-sklopivi',        'Sklopivi bicikli',                        pid);

  -- Nautika items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-nautika';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-naut-camci-motor',       'Čamci na motor',                         pid),
    ('vozila-naut-jedrilice',         'Jedrilice',                               pid),
    ('vozila-naut-gumenjaci',         'Gumenjaci i RIB čamci',                  pid),
    ('vozila-naut-jetski',            'Jet ski i vodeni skuteri',                pid),
    ('vozila-naut-kajaci',            'Kajaci i kanui',                          pid),
    ('vozila-naut-sup',               'SUP daske',                               pid),
    ('vozila-naut-jahte',             'Jahte',                                   pid),
    ('vozila-naut-ribarski',          'Ribarski čamci',                         pid),
    ('vozila-naut-brodovi',           'Brodovi',                                 pid);

  -- Ostala vozila items
  SELECT id INTO pid FROM categories WHERE slug = 'vozila-ostala-vozila';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vozila-ostala-traktori',        'Traktori (cestovni)',                     pid),
    ('vozila-ostala-golf',            'Kolica za golf',                          pid),
    ('vozila-ostala-segway',          'Segway i električni romobili za odrasle', pid);
END $$;


-- ════════════════════════════════════════════════
-- 2. DIJELOVI ZA VOZILA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'dijelovi';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('dij-auto-motor',       'Za automobile – Motor i mjenjač',        pid),
    ('dij-auto-elektrika',   'Za automobile – Elektrika i elektronika', pid),
    ('dij-auto-karoserija',  'Za automobile – Karoserija i stakla',     pid),
    ('dij-auto-unutrasnjost','Za automobile – Unutrašnjost i sjedala',  pid),
    ('dij-auto-ovjes',       'Za automobile – Ovjes i kočnice',        pid),
    ('dij-auto-felge',       'Za automobile – Felge i gume',            pid),
    ('dij-auto-tuning',      'Za automobile – Tuning i oprema',         pid),
    ('dij-auto-akustika',    'Za automobile – Navigacija i auto akustika', pid),
    ('dij-auto-ulja',        'Za automobile – Kozmetika i ulja',        pid),
    ('dij-moto-motor',       'Za motocikle – Motor i transmisija',      pid),
    ('dij-moto-karoserija',  'Za motocikle – Karoserija i oklopi',      pid),
    ('dij-moto-elektrika',   'Za motocikle – Elektrika i paljenje',     pid),
    ('dij-moto-ovjes',       'Za motocikle – Ovjes i kočnice',         pid),
    ('dij-moto-felge',       'Za motocikle – Felge i gume',             pid),
    ('dij-moto-oprema',      'Za motocikle – Zaštitna oprema i odjeća', pid),
    ('dij-moto-kofera',      'Za motocikle – Koferi, torbe i nosači',   pid),
    ('dij-bic-dijelovi',     'Za bicikle – Dijelovi',                   pid),
    ('dij-teretna',          'Za teretna vozila',                       pid),
    ('dij-autobusi',         'Za autobuse i minibuse',                  pid),
    ('dij-nautika',          'Za nautiku i plovila',                    pid),
    ('dij-kamperi',          'Za kampere i prikolice',                  pid),
    ('dij-atv',              'Za ATV / Quad',                           pid),
    ('dij-gradev-strojevi',  'Za građevinske strojeve',                 pid),
    ('dij-prikolice',        'Za prikolice (dijelovi)',                  pid),
    ('dij-ostalo',           'Ostali dijelovi za vozila',               pid);
END $$;


-- ════════════════════════════════════════════════
-- 3. NEKRETNINE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'nekretnine';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-stanovi',          'Stanovi',                   pid),
    ('nekr-kuce',             'Kuće',                      pid),
    ('nekr-zemljista',        'Zemljišta',                 pid),
    ('nekr-poslovni',         'Poslovni prostori',          pid),
    ('nekr-garaze',           'Garaže i parkirna mjesta',  pid),
    ('nekr-turisticki',       'Turistički smještaj',       pid),
    ('nekr-luksuzne',         'Luksuzne nekretnine',        pid),
    ('nekr-ostale',           'Ostale nekretnine',          pid);

  -- Stanovi
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-stanovi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-stan-prodaja',     'Prodaja stanova',             pid),
    ('nekr-stan-najam',       'Najam stanova (dugoročni)',   pid),
    ('nekr-stan-dan',         'Stan na dan (kratkoročni)',   pid),
    ('nekr-stan-novogradnja', 'Stanovi – novogradnja',       pid),
    ('nekr-stan-luksuzni',    'Luksuzni stanovi',            pid);

  -- Kuće
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-kuce';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-kuca-prodaja',     'Prodaja kuća',               pid),
    ('nekr-kuca-najam',       'Najam kuća',                 pid),
    ('nekr-kuca-vikendice',   'Vikendice i seoske kuće',    pid),
    ('nekr-kuca-montazne',    'Montažne kuće i objekti',    pid);

  -- Zemljišta
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-zemljista';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-zeml-gradev',      'Građevinsko zemljište',       pid),
    ('nekr-zeml-poljopriv',   'Poljoprivredno zemljište',    pid),
    ('nekr-zeml-sumsko',      'Šumsko zemljište',            pid),
    ('nekr-zeml-ostalo',      'Ostalo zemljište',            pid);

  -- Poslovni prostori
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-poslovni';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-posl-prodaja',     'Prodaja poslovnih prostora',  pid),
    ('nekr-posl-najam',       'Najam poslovnih prostora',    pid),
    ('nekr-posl-uredi',       'Uredi',                       pid),
    ('nekr-posl-skladista',   'Skladišta i hale',           pid),
    ('nekr-posl-ugostiteljski','Ugostiteljski prostori',     pid),
    ('nekr-posl-industrijski','Industrijski objekti',        pid);

  -- Garaže
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-garaze';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-gar-prodaja',      'Prodaja garaža',              pid),
    ('nekr-gar-najam',        'Najam garaža',                pid),
    ('nekr-gar-parking',      'Parkirna mjesta',             pid);

  -- Turistički smještaj
  SELECT id INTO pid FROM categories WHERE slug = 'nekr-turisticki';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('nekr-tur-apartmani',    'Apartmani na dan',            pid),
    ('nekr-tur-kuce-odmor',   'Kuće za odmor',              pid),
    ('nekr-tur-sobe',         'Sobe na dan',                 pid),
    ('nekr-tur-hosteli',      'Hosteli',                     pid);
END $$;


-- ════════════════════════════════════════════════
-- 4. MOBITELI I OPREMA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'mobiteli';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('mob-iphone',            'Mobiteli – Apple iPhone',            pid),
    ('mob-samsung',           'Mobiteli – Samsung',                 pid),
    ('mob-xiaomi',            'Mobiteli – Xiaomi / Redmi / POCO',   pid),
    ('mob-huawei',            'Mobiteli – Huawei / Honor',          pid),
    ('mob-oneplus',           'Mobiteli – OnePlus / Oppo / Realme', pid),
    ('mob-nokia',             'Mobiteli – Nokia / Motorola / Sony', pid),
    ('mob-ostale',            'Mobiteli – Ostale marke',            pid),
    ('mob-tableti',           'Tableti',                            pid),
    ('mob-pametni-satovi',    'Pametni satovi i fitness narukvice', pid),
    ('mob-slusalice',         'Slušalice i Bluetooth zvučnici',     pid),
    ('mob-punjaci',           'Punjači, powerbanke i kabeli',       pid),
    ('mob-maske',             'Maske, stakla i zaštitne folije',    pid),
    ('mob-dijelovi',          'Dijelovi mobitela (ekrani, baterije...)', pid),
    ('mob-ostalo',            'Ostala mobilna oprema',              pid);

  SELECT id INTO pid FROM categories WHERE slug = 'mob-iphone';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('mob-iphone-16',         'iPhone 16 serija',  pid),
    ('mob-iphone-15',         'iPhone 15 serija',  pid),
    ('mob-iphone-14',         'iPhone 14 serija',  pid),
    ('mob-iphone-13',         'iPhone 13 serija',  pid),
    ('mob-iphone-12-stariji', 'iPhone 12 i stariji', pid);

  SELECT id INTO pid FROM categories WHERE slug = 'mob-samsung';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('mob-sam-s',             'Galaxy S serija',   pid),
    ('mob-sam-a',             'Galaxy A serija',   pid),
    ('mob-sam-fold',          'Galaxy Z Fold/Flip',pid),
    ('mob-sam-ostali',        'Ostali Samsung',    pid);

  SELECT id INTO pid FROM categories WHERE slug = 'mob-tableti';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('mob-tab-ipad',          'Apple iPad',        pid),
    ('mob-tab-samsung',       'Samsung Galaxy Tab',pid),
    ('mob-tab-huawei',        'Huawei MatePad',    pid),
    ('mob-tab-ostali',        'Ostali tableti',    pid);

  SELECT id INTO pid FROM categories WHERE slug = 'mob-slusalice';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('mob-sl-inear',          'In-ear slušalice',         pid),
    ('mob-sl-overear',        'Over-ear slušalice',       pid),
    ('mob-sl-bt',             'Bluetooth zvučnici',       pid),
    ('mob-sl-gaming',         'Gaming headset',           pid);
END $$;


-- ════════════════════════════════════════════════
-- 5. RAČUNALA I IT
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'racunala';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('rac-laptopi',           'Laptopi',              pid),
    ('rac-desktop',           'Desktop računala',     pid),
    ('rac-monitori',          'Monitori',             pid),
    ('rac-komponente',        'Komponente',           pid),
    ('rac-mrezna',            'Mrežna oprema',        pid),
    ('rac-printeri',          'Printeri i skeneri',   pid),
    ('rac-serveri',           'Serveri',              pid),
    ('rac-softver',           'Softver i licence',    pid),
    ('rac-gaming',            'Gaming i konzole',     pid),
    ('rac-dronovi',           'Dronovi i oprema',     pid),
    ('rac-ostalo',            'Ostala IT oprema',     pid);

  SELECT id INTO pid FROM categories WHERE slug = 'rac-laptopi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('rac-lap-macbook',       'Apple MacBook',                    pid),
    ('rac-lap-dell-hp',       'Dell / HP / Lenovo',               pid),
    ('rac-lap-asus',          'Asus / Acer / MSI',                pid),
    ('rac-lap-gaming',        'Gaming laptopi',                   pid),
    ('rac-lap-poslovni',      'Poslovni laptopi',                 pid),
    ('rac-lap-osteceni',      'Oštećeni laptopi (za dijelove)',   pid),
    ('rac-lap-dijelovi',      'Dijelovi laptopa',                 pid);

  SELECT id INTO pid FROM categories WHERE slug = 'rac-komponente';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('rac-komp-cpu',          'Procesori (CPU)',                  pid),
    ('rac-komp-gpu',          'Grafičke kartice (GPU)',           pid),
    ('rac-komp-ram',          'RAM memorija',                    pid),
    ('rac-komp-mb',           'Matične ploče',                   pid),
    ('rac-komp-ssd',          'SSD diskovi',                     pid),
    ('rac-komp-hdd',          'HDD diskovi',                     pid),
    ('rac-komp-psu',          'Napajanja (PSU)',                  pid),
    ('rac-komp-kucista',      'Kućišta',                         pid),
    ('rac-komp-hladnjaci',    'CPU hladnjaci i vodeno hlađenje', pid),
    ('rac-komp-opticki',      'Optički uređaji',                 pid);

  SELECT id INTO pid FROM categories WHERE slug = 'rac-gaming';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('rac-gam-ps5',           'PlayStation 5',                   pid),
    ('rac-gam-ps4',           'PlayStation 4 i stariji',         pid),
    ('rac-gam-xbox',          'Xbox Series X/S',                 pid),
    ('rac-gam-nintendo',      'Nintendo Switch',                 pid),
    ('rac-gam-pc',            'PC igre (fizičke i ključevi)',    pid),
    ('rac-gam-retro',         'Retro konzole',                   pid),
    ('rac-gam-oprema',        'Gaming oprema (miševi, tipkovnice, podloge, gamepadovi)', pid),
    ('rac-gam-vr',            'VR naočale i oprema',             pid);

  SELECT id INTO pid FROM categories WHERE slug = 'rac-dronovi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('rac-dr-dji',            'DJI dronovi',                     pid),
    ('rac-dr-ostali',         'Ostali dronovi',                  pid),
    ('rac-dr-dijelovi',       'Dijelovi i baterije za dronove',  pid),
    ('rac-dr-fpv',            'FPV dronovi',                     pid);
END $$;


-- ════════════════════════════════════════════════
-- 6. TEHNIKA I ELEKTRONIKA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'tehnika';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('teh-televizori',        'Televizori',                      pid),
    ('teh-audio',             'Audio oprema',                    pid),
    ('teh-foto-video',        'Foto i video oprema',             pid),
    ('teh-bijela',            'Bijela tehnika',                  pid),
    ('teh-mali-aparati',      'Mali kućanski aparati',           pid),
    ('teh-smart-home',        'Smart home i IoT',                pid),
    ('teh-solarna',           'Solarna i alternativna energija', pid),
    ('teh-medicinska',        'Medicinska oprema',               pid),
    ('teh-ostala',            'Ostala tehnika',                  pid);

  SELECT id INTO pid FROM categories WHERE slug = 'teh-televizori';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('teh-tv-oled',           'OLED TV',                        pid),
    ('teh-tv-qled',           'QLED / LED TV',                  pid),
    ('teh-tv-smart',          'Smart TV',                       pid),
    ('teh-tv-projektori',     'Projektori',                     pid),
    ('teh-tv-stalci',         'TV stalci i nosači',             pid),
    ('teh-tv-dijelovi',       'Dijelovi za TV',                 pid);

  SELECT id INTO pid FROM categories WHERE slug = 'teh-bijela';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('teh-bij-hladnjaci',     'Hladnjaci i zamrzivači',         pid),
    ('teh-bij-perilice-r',    'Perilice rublja',                pid),
    ('teh-bij-perilice-p',    'Perilice posuđa',                pid),
    ('teh-bij-susilice',      'Sušilice rublja',                pid),
    ('teh-bij-stednjaci',     'Štednjaci i ploče za kuhanje',   pid),
    ('teh-bij-pecnice',       'Pećnice',                        pid),
    ('teh-bij-mikrovalne',    'Mikrovalne pećnice',             pid),
    ('teh-bij-klima',         'Aparati za klimu (split sustav)',pid),
    ('teh-bij-ostala',        'Ostala bijela tehnika',          pid);
END $$;


-- ════════════════════════════════════════════════
-- 7. DOM I VRTNI
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'dom';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('dom-nj-dnevna',         'Namještaj – Dnevna soba',         pid),
    ('dom-nj-spavaca',        'Namještaj – Spavaća soba',        pid),
    ('dom-nj-kuhinja',        'Namještaj – Kuhinja i blagovaonica', pid),
    ('dom-nj-djecja',         'Namještaj – Dječja soba',         pid),
    ('dom-nj-radna',          'Namještaj – Radna soba i ured',   pid),
    ('dom-nj-kupaonica',      'Namještaj – Kupaonica',           pid),
    ('dom-rasvjeta',          'Rasvjeta',                        pid),
    ('dom-tekstil',           'Tepisi, zavjese i tekstil',       pid),
    ('dom-dekoracije',        'Dekoracije i ukrasi',             pid),
    ('dom-grijanje',          'Grijanje i hlađenje',             pid),
    ('dom-vrt',               'Vrt i balkon',                    pid),
    ('dom-bazeni',            'Bazeni, jacuzzi i saune',         pid),
    ('dom-sigurnost',         'Sigurnosni sustavi',              pid),
    ('dom-vodoinstalacije',   'Vodoinstalacije i sanitarije',    pid),
    ('dom-alati',             'Alati i pribor za dom',           pid),
    ('dom-ostalo',            'Ostalo za dom',                   pid);

  SELECT id INTO pid FROM categories WHERE slug = 'dom-nj-dnevna';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('dom-dnev-sofe',         'Sofe i garniture',                pid),
    ('dom-dnev-fotelje',      'Fotelje',                         pid),
    ('dom-dnev-stolovi',      'Stolovi za dnevnu sobu',          pid),
    ('dom-dnev-tv-komode',    'TV komode i police',              pid),
    ('dom-dnev-police',       'Police i regali',                 pid),
    ('dom-dnev-vitrine',      'Vitrine',                         pid);

  SELECT id INTO pid FROM categories WHERE slug = 'dom-vrt';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('dom-vrt-namjestaj',     'Vrtni namještaj (garniture, stolice, stolovi)', pid),
    ('dom-vrt-ljulj',         'Vrtne ljuljačke i hamaci',                     pid),
    ('dom-vrt-rostilji',      'Vrtni roštilji i pizze pećnice',               pid),
    ('dom-vrt-fontane',       'Vrtne fontane',                                pid),
    ('dom-vrt-biljke',        'Biljke i cvijeće',                             pid),
    ('dom-vrt-sjemenke',      'Sjemenke i luk',                               pid),
    ('dom-vrt-zemlja',        'Zemlja i gnojiva',                             pid),
    ('dom-vrt-alati',         'Vrtni alati (lopate, grablje, škare...)',      pid),
    ('dom-vrt-prskalice',     'Prskalice i natapanje',                        pid),
    ('dom-vrt-saksije',       'Saksije i posude',                             pid),
    ('dom-vrt-tende',         'Balkoni zasloni i tende',                      pid);
END $$;


-- ════════════════════════════════════════════════
-- 8. ODJEĆA I OBUĆA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'odjeca';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('odj-zenska-odjeca',     'Ženska odjeća',                  pid),
    ('odj-zenska-obuca',      'Ženska obuća',                   pid),
    ('odj-muska-odjeca',      'Muška odjeća',                   pid),
    ('odj-muska-obuca',       'Muška obuća',                    pid),
    ('odj-djecja',            'Dječja odjeća i obuća',          pid),
    ('odj-sportska',          'Sportska odjeća i obuća (svi)',  pid),
    ('odj-nakit',             'Nakit i satovi',                 pid),
    ('odj-torbe',             'Torbe, novčanici i ruksaci',     pid),
    ('odj-naocale',           'Naočale',                        pid),
    ('odj-radna',             'Radna i zaštitna odjeća',        pid),
    ('odj-maskare',           'Maškare i kostimi',              pid),
    ('odj-ostalo',            'Ostala odjeća i dodaci',         pid);

  SELECT id INTO pid FROM categories WHERE slug = 'odj-zenska-odjeca';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('odj-z-jakne',           'Jakne, kaputi i prsluk',         pid),
    ('odj-z-haljine',         'Haljine',                        pid),
    ('odj-z-suknje',          'Suknje',                         pid),
    ('odj-z-hlace',           'Hlače i traperice',              pid),
    ('odj-z-majice',          'Majice i bluze',                 pid),
    ('odj-z-dzemperi',        'Džemperi i kardigani',           pid),
    ('odj-z-sportska',        'Sportska odjeća',                pid),
    ('odj-z-plaza',           'Odjeća za plažu',                pid),
    ('odj-z-donje',           'Donje rublje i pidžame',         pid),
    ('odj-z-trudnice',        'Odjeća za trudnice',             pid);

  SELECT id INTO pid FROM categories WHERE slug = 'odj-nakit';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('odj-nak-prstenje',      'Prstenje',                       pid),
    ('odj-nak-narukvice',     'Narukvice',                      pid),
    ('odj-nak-ogrlice',       'Ogrlice i privjesci',            pid),
    ('odj-nak-nausnice',      'Naušnice',                       pid),
    ('odj-nak-sat-muski',     'Ručni satovi – muški',           pid),
    ('odj-nak-sat-zenski',    'Ručni satovi – ženski',          pid),
    ('odj-nak-zlatni',        'Zlatni i srebrni nakit',         pid),
    ('odj-nak-modni',         'Modni (bijuteri) nakit',         pid);
END $$;


-- ════════════════════════════════════════════════
-- 9. SPORT I REKREACIJA
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'sport';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('spt-fitness',           'Fitness i teretana',                    pid),
    ('spt-biciklizam',        'Biciklizam (oprema)',                   pid),
    ('spt-nogomet',           'Nogomet',                              pid),
    ('spt-timski',            'Košarka, rukomet i ostali timski sportovi', pid),
    ('spt-tenis',             'Tenis i badminton',                    pid),
    ('spt-zimski',            'Zimski sportovi',                      pid),
    ('spt-vodeni',            'Vodeni sportovi',                      pid),
    ('spt-planinarenje',      'Planinarenje i kampiranje',            pid),
    ('spt-ribolov',           'Ribolov',                              pid),
    ('spt-borilacki',         'Borilački sportovi',                   pid),
    ('spt-golf',              'Golf',                                 pid),
    ('spt-airsoft',           'Airsoft i paintball',                  pid),
    ('spt-koturaljke',        'Koturaljke, skateboard i romobili',    pid),
    ('spt-dresovi',           'Sportski dresovi (kolekcija)',         pid),
    ('spt-ostalo',            'Ostala sportska oprema',               pid);

  SELECT id INTO pid FROM categories WHERE slug = 'spt-fitness';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('spt-fit-bucice',        'Bučice i utezi',                        pid),
    ('spt-fit-klupe',         'Klupe za vježbanje',                   pid),
    ('spt-fit-sprave',        'Višefunkcionalne sprave',              pid),
    ('spt-fit-trake',         'Trake za trčanje i bicikl ergometar',  pid),
    ('spt-fit-crosstrainer',  'Crosstraineri i veslači',              pid),
    ('spt-fit-yoga',          'Yoga i pilates oprema',                pid),
    ('spt-fit-crossfit',      'Skakanje i crossfit oprema',           pid),
    ('spt-fit-rukavice',      'Rukavice i pojas za trening',          pid),
    ('spt-fit-suplementi',    'Dodaci prehrani (proteini, kreatin...)',pid);

  SELECT id INTO pid FROM categories WHERE slug = 'spt-zimski';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('spt-zim-skije',         'Skije kompletan set',                  pid),
    ('spt-zim-snowboard',     'Snowboard kompletan set',              pid),
    ('spt-zim-kaciga',        'Skijaška kaciga i naočale',           pid),
    ('spt-zim-odjeca',        'Skijaška odjeća i rukavice',          pid),
    ('spt-zim-obuca',         'Skijaška obuća',                      pid),
    ('spt-zim-klizaljke',     'Klizaljke',                           pid),
    ('spt-zim-sanjke',        'Sanjke',                              pid);

  SELECT id INTO pid FROM categories WHERE slug = 'spt-ribolov';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('spt-rib-stapovi',       'Štapovi',                             pid),
    ('spt-rib-masinice',      'Mašinice i koluti',                   pid),
    ('spt-rib-varalice',      'Varalice i mamci',                    pid),
    ('spt-rib-kutije',        'Kutije i torbe za ribolov',           pid),
    ('spt-rib-camci',         'Čamci za ribolov',                    pid),
    ('spt-rib-odjeca',        'Odjeća i čizme za ribolov',          pid),
    ('spt-rib-ehosonde',      'Ehosonde',                            pid);
END $$;


-- ════════════════════════════════════════════════
-- 10. DJECA I BEBE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'djeca';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('djc-oprema-bebe',       'Oprema za bebe',                           pid),
    ('djc-igracke',           'Dječje igračke',                          pid),
    ('djc-bicikli',           'Dječji bicikli, romobili i automobili',   pid),
    ('djc-odjeca',            'Dječja odjeća (0–14 god)',                pid),
    ('djc-knjige',            'Dječje knjige i edukacija',               pid),
    ('djc-ostalo',            'Ostalo za djecu',                         pid);

  SELECT id INTO pid FROM categories WHERE slug = 'djc-oprema-bebe';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('djc-bebe-kolica',       'Kolica i nosiljke',                       pid),
    ('djc-bebe-sjedalice',    'Auto sjedalice',                          pid),
    ('djc-bebe-kreveti',      'Krevetići, posteljina i madraci',        pid),
    ('djc-bebe-hranilice',    'Hranilice, boce i njega',                pid),
    ('djc-bebe-kupaonice',    'Kupaonice i presvlačišta',               pid),
    ('djc-bebe-hodalice',     'Hodalice i ljuljačke',                   pid);

  SELECT id INTO pid FROM categories WHERE slug = 'djc-igracke';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('djc-igr-lego',          'LEGO i konstruktori',                     pid),
    ('djc-igr-plusane',       'Plišane igračke',                        pid),
    ('djc-igr-figurice',      'Figurice, lutke i akcijske figure',      pid),
    ('djc-igr-rc',            'Na daljinski (RC)',                       pid),
    ('djc-igr-trampoline',    'Trampoline, tobogani i ljuljačke',       pid),
    ('djc-igr-kuhinje',       'Kuhinje i roleplay igračke',             pid),
    ('djc-igr-puzzle',        'Slagalice i puzzle',                     pid);
END $$;


-- ════════════════════════════════════════════════
-- 11. GLAZBA I INSTRUMENTI
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'glazba';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('glz-gitare',            'Gitare',                                  pid),
    ('glz-bubnjevi',          'Bubnjevi i udaraljke',                   pid),
    ('glz-klavijature',       'Klavijature i klaviri',                  pid),
    ('glz-puhacki',           'Puhački instrumenti',                    pid),
    ('glz-gudacki',           'Gudački instrumenti',                    pid),
    ('glz-tambure',           'Tamburice i folk instrumenti',           pid),
    ('glz-pa-sustavi',        'PA sustavi i ozvučenje',                 pid),
    ('glz-studio',            'Studio oprema',                          pid),
    ('glz-dj',                'Scenska i DJ oprema',                    pid),
    ('glz-ostalo',            'Ostali instrumenti i oprema',            pid);

  SELECT id INTO pid FROM categories WHERE slug = 'glz-gitare';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('glz-git-akusticne',     'Akustične gitare',                       pid),
    ('glz-git-elektricne',    'Električne gitare',                      pid),
    ('glz-git-bas',           'Bas gitare',                             pid),
    ('glz-git-klasicne',      'Klasične gitare',                        pid),
    ('glz-git-pojacala',      'Gitarski pojačala i efekti',            pid),
    ('glz-git-pribor',        'Pribor za gitare',                       pid);

  SELECT id INTO pid FROM categories WHERE slug = 'glz-pa-sustavi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('glz-pa-zvucnici',       'Zvučnici aktivni i pasivni',            pid),
    ('glz-pa-mixeri',         'Mixeri',                                 pid),
    ('glz-pa-mikrofoni',      'Mikrofoni',                              pid),
    ('glz-pa-pojacala',       'Pojačala za instrumente',               pid);

  SELECT id INTO pid FROM categories WHERE slug = 'glz-studio';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('glz-st-audio-suc',      'Audio sučelja',                         pid),
    ('glz-st-monitori',       'Studio monitori',                        pid),
    ('glz-st-midi',           'MIDI kontroleri',                        pid),
    ('glz-st-snimacke',       'Snimačke kartice',                      pid);
END $$;


-- ════════════════════════════════════════════════
-- 12. LITERATURA I MEDIJI
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'literatura';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('lit-beletristika',      'Knjige – Beletristika',                  pid),
    ('lit-strucna',           'Knjige – Stručna literatura',            pid),
    ('lit-djecje',            'Knjige – Dječje i školske',              pid),
    ('lit-antikvarne',        'Antikvarne i stare knjige',              pid),
    ('lit-casopisi',          'Časopisi i magazini',                    pid),
    ('lit-stripovi',          'Stripovi i manga',                       pid),
    ('lit-filmovi',           'Filmovi i serije (DVD/Blu-ray)',         pid),
    ('lit-glazba-mediji',     'Glazba (CD, vinil, kasete)',             pid);

  SELECT id INTO pid FROM categories WHERE slug = 'lit-beletristika';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('lit-bel-romani',        'Romani i kratke priče',                  pid),
    ('lit-bel-kriminalci',    'Kriminalci i trileri',                   pid),
    ('lit-bel-scifi',         'Science fiction i fantasy',              pid),
    ('lit-bel-humor',         'Humor i satira',                         pid),
    ('lit-bel-ljubavni',      'Ljubavni romani',                        pid),
    ('lit-bel-horror',        'Horror',                                 pid),
    ('lit-bel-povijesni',     'Povijesni romani',                       pid);
END $$;


-- ════════════════════════════════════════════════
-- 13. VIDEO IGRE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'videoigre';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vig-playstation',       'PlayStation',                            pid),
    ('vig-xbox',              'Xbox',                                   pid),
    ('vig-nintendo',          'Nintendo',                               pid),
    ('vig-pc',                'PC igre',                                pid),
    ('vig-retro',             'Retro igre i konzole',                   pid),
    ('vig-gaming-oprema',     'Gaming oprema',                          pid);

  SELECT id INTO pid FROM categories WHERE slug = 'vig-playstation';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vig-ps5',               'PS5 – igre i oprema',                    pid),
    ('vig-ps4',               'PS4 – igre i oprema',                    pid),
    ('vig-ps3',               'PS3 i stariji',                          pid);

  SELECT id INTO pid FROM categories WHERE slug = 'vig-gaming-oprema';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('vig-gop-gamepadovi',    'Gamepadovi i kontroleri',                pid),
    ('vig-gop-mis-tipk',      'Gaming miševi i tipkovnice',             pid),
    ('vig-gop-slusalice',     'Gaming slušalice',                       pid),
    ('vig-gop-vr',            'VR oprema',                              pid);
END $$;


-- ════════════════════════════════════════════════
-- 14. ŽIVOTINJE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'zivotinje';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ziv-psi',               'Psi',                                    pid),
    ('ziv-macke',             'Mačke',                                  pid),
    ('ziv-ptice',             'Ptice i papige',                        pid),
    ('ziv-glodavci',          'Glodavci (zečevi, zamorci, hrčci...)',  pid),
    ('ziv-ribe',              'Ribe i akvaristika',                     pid),
    ('ziv-terariji',          'Terariji i gmizavci',                   pid),
    ('ziv-konji',             'Konji',                                  pid),
    ('ziv-domace',            'Domaće životinje (krave, svinje, koze, ovce, perad...)', pid),
    ('ziv-oprema',            'Oprema za životinje',                   pid),
    ('ziv-udoml-psi',         'Udomljavanje – psi',                    pid),
    ('ziv-udoml-macke',       'Udomljavanje – mačke',                  pid),
    ('ziv-udoml-ostalo',      'Udomljavanje – ostalo',                 pid);

  SELECT id INTO pid FROM categories WHERE slug = 'ziv-oprema';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ziv-opr-hrana-psi',     'Hrana za pse',                          pid),
    ('ziv-opr-hrana-macke',   'Hrana za mačke',                        pid),
    ('ziv-opr-hrana-ostale',  'Hrana za ostale životinje',             pid),
    ('ziv-opr-ovratnici',     'Ovratnici, povodci i pojasi',           pid),
    ('ziv-opr-kucice',        'Kućice, kavezi i nosiljke',             pid),
    ('ziv-opr-igracke',       'Igračke za kućne ljubimce',            pid),
    ('ziv-opr-njega',         'Njega i higijena',                      pid),
    ('ziv-opr-veterinar',     'Veterinarski pribor',                   pid);
END $$;


-- ════════════════════════════════════════════════
-- 15. HRANA I PIĆE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'hrana';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('hran-biljni',           'Biljni proizvodi',                      pid),
    ('hran-dezerti',          'Dezerti i slastice',                    pid),
    ('hran-pica',             'Pića',                                  pid),
    ('hran-zivotinjski',      'Životinjski proizvodi',                 pid),
    ('hran-mlijecni',         'Mliječni proizvodi',                    pid),
    ('hran-paketi',           'Paketi proizvoda',                      pid),
    ('hran-prerada',          'Prerada hrane',                         pid),
    ('hran-ulja-zacini',      'Ulja i začini',                        pid);

  SELECT id INTO pid FROM categories WHERE slug = 'hran-biljni';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('hran-bil-brasna',       'Brašna',                                pid),
    ('hran-bil-povrce',       'Povrće',                                pid),
    ('hran-bil-voce',         'Voće',                                  pid),
    ('hran-bil-ostalo',       'Ostali biljni proizvodi',               pid);

  SELECT id INTO pid FROM categories WHERE slug = 'hran-dezerti';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('hran-dez-dzem',         'Džem i pekmez',                         pid),
    ('hran-dez-grickalice',   'Grickalice',                            pid),
    ('hran-dez-kolaci',       'Kolači i torte',                        pid),
    ('hran-dez-ostalo',       'Ostali slatkiši',                       pid);

  SELECT id INTO pid FROM categories WHERE slug = 'hran-pica';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('hran-pic-sokovi',       'Sokovi',                                pid),
    ('hran-pic-kafa',         'Kafa',                                  pid),
    ('hran-pic-alkohol',      'Ostala alkoholna pića',                 pid),
    ('hran-pic-piva',         'Piva',                                  pid),
    ('hran-pic-rakije',       'Rakije',                                pid),
    ('hran-pic-vina',         'Vina',                                  pid),
    ('hran-pic-cajevi',       'Čajevi',                                pid),
    ('hran-pic-ostalo',       'Ostalo',                                pid);

  SELECT id INTO pid FROM categories WHERE slug = 'hran-zivotinjski';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('hran-ziv-jaja',         'Jaja',                                  pid),
    ('hran-ziv-masti',        'Masti',                                 pid),
    ('hran-ziv-med',          'Med i proizvodi od meda',               pid),
    ('hran-ziv-meso',         'Meso i mesni proizvodi',                pid),
    ('hran-ziv-ribe',         'Ribe i morska hrana',                   pid),
    ('hran-ziv-ostalo',       'Ostalo',                                pid);
END $$;


-- ════════════════════════════════════════════════
-- 16. STROJEVI I ALATI
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'strojevi';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('str-rucni-alati',       'Ručni alati',                          pid),
    ('str-elektricni-alati',  'Električni alati',                     pid),
    ('str-gradev-strojevi',   'Građevinski strojevi',                 pid),
    ('str-poljopriv',         'Poljoprivredni strojevi',              pid),
    ('str-vrtni',             'Vrtni strojevi',                       pid),
    ('str-viljuskari',        'Viljuškari i manipulacijska oprema',   pid),
    ('str-industrijski',      'Industrijski i prerađivački strojevi', pid),
    ('str-ostalo',            'Ostali strojevi i alati',              pid);

  SELECT id INTO pid FROM categories WHERE slug = 'str-gradev-strojevi';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('str-grd-bageri',        'Mini bageri',                          pid),
    ('str-grd-utovarivaci',   'Utovarivači',                         pid),
    ('str-grd-dizalice',      'Dizalice i platforme',                pid),
    ('str-grd-asfalt',        'Asfalt strojevi',                     pid),
    ('str-grd-betonijer',     'Betonske miješalice',                 pid),
    ('str-grd-vibracijske',   'Vibracijske ploče',                   pid),
    ('str-grd-kompresori',    'Kompresori veliki',                   pid),
    ('str-grd-dijelovi',      'Dijelovi građevinskih strojeva',      pid);

  SELECT id INTO pid FROM categories WHERE slug = 'str-poljopriv';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('str-pol-traktori',      'Traktori',                             pid),
    ('str-pol-kombajni',      'Kombajni',                             pid),
    ('str-pol-prikljucci',    'Priključci za traktor (plug, tanjurača, roto tiller...)', pid),
    ('str-pol-sprice',        'Šprice i atomizeri',                   pid),
    ('str-pol-kosilice',      'Kosilice traktorske',                  pid),
    ('str-pol-cistijerne',    'Cistijerne i cisterne za navodnjavanje',pid),
    ('str-pol-ostalo',        'Ostala agrarna mehanizacija',          pid);
END $$;


-- ════════════════════════════════════════════════
-- 17. POSLOVI
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'poslovi';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('pos-it',                'IT i telekomunikacije',               pid),
    ('pos-gradevinarstvo',    'Građevinarstvo i geodezija',          pid),
    ('pos-promet',            'Promet, logistika i špedicija',       pid),
    ('pos-turizam',           'Turizam i ugostiteljstvo',            pid),
    ('pos-zdravstvo',         'Zdravstvo i farmacija',               pid),
    ('pos-obrazovanje',       'Obrazovanje i nauka',                 pid),
    ('pos-financije',         'Financije i računovodstvo',           pid),
    ('pos-marketing',         'Marketing i PR',                      pid),
    ('pos-prodaja',           'Prodaja i komercijala',               pid),
    ('pos-administracija',    'Administracija i HR',                 pid),
    ('pos-poljoprivreda',     'Poljoprivreda i šumarstvo',           pid),
    ('pos-elektrotehnika',    'Elektrotehnika i strojarstvo',        pid),
    ('pos-tekstil',           'Tekstilna industrija',                pid),
    ('pos-sigurnost',         'Sigurnost i zaštita',                 pid),
    ('pos-ostali',            'Ostali poslovi',                      pid);
END $$;


-- ════════════════════════════════════════════════
-- 18. USLUGE
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'usluge';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('usl-vozila',            'Servisiranje vozila',                 pid),
    ('usl-gradevinske',       'Građevinske usluge',                  pid),
    ('usl-it',                'IT usluge',                           pid),
    ('usl-ljepota',           'Ljepota i njega',                     pid),
    ('usl-edukacija',         'Edukacija i poduke',                  pid),
    ('usl-transport',         'Transport i selidbe',                 pid),
    ('usl-ciscenje',          'Čišćenje i održavanje',               pid),
    ('usl-dizajn',            'Dizajn, tisak i fotografija',         pid),
    ('usl-pravne',            'Pravne i financijske usluge',         pid),
    ('usl-iznajmljivanje',    'Iznajmljivanje vozila i strojeva',    pid),
    ('usl-event',             'Event, vjenčanja i zabava',           pid),
    ('usl-ljubimci',          'Kućni ljubimci – usluge',            pid),
    ('usl-ostale',            'Ostale usluge',                       pid);

  SELECT id INTO pid FROM categories WHERE slug = 'usl-vozila';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('usl-voz-mehanicар',     'Automehaničar',                       pid),
    ('usl-voz-elektricar',    'Autoelektričar',                      pid),
    ('usl-voz-limar',         'Autolimar',                           pid),
    ('usl-voz-pranje',        'Pranje i detailing',                  pid),
    ('usl-voz-klima',         'Klima servis',                        pid),
    ('usl-voz-vulkanizer',    'Vulkanizer',                          pid),
    ('usl-voz-pregled',       'Tehnički pregled i registracija',    pid);

  SELECT id INTO pid FROM categories WHERE slug = 'usl-gradevinske';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('usl-grd-zidanje',       'Zidanje i fasade',                    pid),
    ('usl-grd-elektro',       'Elektroinstalacije',                  pid),
    ('usl-grd-vodo',          'Vodoinstalacije',                     pid),
    ('usl-grd-grijanje',      'Grijanje i klima montaža',            pid),
    ('usl-grd-pod',           'Podopolaganje',                       pid),
    ('usl-grd-keramicari',    'Keramičari',                          pid),
    ('usl-grd-moleri',        'Moleri',                              pid),
    ('usl-grd-stolarija',     'Stolarija i PVC',                     pid),
    ('usl-grd-krov',          'Krovopokrivači',                      pid),
    ('usl-grd-arhitektura',   'Arhitektura i projektovanje',         pid),
    ('usl-grd-adaptacije',    'Adaptacije i renovacije',             pid);

  SELECT id INTO pid FROM categories WHERE slug = 'usl-edukacija';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('usl-edu-instrukcije',   'Instrukcije (škola i faks)',          pid),
    ('usl-edu-jezicni',       'Jezični tečajevi',                    pid),
    ('usl-edu-it',            'IT kursevi',                          pid),
    ('usl-edu-glazbena',      'Glazbena škola',                      pid),
    ('usl-edu-autoskola',     'Autoškola',                           pid),
    ('usl-edu-sportska',      'Sportska škola',                      pid);
END $$;


-- ════════════════════════════════════════════════
-- 19. UMJETNOST I KOLEKCIONARSTVO
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'umjetnost';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-slike',             'Slike i skulpture',                   pid),
    ('umj-fotografije',       'Fotografije i posteri',               pid),
    ('umj-antikviteti',       'Antikviteti i starine',               pid),
    ('umj-numizmatika',       'Numizmatika',                         pid),
    ('umj-filatelija',        'Filatelija (marke i dopisnice)',       pid),
    ('umj-militarija',        'Militarija',                          pid),
    ('umj-modelarstvo',       'Modelarstvo',                         pid),
    ('umj-razglednice',       'Razglednice i stare fotografije',     pid),
    ('umj-ostale',            'Ostale kolekcije',                    pid);

  SELECT id INTO pid FROM categories WHERE slug = 'umj-slike';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-sl-ulje',           'Ulje na platnu',                      pid),
    ('umj-sl-akvareli',       'Akvareli',                            pid),
    ('umj-sl-grafike',        'Grafike',                             pid),
    ('umj-sl-digitalna',      'Digitalna umjetnost – print',         pid),
    ('umj-sl-skulpture',      'Skulpture',                           pid);

  SELECT id INTO pid FROM categories WHERE slug = 'umj-antikviteti';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-ant-namjestaj',     'Antikni namještaj',                   pid),
    ('umj-ant-porculan',      'Porculan i keramika',                 pid),
    ('umj-ant-satovi',        'Stari satovi',                        pid),
    ('umj-ant-ostale',        'Ostale starine',                      pid);

  SELECT id INTO pid FROM categories WHERE slug = 'umj-numizmatika';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-num-kovanice',      'Novčići (kovanice)',                  pid),
    ('umj-num-novcanice',     'Novčanice',                           pid),
    ('umj-num-medalje',       'Medalje i bedževi',                   pid);

  SELECT id INTO pid FROM categories WHERE slug = 'umj-militarija';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-mil-uniforme',      'Uniforme i odjeća',                   pid),
    ('umj-mil-odlikovanja',   'Odlikovanja i medalje',               pid),
    ('umj-mil-oruzje',        'Oružje (starinski – muzejski)',       pid),
    ('umj-mil-dokumenti',     'Fotografije i dokumenti',             pid);

  SELECT id INTO pid FROM categories WHERE slug = 'umj-modelarstvo';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('umj-mod-staticni',      'Statični modeli',                     pid),
    ('umj-mod-rc',            'RC modeli (automobili, zrakoplovi)',  pid),
    ('umj-mod-vlakovi',       'Vlakovi i željeznica',               pid);
END $$;


-- ════════════════════════════════════════════════
-- 20. OSTALO
-- ════════════════════════════════════════════════
DO $$
DECLARE pid UUID;
BEGIN
  SELECT id INTO pid FROM categories WHERE slug = 'ostalo';

  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ost-karte',             'Karte i ulaznice',                    pid),
    ('ost-kozmetika',         'Kozmetika i ljepota',                 pid),
    ('ost-medicinska',        'Medicinska pomagala',                 pid),
    ('ost-vjencanja',         'Vjenčanja',                          pid),
    ('ost-zlato',             'Investicijsko zlato i srebro',        pid),
    ('ost-grobna',            'Grobna mjesta',                       pid),
    ('ost-poklanjam',         'Poklanjam (besplatno)',               pid),
    ('ost-sve-ostalo',        'Sve ostalo',                          pid);

  SELECT id INTO pid FROM categories WHERE slug = 'ost-karte';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ost-kar-koncerti',      'Koncerti',                            pid),
    ('ost-kar-sport',         'Sport',                               pid),
    ('ost-kar-kazaliste',     'Kazalište i opera',                   pid),
    ('ost-kar-festivali',     'Festivali',                           pid);

  SELECT id INTO pid FROM categories WHERE slug = 'ost-kozmetika';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ost-koz-parfemi',       'Parfemi',                             pid),
    ('ost-koz-njega-lica',    'Njega lica i tijela',                pid),
    ('ost-koz-sminka',        'Šminka i boje',                      pid),
    ('ost-koz-njega-kose',    'Njega kose',                         pid),
    ('ost-koz-salon',         'Profesionalna salon oprema',          pid);

  SELECT id INTO pid FROM categories WHERE slug = 'ost-vjencanja';
  INSERT INTO categories (slug, name, parent_category_id) VALUES
    ('ost-vjenc-vjencanice',  'Vjenčanice',                          pid),
    ('ost-vjenc-odijela',     'Odijela',                             pid),
    ('ost-vjenc-dekoracije',  'Dekoracije',                          pid),
    ('ost-vjenc-pozivnice',   'Pozivnice i tisak',                   pid);
END $$;


-- ─── Provjera ─────────────────────────────────────────────
-- SELECT COUNT(*) FROM categories;  -- Treba biti ~300+
-- SELECT name, slug FROM categories WHERE parent_category_id IS NULL ORDER BY name;
